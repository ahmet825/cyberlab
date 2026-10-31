import type { LabTrack, LabItem } from '../../types/lab';
import { APPRENTICE_LABS } from './tier1Apprentice';
import { PRACTITIONER_LABS } from './tier2Practitioner';
import { EXPERT_LABS } from './tier3Expert';
import { LLM_LABS } from './tier4Llm';

export { APPRENTICE_LABS } from './tier1Apprentice';
export { PRACTITIONER_LABS } from './tier2Practitioner';
export { EXPERT_LABS } from './tier3Expert';
export { LLM_LABS } from './tier4Llm';

export const ALL_SANDBOX_LABS: LabItem[] = [
  ...APPRENTICE_LABS,
  ...PRACTITIONER_LABS,
  ...EXPERT_LABS,
  ...LLM_LABS
];

export const CURRICULUM_TRACKS: LabTrack[] = [
  {
    id: 'track-recon-entry',
    title: 'Bölüm 1 — Keşif & İlk Temas (Lab 01 - 04)',
    subtitle: 'Reflected XSS, SQLi Auth Bypass, UNION SQLi & robots.txt',
    description: 'Web güvenliğinin temel yapı taşları: Arama motorunda Reflected XSS, giriş formunda parolasız SQLi kimlik atlatma, UNION enjeksiyonu ve robots.txt dizin keşfi.',
    icon: 'Search',
    level: 'Başlangıç (Apprentice)',
    labs: APPRENTICE_LABS
  },
  {
    id: 'track-client-state',
    title: 'Bölüm 2 — İstemci & Oturum Aldatmacası (Lab 05 - 08)',
    subtitle: 'Cookie Tampering, IDOR, Stored XSS & Path Traversal',
    description: 'Kullanıcı ve durum manipülasyonu: Çerezde yetki yükseltme, doğrudan nesne referansları (IDOR), kalıcı blog yorumu XSS ve dosya okuma (Path Traversal).',
    icon: 'Code2',
    level: 'Orta Seviye (Practitioner)',
    labs: PRACTITIONER_LABS
  },
  {
    id: 'track-deep-exploit',
    title: 'Bölüm 3 — Protokol İstismarı & Web Zafiyetleri (Lab 09 - 11)',
    subtitle: 'Verb Tampering, Host Header & Blind SQLi',
    description: 'Protokol ve gelişmiş web zafiyetleri: HTTP metot manipülasyonu, Host başlığı zehirleme ve mantıksal kör SQL enjeksiyonu.',
    icon: 'Database',
    level: 'İleri Seviye (Expert)',
    labs: EXPERT_LABS
  },
  {
    id: 'track-llm-security',
    title: 'Bölüm 4 — Yapay Zeka Güvenliği (LLM Security Labs - 6 Lab)',
    subtitle: 'Prompt Injection, System Prompt Leak, LLM IDOR, Slopsquatting & Jailbreak',
    description: 'OWASP Top 10 for LLM Applications odaklı yeni nesil yapay zeka zafiyetleri: Çeviri botu ele geçirme, filtre atlatma, müşteri verisi sızıntısı ve jailbreak simülasyonları.',
    icon: 'Bot',
    level: 'Başlangıç & İleri Seviye (LLM)',
    labs: LLM_LABS
  }
];
