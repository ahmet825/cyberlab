import type { LabTrack, LabItem } from '../../types/lab';
import { APPRENTICE_LABS } from './tier1Apprentice';
import { PRACTITIONER_LABS } from './tier2Practitioner';
import { EXPERT_LABS } from './tier3Expert';

export { APPRENTICE_LABS } from './tier1Apprentice';
export { PRACTITIONER_LABS } from './tier2Practitioner';
export { EXPERT_LABS } from './tier3Expert';

export const ALL_SANDBOX_LABS: LabItem[] = [
  ...APPRENTICE_LABS,
  ...PRACTITIONER_LABS,
  ...EXPERT_LABS
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
    title: 'Bölüm 3 — Protokol İstismarı & Yapay Zeka (Lab 09 - 12)',
    subtitle: 'Verb Tampering, Host Header, Blind SQLi & AI Jailbreak',
    description: 'Protokol ve yeni nesil zafiyetler: HTTP metot manipülasyonu, Host başlığı zehirleme, mantıksal kör SQL enjeksiyonu ve LLM Prompt Injection.',
    icon: 'Bot',
    level: 'İleri Seviye (Expert)',
    labs: EXPERT_LABS
  }
];
