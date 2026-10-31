export interface SecurityExternalLink {
  label: string;
  url: string;
  provider: 'OWASP' | 'CWE' | 'PortSwigger' | 'NIST' | 'RFC';
  badgeColor?: string;
  description: string;
}

export interface LabReferenceEntry {
  labId: string;
  externalLinks: SecurityExternalLink[];
  relatedLabIds: string[];
}

/**
 * Static authoritative security references (OWASP, CWE, PortSwigger)
 * and related internal lab linkages for every challenge in the platform.
 */
export const LAB_SECURITY_REFERENCES: Record<string, LabReferenceEntry> = {
  // --- TIER 1: APPRENTICE ---
  'xss-stored': {
    labId: 'xss-stored',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP Top 10 - A03:2021 Injection (XSS)',
        url: 'https://owasp.org/Top10/A03_2021-Injection/',
        description: 'Kalıcı (Stored) ve yansıyan XSS zafiyet standartları ve kod düzeltme rehberi.'
      },
      {
        provider: 'CWE',
        label: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
        url: 'https://cwe.mitre.org/data/definitions/79.html',
        description: 'Kullanıcı girdisinin HTML içine filtresiz basılması zafiyet tanımı.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: Stored XSS',
        url: 'https://portswigger.net/web-security/cross-site-scripting/stored',
        description: 'Web Security Academy Stored XSS sömürü ve CSP bypass teknikleri.'
      }
    ],
    relatedLabIds: ['csrf-transfer', 'cors-misconfig', 'hotel-full-simulation']
  },

  'sqli-auth-bypass': {
    labId: 'sqli-auth-bypass',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP SQL Injection Prevention Cheat Sheet',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
        description: 'Parametreli sorgular (Prepared Statements) ile SQLi engelleme.'
      },
      {
        provider: 'CWE',
        label: 'CWE-89: SQL Injection',
        url: 'https://cwe.mitre.org/data/definitions/89.html',
        description: 'Veritabanı komut yapısının harici girdiyle manipüle edilmesi.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: SQL Injection Login Bypass',
        url: 'https://portswigger.net/web-security/sql-injection',
        description: 'Kimlik doğrulama atlatma ve UNION tabanlı SQL injection dersleri.'
      }
    ],
    relatedLabIds: ['blind-sqli', 'idor-profile', 'cmd-injection']
  },

  'idor-profile': {
    labId: 'idor-profile',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP Top 10 - A01:2021 Broken Access Control (IDOR/BOLA)',
        url: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
        description: 'Doğrudan nesne referansları ve yetki denetimi atlama zafiyetleri.'
      },
      {
        provider: 'CWE',
        label: 'CWE-639: Authorization Bypass Through User-Controlled Key',
        url: 'https://cwe.mitre.org/data/definitions/639.html',
        description: 'Kullanıcı ID veya parametre değiştirilerek başka kullanıcı verisine erişim.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: Access Control & IDOR',
        url: 'https://portswigger.net/web-security/access-control/idor',
        description: 'IDOR zafiyet tespiti ve çok kullanıcılı yetki matrisi senaryoları.'
      }
    ],
    relatedLabIds: ['hotel-full-simulation', 'jwt-weak-secret', 'sqli-auth-bypass']
  },

  'path-traversal': {
    labId: 'path-traversal',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP Path Traversal & File Inclusion',
        url: 'https://owasp.org/www-community/attacks/Path_Traversal',
        description: 'Dizin atlatma (../) ile sistem dosyalarına yetkisiz okuma koruması.'
      },
      {
        provider: 'CWE',
        label: 'CWE-22: Improper Limitation of a Pathname to a Restricted Directory',
        url: 'https://cwe.mitre.org/data/definitions/22.html',
        description: 'Dot-dot-slash filtreleme eksiklikleri ve chroot zafiyetleri.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: Directory Traversal',
        url: 'https://portswigger.net/web-security/file-path-traversal',
        description: 'Dosya yolu manipülasyonu ve path traversal bypass teknikleri.'
      }
    ],
    relatedLabIds: ['rce-upload', 'ssrf-webhook', 'file-upload-defense']
  },

  'csrf-transfer': {
    labId: 'csrf-transfer',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP Cross-Site Request Forgery Prevention Cheat Sheet',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html',
        description: 'SameSite çerez politikaları ve anti-CSRF token savunması.'
      },
      {
        provider: 'CWE',
        label: 'CWE-352: Cross-Site Request Forgery (CSRF)',
        url: 'https://cwe.mitre.org/data/definitions/352.html',
        description: 'Kullanıcı adına yetkisiz durum değiştiren HTTP istekleri çalıştırma.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: CSRF',
        url: 'https://portswigger.net/web-security/csrf',
        description: 'PoC CSRF exploit oluşturma ve SameSite bypass yöntemleri.'
      }
    ],
    relatedLabIds: ['cors-misconfig', 'xss-stored', 'jwt-weak-secret']
  },

  // --- TIER 2: PRACTITIONER ---
  'ssrf-webhook': {
    labId: 'ssrf-webhook',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP Top 10 - A10:2021 Server-Side Request Forgery (SSRF)',
        url: 'https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/',
        description: 'Bulut metadata servisleri (169.254.169.254) ve iç ağ tarama sızıntıları.'
      },
      {
        provider: 'CWE',
        label: 'CWE-918: Server-Side Request Forgery (SSRF)',
        url: 'https://cwe.mitre.org/data/definitions/918.html',
        description: 'Sunucunun harici URL taleplerini iç ağa yönlendirmesi.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: SSRF',
        url: 'https://portswigger.net/web-security/ssrf',
        description: 'İç ağ port taraması ve cloud IAM credential sızdırma labları.'
      }
    ],
    relatedLabIds: ['cmd-injection', 'path-traversal', 'rce-upload']
  },

  'cors-misconfig': {
    labId: 'cors-misconfig',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP CORS Misconfiguration Cheat Sheet',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Origin_Resource_Sharing_Cheat_Sheet.html',
        description: 'Access-Control-Allow-Origin: * ve dinamik origin yansıtma riskleri.'
      },
      {
        provider: 'CWE',
        label: 'CWE-942: Permissive Cross-domain Policy with Untrusted Domains',
        url: 'https://cwe.mitre.org/data/definitions/942.html',
        description: 'Gevşek CORS politikaları ile kimlikli oturum verisi sızdırma.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: CORS Vulnerabilities',
        url: 'https://portswigger.net/web-security/cors',
        description: 'Origin reflection ve null origin bypass senaryoları.'
      }
    ],
    relatedLabIds: ['csrf-transfer', 'xss-stored', 'jwt-weak-secret']
  },

  'jwt-weak-secret': {
    labId: 'jwt-weak-secret',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP JSON Web Token Cheat Sheet',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html',
        description: 'JWT imza doğrulama, alg:none ve brute-force engelleme rehberi.'
      },
      {
        provider: 'CWE',
        label: 'CWE-347: Improper Verification of Cryptographic Signature',
        url: 'https://cwe.mitre.org/data/definitions/347.html',
        description: 'Zayıf HMAC anahtarları ve imza atlatma açıkları.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: JWT Attacks',
        url: 'https://portswigger.net/web-security/jwt',
        description: 'JWT alg:none, JWK header injection ve key confusion saldırıları.'
      }
    ],
    relatedLabIds: ['idor-profile', 'sqli-auth-bypass', 'hotel-full-simulation']
  },

  'cmd-injection': {
    labId: 'cmd-injection',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP Command Injection Defense',
        url: 'https://owasp.org/www-community/attacks/Command_Injection',
        description: 'Sistem kabuğu (bash/sh) komutlarının ayrıştırılması ve engellenmesi.'
      },
      {
        provider: 'CWE',
        label: 'CWE-78: Improper Neutralization of Special Elements used in an OS Command',
        url: 'https://cwe.mitre.org/data/definitions/78.html',
        description: 'İşletim sistemi komut enjeksiyonu temel zafiyet modeli.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: OS Command Injection',
        url: 'https://portswigger.net/web-security/os-command-injection',
        description: 'Blind ve out-of-band OS command injection teknikleri.'
      }
    ],
    relatedLabIds: ['rce-upload', 'ssrf-webhook', 'sqli-auth-bypass']
  },

  'rce-upload': {
    labId: 'rce-upload',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP File Upload Security Cheat Sheet',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html',
        description: 'MIME kontrolü, Magic Bytes doğrulama ve uzantı allowlist yönetimi.'
      },
      {
        provider: 'CWE',
        label: 'CWE-434: Unrestricted Upload of File with Dangerous Type',
        url: 'https://cwe.mitre.org/data/definitions/434.html',
        description: 'Sunucuya zararlı web shell / executable yükleme açıkları.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: File Upload Vulnerabilities',
        url: 'https://portswigger.net/web-security/file-upload',
        description: 'Web shell ile RCE tetikleme ve path traversal birleştirme.'
      }
    ],
    relatedLabIds: ['file-upload-defense', 'path-traversal', 'cmd-injection']
  },

  // --- TIER 3: EXPERT ---
  'blind-sqli': {
    labId: 'blind-sqli',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP Blind SQL Injection Guide',
        url: 'https://owasp.org/www-community/attacks/Blind_SQL_Injection',
        description: 'Boolean-based ve Time-based kör SQL enjeksiyon analizleri.'
      },
      {
        provider: 'CWE',
        label: 'CWE-89: SQL Injection (Blind / Inference)',
        url: 'https://cwe.mitre.org/data/definitions/89.html',
        description: 'Yanıt süresi ve mantıksal farklar üzerinden veri sızdırma.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: Blind SQL Injection',
        url: 'https://portswigger.net/web-security/sql-injection/blind',
        description: 'Zaman gecikmeli (Time delays) ve şartlı yanıt analizleri.'
      }
    ],
    relatedLabIds: ['sqli-auth-bypass', 'race-condition', 'prototype-pollution']
  },

  'race-condition': {
    labId: 'race-condition',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP Race Conditions in Web Applications',
        url: 'https://owasp.org/www-community/vulnerabilities/Race_Conditions',
        description: 'TOCTOU (Time-of-Check to Time-of-Use) ve paralel işlem zafiyetleri.'
      },
      {
        provider: 'CWE',
        label: 'CWE-362: Concurrent Execution using Shared Resource with Improper Synchronization',
        url: 'https://cwe.mitre.org/data/definitions/362.html',
        description: 'Eşzamanlı isteklerle bakiye çiftleme ve limit atlatma.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: Race Conditions',
        url: 'https://portswigger.net/web-security/race-conditions',
        description: 'Limit-overrun, single-packet attack ve sub-state exploitation.'
      }
    ],
    relatedLabIds: ['blind-sqli', 'desync-smuggling', 'prototype-pollution']
  },

  'prototype-pollution': {
    labId: 'prototype-pollution',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP Prototype Pollution Prevention',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html',
        description: 'Object.prototype manipülasyonu ve Node.js RCE zafiyetleri.'
      },
      {
        provider: 'CWE',
        label: 'CWE-1321: Improperly Controlled Modification of Object Prototype Attributes',
        url: 'https://cwe.mitre.org/data/definitions/1321.html',
        description: '__proto__ ve constructor.prototype enjeksiyon analizi.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: Prototype Pollution',
        url: 'https://portswigger.net/web-security/prototype-pollution',
        description: 'Client-side ve server-side prototype pollution labları.'
      }
    ],
    relatedLabIds: ['desync-smuggling', 'race-condition', 'blind-sqli']
  },

  'desync-smuggling': {
    labId: 'desync-smuggling',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP HTTP Request Smuggling Guide',
        url: 'https://owasp.org/www-community/attacks/HTTP_Request_Smuggling',
        description: 'Frontend / Backend proxy desenkronizasyonu ve header ayrıştırma.'
      },
      {
        provider: 'CWE',
        label: 'CWE-444: Inconsistent Interpretation of HTTP Requests (HTTP Request Smuggling)',
        url: 'https://cwe.mitre.org/data/definitions/444.html',
        description: 'Content-Length ve Transfer-Encoding çakışmaları.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: HTTP Request Smuggling',
        url: 'https://portswigger.net/web-security/request-smuggling',
        description: 'CL.TE ve TE.CL desync ile istek zehirleme ve önbellek ele geçirme.'
      }
    ],
    relatedLabIds: ['prototype-pollution', 'race-condition', 'ssrf-webhook']
  },

  // --- TIER 4: LLM TOP 10 ---
  'prompt-injection': {
    labId: 'prompt-injection',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP Top 10 for LLM - LLM01: Prompt Injection',
        url: 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/',
        description: 'Doğrudan ve dolaylı sistem talimatı ezme (System Prompt Override).'
      },
      {
        provider: 'NIST',
        label: 'NIST AI Risk Management Framework (AI RMF)',
        url: 'https://www.nist.gov/itl/ai-risk-management-framework',
        description: 'Üretken yapay zeka model güvenlik ve güvenilirlik standartları.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: LLM Attacks',
        url: 'https://portswigger.net/web-security/llm-attacks',
        description: 'Büyük dil modellerinde prompt injection ve tool execution riskleri.'
      }
    ],
    relatedLabIds: ['direct-leak', 'rag-poisoning', 'agentic-tool-abuse']
  },

  'direct-leak': {
    labId: 'direct-leak',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP Top 10 for LLM - LLM06: Sensitive Information Disclosure',
        url: 'https://genai.owasp.org/llmrisk/llm06-sensitive-information-disclosure/',
        description: 'Model sistem promptu, API anahtarı ve hassas PII sızıntıları.'
      },
      {
        provider: 'CWE',
        label: 'CWE-200: Exposure of Sensitive Information to an Unauthorized Actor',
        url: 'https://cwe.mitre.org/data/definitions/200.html',
        description: 'LLM bağlam penceresinden veri ve sır ifşası.'
      },
      {
        provider: 'OWASP',
        label: 'OWASP Top 10 for LLM - LLM01: Prompt Injection',
        url: 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/',
        description: 'Sistem promptunu açığa çıkarma payloadları ve savunması.'
      }
    ],
    relatedLabIds: ['prompt-injection', 'rag-poisoning', 'indirect-injection']
  },

  'rag-poisoning': {
    labId: 'rag-poisoning',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP Top 10 for LLM - LLM03: Training Data Poisoning & RAG Supply Chain',
        url: 'https://genai.owasp.org/llmrisk/llm03-training-data-poisoning/',
        description: 'Vektör veri tabanına zararlı chunk enjeksiyonu ve doküman zehirleme.'
      },
      {
        provider: 'NIST',
        label: 'NIST Adversarial Machine Learning Guidelines',
        url: 'https://csrc.nist.gov/pubs/ai/100/2/e2025/final',
        description: 'RAG ve makine öğrenimi boru hatlarında zehirleme saldırıları.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: Indirect Prompt Injection via RAG',
        url: 'https://portswigger.net/web-security/llm-attacks',
        description: 'Güvenilmeyen harici kaynaklardan model girdisi besleme tehditleri.'
      }
    ],
    relatedLabIds: ['indirect-injection', 'agentic-tool-abuse', 'prompt-injection']
  },

  'indirect-injection': {
    labId: 'indirect-injection',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP Top 10 for LLM - Indirect Prompt Injection',
        url: 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/',
        description: 'Web siteleri, PDF ve e-postalar içine gizlenmiş talimat saldırıları.'
      },
      {
        provider: 'CWE',
        label: 'CWE-116: Improper Encoding or Escaping of Output',
        url: 'https://cwe.mitre.org/data/definitions/116.html',
        description: 'Harici metinlerin model promptuna ham eklenmesi riskleri.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: Indirect Prompt Injection',
        url: 'https://portswigger.net/web-security/llm-attacks',
        description: 'Web arama sonuçları ve üçüncü taraf verilerden komut yürütme.'
      }
    ],
    relatedLabIds: ['agentic-tool-abuse', 'rag-poisoning', 'prompt-injection']
  },

  'agentic-tool-abuse': {
    labId: 'agentic-tool-abuse',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP Top 10 for LLM - LLM07: System Information Leak & Insecure Plugin Design',
        url: 'https://genai.owasp.org/llmrisk/llm07-system-information-leak/',
        description: 'Otonom AI ajanlarında yetkisiz tool çağırma ve komut çalıştırma.'
      },
      {
        provider: 'CWE',
        label: 'CWE-862: Missing Authorization',
        url: 'https://cwe.mitre.org/data/definitions/862.html',
        description: 'Agent tool API çağrılarında onay ve yetkilendirme eksikliği.'
      },
      {
        provider: 'OWASP',
        label: 'OWASP Top 10 for LLM - LLM08: Vector and Embedding Weaknesses',
        url: 'https://genai.owasp.org/llmrisk/llm08-vector-and-embedding-weaknesses/',
        description: 'Otonom sistemlerin dış dünya etkileşimlerini denetleme.'
      }
    ],
    relatedLabIds: ['indirect-injection', 'prompt-injection', 'direct-leak']
  },

  // --- SPECIAL BLUE-TEAM / HOTEL DEFENSE LABS ---
  'hotel-full-simulation': {
    labId: 'hotel-full-simulation',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP API Security Top 10 - API1:2023 Broken Object Level Authorization (BOLA)',
        url: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/',
        description: 'API nesne sahipliği doğrulama eksikliği ve yetkisiz veri okuma.'
      },
      {
        provider: 'OWASP',
        label: 'OWASP API Security Top 10 - API3:2023 Broken Object Property Level Authorization',
        url: 'https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/',
        description: 'Mass Assignment ile nesne özelliklerinin ve fiyatların manipülasyonu.'
      },
      {
        provider: 'CWE',
        label: 'CWE-915: Improperly Controlled Modification of Dynamically-Determined Object Attributes',
        url: 'https://cwe.mitre.org/data/definitions/915.html',
        description: 'Express.js ve Node.js API katmanında Mass Assignment zafiyetleri.'
      }
    ],
    relatedLabIds: ['idor-profile', 'jwt-weak-secret', 'file-upload-defense']
  },

  'file-upload-defense': {
    labId: 'file-upload-defense',
    externalLinks: [
      {
        provider: 'OWASP',
        label: 'OWASP File Upload Defense & Magic Bytes Verification',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html',
        description: 'MIME sahteciliği, dosya boyutu DoS ve Magic Bytes doğrulaması.'
      },
      {
        provider: 'CWE',
        label: 'CWE-434: Unrestricted Upload of File with Dangerous Type',
        url: 'https://cwe.mitre.org/data/definitions/434.html',
        description: 'Mavi takım güvenli dosya saklama ve JWT imzalı indirme mimarisi.'
      },
      {
        provider: 'PortSwigger',
        label: 'PortSwigger Academy: File Upload Security Controls',
        url: 'https://portswigger.net/web-security/file-upload',
        description: 'Allowlist doğrulama ve geçici imzalı URL ile depolama.'
      }
    ],
    relatedLabIds: ['rce-upload', 'path-traversal', 'hotel-full-simulation']
  }
};

