import type { LabItem } from '../../types/lab';

export interface AiRequestOptions {
  lab: LabItem;
  userMessage: string;
  terminalLogs: string[];
  deepInfraApiKey?: string;
  deepInfraModel?: string;
  geminiApiKey?: string;
}

export const DEFAULT_DEEPINFRA_MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo';

export const DEEPINFRA_AVAILABLE_MODELS = [
  { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', label: 'Meta Llama 3.3 70B Turbo (Önerilen // Hızlı & Güçlü)' },
  { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', label: 'Qwen 2.5 Coder 32B (Yazılım & Exploit Uzmanı)' },
  { id: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek-V3 (Gelişmiş MoE Mantık)' },
  { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct', label: 'Meta Llama 3.1 8B (Ultra Hızlı)' }
];

export async function askAiMentor(options: AiRequestOptions): Promise<string> {
  const { lab, userMessage, terminalLogs, deepInfraApiKey, deepInfraModel, geminiApiKey } = options;

  // 1. Check DeepInfra API Key (Environment or User Stored)
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
      const response = await callDeepInfraApi(effectiveDeepInfraKey, effectiveModel, lab, userMessage, terminalLogs);
      if (response) return response;
    } catch (err: any) {
      console.warn('[AI Mentor] DeepInfra API çağrısı başarısız, alternatif motora geçiliyor:', err);
    }
  }

  // 2. Check Google Gemini API Key (Fallback)
  const effectiveGeminiKey = (
    geminiApiKey ||
    (typeof window !== 'undefined' ? localStorage.getItem('hackerarena_gemini_key') : '') ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  ).trim();

  if (effectiveGeminiKey && effectiveGeminiKey.length > 10) {
    try {
      const response = await callGeminiApi(effectiveGeminiKey, lab, userMessage, terminalLogs);
      if (response) return response;
    } catch (err: any) {
      console.warn('[AI Mentor] Gemini API çağrısı başarısız, yerleşik motora geçiliyor:', err);
    }
  }

  // 3. Built-in Offline Socratic Security Engine (Zero-Cost Instant Fallback)
  return generateLocalSocraticResponse(lab, userMessage, terminalLogs);
}

/**
 * Call DeepInfra OpenAI-compatible Chat Completions API
 */
async function callDeepInfraApi(
  apiKey: string,
  model: string,
  lab: LabItem,
  userMessage: string,
  _terminalLogs: string[]
): Promise<string> {
  const systemInstruction = `Sen "SiberAdam" platformunda görev yapan, kıdemli bir siber güvenlik operasyon lideri ve yapay zeka mentorusun (CyberAI Operator).
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

  const payload = {
    model: model || DEFAULT_DEEPINFRA_MODEL,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.6,
    max_tokens: 1000
  };

  const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepInfra HTTP ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  const reply = json.choices?.[0]?.message?.content;
  return reply || 'DeepInfra modelinden yanıt alınamadı.';
}

/**
 * Call Gemini API (Fallback)
 */
async function callGeminiApi(
  apiKey: string,
  lab: LabItem,
  userMessage: string,
  _terminalLogs: string[]
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const systemInstruction = `Sen SiberAdam platformunun yapay zeka mentorusun.
Laboratuvar: "${lab.title}" (${lab.category}, ${lab.difficulty}).
Hedef: ${lab.objective}
Öğrenciye doğrudan cevabı kopyala-yapıştır vermek yerine Sokratik yöntemle keşif adımlarını öğret.`;

  const payload = {
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
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.statusText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || 'Yanıt alınamadı.';
}

/**
 * Local Offline Zero-Cost Socratic Security Engine
 */
function generateLocalSocraticResponse(
  lab: LabItem,
  msg: string,
  _terminalLogs: string[]
): string {
  const query = msg.toLowerCase();

  if (query.includes('nereden') || query.includes('başla') || query.includes('start') || query.includes('nasıl')) {
    return `Selam Operatör! 🛡️ **${lab.title}** güvenlik bulmacasındasın.

**Adım Adım Metodoloji:**
1. **İstek ve Yanıtları İncele:** Adres çubuğundaki parametreleri ve DevTools Network sekmesini açarak sunucunun hangi başlıkları (headers) ve durum kodlarını (status code) döndürdüğünü gözlemle.
2. **Girdi Noktalarını Test Et:** Uygulamanın parametrelerine özel karakterler (\`'\`, \`"\`, \`<script>\`, \`/\`, \`--\`) göndererek hata mesajı veya yansıma (reflection) üretmeye çalış.
3. **Zafiyet & Filtre:** ${lab.hints[0]?.content || lab.description.slice(0, 150)}

Hangi aşamada takıldın? Birlikte zafiyet mekanizmasını irdeleyelim!`;
  }

  if (query.includes('mantık') || query.includes('nedir') || query.includes('teori') || query.includes('açık')) {
    return `Bu bulmacada odaklandığımız güvenlik açığı: **${lab.category}** (${lab.tags.join(', ')}).

**Mekanizma:**
${lab.description}

**Neden Tehlikeli?**
${lab.solutionExplanation}

Bu açığı keşfetmek için sanal tarayıcıdaki form alanlarına veya HTTP isteklerine dikkatli parametreler göndererek uygulamanın tepkisini incelemelisin.`;
  }

  if (query.includes('bypass') || query.includes('filtre') || query.includes('atlat') || query.includes('waf')) {
    if (lab.category === 'XSS') {
      return `XSS filtrelerini atlatırken şu alternatif teknikleri düşünebilirsin:
1. **Tag Alternatifleri:** Eğer \`<script>\` engelleniyorsa \`<svg onload=alert(1)>\`, \`<img src=x onerror=alert(1)>\` veya \`<body onload=alert(1)>\` dene.
2. **Attribute Breakout:** Eğer girdi bir input içine düşüyorsa önce tırnağı kapat: \`" onfocus="alert(1)" autofocus="\`.
3. **Event Handler Çeşitliliği:** \`onload\`, \`onerror\`, \`onfocus\`, \`onmouseover\`.

Tarayıcı DevTools sekmesinden payload'unun DOM'da nasıl durduğunu kontrol ettin mi?`;
    }
    if (lab.category === 'SQLi') {
      return `SQL Injection filtrelerinde:
1. **Yorum Karakterleri:** \`--\`, \`/* ... */\`, \`#\`.
2. **Mantıksal Operatörler:** \`' OR '1'='1\`, \`' OR 1=1 --\`.
3. **Kolon Sayısı Keşfi:** Orijinal sorgunun kolon sayısını sırasıyla \`' ORDER BY 1--\`, \`' ORDER BY 2--\` ile test et.`;
    }
  }

  if (query.includes('ipucu') || query.includes('hint') || query.includes('çözüm')) {
    const hint2 = lab.hints[1]?.content || lab.hints[0]?.content;
    return `🎯 **Socratic İpucu:**\n\n${hint2}\n\n*Not: Amacımız sadece bayrağı (flag) almak değil, tarayıcı ve terminal arasındaki veri akışını okuma refleksini kazanmak!*`;
  }

  return `Harika bir soru. **${lab.title}** için şu ipucunu göz önünde bulundur:

${lab.hints[0]?.content}

Hedef web uygulamasında parametreleri kurcalarken tarayıcı DevTools sekmesinde giden istekleri ve Terminaldeki yanıtları karşılaştır. DeepInfra API anahtarı ekleyerek Llama 3.3 70B veya Qwen 2.5 Coder ile canlı diyalog kurabilirsin!`;
}
