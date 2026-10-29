import type { LabItem } from '../../types/lab';
import type { UserProfile } from '../../types/user';
import {
  resolveAuthenticatedAiRequest,
  ApiClientAuthError,
  DEFAULT_DEEPINFRA_MODEL
} from '../api/apiClient';

export { ApiClientAuthError, DEFAULT_DEEPINFRA_MODEL };

export interface AiRequestOptions {
  lab: LabItem;
  userMessage: string;
  terminalLogs: string[];
  deepInfraApiKey?: string;
  deepInfraModel?: string;
  geminiApiKey?: string;
  currentUser?: UserProfile | null;
}

export const DEEPINFRA_AVAILABLE_MODELS = [
  { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', label: 'Meta Llama 3.3 70B Turbo (Önerilen // Hızlı & Güçlü)' },
  { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', label: 'Qwen 2.5 Coder 32B (Yazılım & Exploit Uzmanı)' },
  { id: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek-V3 (Gelişmiş MoE Mantık)' },
  { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct', label: 'Meta Llama 3.1 8B (Ultra Hızlı)' }
];

/**
 * Resolves AI Mentor requests exclusively through the authenticated API Client
 * (`resolveAuthenticatedAiRequest`). Throws `ApiClientAuthError` if the user
 * does not have a verified operator session.
 */
export async function askAiMentor(options: AiRequestOptions): Promise<string> {
  const result = await resolveAuthenticatedAiRequest(options, generateLocalSocraticResponse);
  return result.reply;
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

Hedef web uygulamasında parametreleri kurcalarken tarayıcı DevTools sekmesinde giden istekleri ve Terminaldeki yanıtları karşılaştır. Platform ayarlarından yapay zeka modelini yapılandırabilir veya yerleşik akıllı mentorlukla devam edebilirsin!`;
}