/**
 * Fallback static links if a specific lab has no bespoke entry
 */
export const DEFAULT_SECURITY_REFERENCES: LabReferenceEntry = {
  labId: 'default',
  externalLinks: [
    {
      provider: 'OWASP',
      label: 'OWASP Top 10 Web Application Security Risks',
      url: 'https://owasp.org/Top10/',
      description: 'Küresel web uygulama güvenlik standartları ve en kritik 10 zafiyet.'
    },
    {
      provider: 'CWE',
      label: 'CWE Mitre: Common Weakness Enumeration',
      url: 'https://cwe.mitre.org/',
      description: 'Yazılım güvenlik açıkları ve zayıflıkları uluslararası referans kataloğu.'
    },
    {
      provider: 'PortSwigger',
      label: 'PortSwigger Web Security Academy',
      url: 'https://portswigger.net/web-security',
      description: 'Pratik zafiyet laboratuvarları, teori ve sömürü teknikleri.'
    }
  ],
  relatedLabIds: ['sqli-auth-bypass', 'xss-stored', 'idor-profile']
};

/**
 * Helper to fetch authoritative references for any lab
 */
export function getLabSecurityReferences(labId: string): LabReferenceEntry {
  return LAB_SECURITY_REFERENCES[labId] || {
    labId,
    externalLinks: DEFAULT_SECURITY_REFERENCES.externalLinks,
    relatedLabIds: DEFAULT_SECURITY_REFERENCES.relatedLabIds
  };
}

