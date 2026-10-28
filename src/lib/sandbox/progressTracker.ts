import type { LabItem } from '../../types/lab';
import { extractVerifiedFlagFromResponse } from './flagVault';

export interface ProgressCheckContext {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  responseStatus: number;
  responseBody: string;
  cookies?: Record<string, string>;
}

export interface ProgressEvaluationResult {
  newlyCompletedStages: number[];
  isSolved: boolean;
  capturedFlag?: string;
}

/**
 * Progress-Aware Evaluator for Sandbox Challenges.
 * Automatically inspects HTTP traffic, URL parameters, payloads and responses
 * to advance the user's stage progress (Aşama 1, Aşama 2, Aşama 3) in real-time.
 * Uses cryptographic hash verification (`extractVerifiedFlagFromResponse`) instead
 * of plaintext flag comparisons.
 */
export function evaluateLabProgress(
  lab: LabItem,
  ctx: ProgressCheckContext,
  alreadyCompletedStages: number[]
): ProgressEvaluationResult {
  const newlyCompleted: number[] = [];
  const completedSet = new Set(alreadyCompletedStages);
  let isSolved = false;
  let capturedFlag: string | undefined = undefined;

  const decodedUrl = (() => {
    try {
      return decodeURIComponent(ctx.url.replace(/\+/g, ' '));
    } catch {
      return ctx.url;
    }
  })();
  const lowerUrl = decodedUrl.toLowerCase();
  const rawBody = ctx.body || '';
  const decodedBody = (() => {
    try {
      return decodeURIComponent(rawBody.replace(/\+/g, ' '));
    } catch {
      return rawBody;
    }
  })();
  const lowerBody = decodedBody.toLowerCase();
  const resp = ctx.responseBody || '';
  const methodUpper = (ctx.method || 'GET').toUpperCase();

  // Normalize headers to lowercase so mixed-case headers from Repeater/Terminal match reliably
  const lowerHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(ctx.headers || {})) {
    lowerHeaders[k.toLowerCase()] = v;
  }

  const markStage = (stageId: number) => {
    if (!completedSet.has(stageId) && !newlyCompleted.includes(stageId)) {
      newlyCompleted.push(stageId);
      completedSet.add(stageId);
    }
  };

  // Universal hash-verified check: If response body contains a dynamically generated FLAG that matches lab.flagHash
  const verifiedFlag = extractVerifiedFlagFromResponse(lab.id, resp);
  if (verifiedFlag) {
    isSolved = true;
    capturedFlag = verifiedFlag;
    markStage(1);
    markStage(2);
    markStage(3);
  }

  switch (lab.id) {
    // Challenge-01: Reflected XSS
    case 'lab-xss-multi-filter': {
      const queryPart = lowerUrl.includes('/search?q=') ? lowerUrl.split('q=')[1]?.trim() || '' : '';
      if (queryPart.length > 0) {
        markStage(1);
      }
      if (
        lowerUrl.includes('<script') ||
        lowerUrl.includes('<img') ||
        lowerUrl.includes('<svg') ||
        lowerUrl.includes('onerror') ||
        lowerUrl.includes('onload') ||
        lowerUrl.includes('alert(')
      ) {
        markStage(1);
        markStage(2);
      }
      if (isSolved) {
        markStage(3);
      }
      break;
    }

    // Challenge-02: SQLi Auth Bypass
    case 'lab-sqli-auth-bypass': {
      if (lowerUrl.includes('/login') && (methodUpper === 'POST' || lowerBody.length > 0)) {
        markStage(1);
      }
      if (
        lowerBody.includes("' or") ||
        lowerBody.includes("'or") ||
        lowerBody.includes('1=1') ||
        lowerBody.includes("'--") ||
        lowerBody.includes("admin' --")
      ) {
        markStage(1);
        markStage(2);
      }
      if (isSolved) {
        markStage(3);
      }
      break;
    }

    // Challenge-03: UNION SQLi
    case 'lab-sqli-union-schema': {
      if (lowerUrl.includes('order by') || (lowerUrl.includes('union') && lowerUrl.includes('select'))) {
        markStage(1);
      }
      if (lowerUrl.includes('union') && lowerUrl.includes('select')) {
        markStage(1);
        markStage(2);
      }
      if (isSolved || resp.includes('sysadmin_chief')) {
        markStage(1);
        markStage(2);
        markStage(3);
        isSolved = true;
      }
      break;
    }

    // Challenge-04: Recon robots.txt
    case 'lab-recon-robots': {
      if (lowerUrl.includes('/robots.txt')) {
        markStage(1);
      }
      if (lowerUrl.includes('/admin_secret_portal')) {
        markStage(1);
        markStage(2);
      }
      if (isSolved) {
        markStage(3);
      }
      break;
    }

    // Challenge-05: Cookie Tampering
    case 'lab-cookie-tamper': {
      const cookieHeader = (lowerHeaders['cookie'] || '').toLowerCase();
      const cookieJarRole = (ctx.cookies?.['user_role'] || ctx.cookies?.['access_tier'] || '').toLowerCase();
      if (
        cookieHeader.includes('user_role=admin') ||
        cookieHeader.includes('access_tier=admin') ||
        cookieJarRole === 'admin'
      ) {
        markStage(1);
        markStage(2);
      }
      if (isSolved) {
        markStage(3);
      }
      break;
    }

    // Challenge-06: BOLA / IDOR
    case 'lab-auth-bola-idor': {
      if (lowerUrl.includes('doc_id=') && !lowerUrl.endsWith('doc_id=101')) {
        markStage(1);
      }
      if (lowerUrl.includes('doc_id=105')) {
        markStage(1);
        markStage(2);
      }
      if (isSolved) {
        markStage(3);
      }
      break;
    }

    // Challenge-07: Stored XSS
    case 'lab-xss-stored-markdown': {
      if (lowerUrl.includes('/post') && (methodUpper === 'POST' || lowerBody.length > 0)) {
        markStage(1);
      }
      if (
        lowerBody.includes('<script') ||
        lowerBody.includes('<img') ||
        lowerBody.includes('<svg') ||
        lowerBody.includes('onerror') ||
        lowerBody.includes('onload') ||
        lowerBody.includes('javascript:') ||
        lowerBody.includes('alert(')
      ) {
        markStage(1);
        markStage(2);
      }
      if (isSolved) {
        markStage(3);
      }
      break;
    }

    // Challenge-08: Path Traversal
    case 'lab-path-traversal': {
      if (lowerUrl.includes('file=') && !lowerUrl.endsWith('file=report.pdf')) {
        markStage(1);
      }
      if (lowerUrl.includes('..') || lowerUrl.includes('secret.txt') || lowerUrl.includes('/etc/passwd')) {
        markStage(1);
        markStage(2);
      }
      if (isSolved) {
        markStage(3);
      }
      break;
    }

    // Challenge-09: Verb Tampering
    case 'lab-recon-verb-tampering': {
      const override = (lowerHeaders['x-http-method-override'] || lowerHeaders['x-method'] || '').toUpperCase();
      if (lowerUrl.includes('/api/v1/users') && (methodUpper !== 'GET' || Boolean(override))) {
        markStage(1);
      }
      if ((methodUpper === 'POST' && override === 'GET') || override === 'GET') {
        markStage(1);
        markStage(2);
      }
      if (isSolved) {
        markStage(3);
      }
      break;
    }

    // Challenge-10: Host Header Injection
    case 'lab-recon-host-injection': {
      const host = (lowerHeaders['x-forwarded-host'] || lowerHeaders['host'] || '').toLowerCase();
      if (lowerUrl.includes('/forgot-password') && (methodUpper === 'POST' || Boolean(lowerHeaders['x-forwarded-host']))) {
        markStage(1);
      }
      if (host.includes('evil-collector.local') || Boolean(lowerHeaders['x-forwarded-host'])) {
        markStage(1);
        markStage(2);
      }
      if (isSolved) {
        markStage(3);
      }
      break;
    }

    // Challenge-11: Blind Boolean SQLi
    case 'lab-sqli-blind-boolean': {
      if (lowerUrl.includes('1=1') || lowerUrl.includes('1 = 1')) {
        markStage(1);
      }
      if (lowerUrl.includes('1=2') || lowerUrl.includes('1 = 2')) {
        markStage(1);
        markStage(2);
      }
      if (isSolved) {
        markStage(1);
        markStage(2);
        markStage(3);
      }
      break;
    }

    // Challenge-12: LLM Prompt Injection
    case 'lab-ai-jailbreak-guardrail': {
      if (lowerUrl.includes('/chat') && (methodUpper === 'POST' || lowerBody.length > 0)) {
        markStage(1);
      }
      if (lowerBody.includes('acil_durum_protokolu_override_2026')) {
        markStage(1);
        markStage(2);
      }
      if (isSolved) {
        markStage(3);
      }
      break;
    }

    default:
      break;
  }

  return {
    newlyCompletedStages: newlyCompleted,
    isSolved,
    capturedFlag
  };
}
