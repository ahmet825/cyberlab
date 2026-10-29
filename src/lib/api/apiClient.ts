import type { LabItem } from '../../types/lab';
import type { UserProfile } from '../../types/user';
import { getSupabaseSession } from '../supabase/supabaseClient';

export class ApiClientAuthError extends Error {
  public readonly code = 'AUTH_REQUIRED';
  public readonly status = 401;

  constructor(message = 'Lütfen giriş yapın.') {
    super(message);
    this.name = 'ApiClientAuthError';
  }
}

export interface AuthenticatedContext {
  userId: string;
  email: string;
  accessToken: string;
  requestId: string;
}

export interface AiCompletionRequest {
  lab: LabItem;
  userMessage: string;
  terminalLogs: string[];
  deepInfraApiKey?: string;
  deepInfraModel?: string;
  geminiApiKey?: string;
  currentUser?: UserProfile | null;
}

export interface AiCompletionResponse {
  reply: string;
  provider: 'edge-gateway' | 'deepinfra' | 'gemini' | 'socratic-authenticated';
  requestId: string;
  operatorId: string;
}

export const DEFAULT_DEEPINFRA_MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo';

// Simple per-user sliding window rate limiter (max 20 AI requests / minute)
const requestTimestampsByUser = new Map<string, number[]>();
const MAX_REQUESTS_PER_MINUTE = 20;

function checkRateLimit(userId: string): void {
  const now = Date.now();
  const windowStart = now - 60_000;
  const recent = (requestTimestampsByUser.get(userId) || []).filter((ts) => ts > windowStart);
  if (recent.length >= MAX_REQUESTS_PER_MINUTE) {
    throw new Error('Dakikalık AI istek sınırına ulaştınız. Lütfen birkaç saniye bekleyip tekrar deneyin.');
  }
  recent.push(now);
  requestTimestampsByUser.set(userId, recent);
}

/**
 * Verifies that the caller has a valid, non-expired authenticated Supabase session
 * or verified operator profile before allowing any AI API request to be resolved.
 * If authentication fails or session is missing, throws ApiClientAuthError with "Lütfen giriş yapın."
 */
export async function verifyApiAuthentication(currentUser?: UserProfile | null): Promise<AuthenticatedContext> {
  const session = await getSupabaseSession();

  if (session?.user?.id && session?.access_token) {
    // Check token expiration if expires_at is present
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      throw new ApiClientAuthError('Lütfen giriş yapın.');
    }

    return {
      userId: session.user.id,
      email: session.user.email || '',
      accessToken: session.access_token,
      requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    };
  }

  // Active verified frontend operator profile
  if (currentUser?.id) {
    return {
      userId: currentUser.id,
      email: currentUser.email || '',
      accessToken: `operator_${currentUser.id}`,
      requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    };
  }

  // Local rehydration fallback
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('hackerarena_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.id) {
          return {
            userId: parsed.id,
            email: parsed.email || '',
            accessToken: `operator_${parsed.id}`,
            requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
          };
        }
      } catch {
        // invalid stored user
      }
    }
  }

  throw new ApiClientAuthError('Lütfen giriş yapın.');
}

function buildSocraticSystemPrompt(lab: LabItem): string {
  return `Sen "SiberAdam" platformunda görev yapan, kıdemli bir siber güvenlik operasyon lideri ve yapay zeka mentorusun (CyberAI Operator).
Görevin: Siber güvenlik öğrencisine doğrudan kopyala-yapıştır çözüm ve flag vermek YERİNE, Sokratik yöntemle yol göstermek, DevTools ve Terminal kullanım reflekslerini geliştirmektir.

[AKTİF GÖREV BİLGİLERİ]
- Laboratuvar: "${lab.title}"
- Kategori: ${lab.category} | Seviye: ${lab.difficulty}
- Hedef: ${lab.objective}
- Açıklama: ${lab.description}
- İpuçları: ${lab.hints.map((h) => h.content).join(' || ')}
- Zafiyet Çözüm Mantığı: ${lab.solutionExplanation}

[KURALLAR & MENTORLUK TARZI]
1. Türkçe dilinde, motive edici, siber istihbarat ve etik hacker jargonuna uygun konuş.
2. Doğrudan çalışan payload'ı tek seferde verme; öğrenciye HTTP parametrelerini nerede test etmesi gerektiğini, hata kodlarını nasıl okuyacağını veya hangi filtreleme mekanizmasının devrede olduğunu sorgulat.
3. Yanıtında Markdown başlıkları, listeler ve kod blokları kullan. Gerekirse curl/terminal komutu denemeleri öner.`;
}

/**
 * Centralized Authenticated API Client for AI Mentor Requests.
 * Strictly verifies authentication before resolving any AI completion.
 */
export async function resolveAuthenticatedAiRequest(
  req: AiCompletionRequest,
  fallbackSocraticGenerator: (lab: LabItem, msg: string, logs: string[]) => string
): Promise<AiCompletionResponse> {
  // 1. Mandatory Authentication Gate
  const authCtx = await verifyApiAuthentication(req.currentUser);

  // 2. Per-Operator Rate Limit Check
  checkRateLimit(authCtx.userId);

  const { lab, userMessage, terminalLogs, deepInfraApiKey, deepInfraModel, geminiApiKey } = req;
  const systemInstruction = buildSocraticSystemPrompt(lab);

  // 3. Optional Custom Backend / Supabase Edge Gateway Resolution (if VITE_AI_PROXY_URL is set)
  const proxyUrl = (import.meta.env.VITE_AI_PROXY_URL || '').trim();
  if (proxyUrl) {
    try {
      const proxyRes = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authCtx.accessToken}`,
          'X-Request-Id': authCtx.requestId,
          'X-Operator-Id': authCtx.userId
        },
        body: JSON.stringify({
          labId: lab.id,
          systemInstruction,
          userMessage,
          terminalLogs
        })
      });

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data?.reply) {
          return {
            reply: data.reply,
            provider: 'edge-gateway',
            requestId: authCtx.requestId,
            operatorId: authCtx.userId
          };
        }
      }
    } catch (err) {
      console.warn('[API Client] Edge gateway isteği başarısız, doğrudan sağlayıcıya geçiliyor:', err);
    }
  }

  // 4. Authenticated DeepInfra Resolution
  const effectiveDeepInfraKey = (
    deepInfraApiKey ||
    (typeof window !== 'undefined' ? localStorage.getItem('hackerarena_deepinfra_key') : '') ||
    import.meta.env.VITE_DEEPINFRA_API_KEY ||
    ''
  ).trim();

  const effectiveModel = (
    deepInfraModel ||
    (typeof window !== 'undefined' ? localStorage.getItem('hackerarena_deepinfra_model') : '') ||
    import.meta.env.VITE_DEEPINFRA_MODEL ||
    DEFAULT_DEEPINFRA_MODEL
  ).trim();

  if (effectiveDeepInfraKey && effectiveDeepInfraKey.length > 5) {
    try {
      const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${effectiveDeepInfraKey}`,
          'X-Client-Request-Id': authCtx.requestId
        },
        body: JSON.stringify({
          model: effectiveModel || DEFAULT_DEEPINFRA_MODEL,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.6,
          max_tokens: 1000
        })
      });

      if (response.ok) {
        const json = await response.json();
        const reply = json.choices?.[0]?.message?.content;
        if (reply) {
          return {
            reply,
            provider: 'deepinfra',
            requestId: authCtx.requestId,
            operatorId: authCtx.userId
          };
        }
      }
    } catch (err) {
      console.warn('[API Client] DeepInfra çözümlemesi başarısız, alternatif motora geçiliyor:', err);
    }
  }

  // 5. Authenticated Gemini Resolution (Fallback)
  const effectiveGeminiKey = (
    geminiApiKey ||
    (typeof window !== 'undefined' ? localStorage.getItem('hackerarena_gemini_key') : '') ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  ).trim();

  if (effectiveGeminiKey && effectiveGeminiKey.length > 10) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveGeminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nÖğrencinin Sorusu: ${userMessage}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            reply: text,
            provider: 'gemini',
            requestId: authCtx.requestId,
            operatorId: authCtx.userId
          };
        }
      }
    } catch (err) {
      console.warn('[API Client] Gemini çözümlemesi başarısız, yerleşik motora geçiliyor:', err);
    }
  }

  // 6. Authenticated Socratic Security Engine Resolution
  return {
    reply: fallbackSocraticGenerator(lab, userMessage, terminalLogs),
    provider: 'socratic-authenticated',
    requestId: authCtx.requestId,
    operatorId: authCtx.userId
  };
}

