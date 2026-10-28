import type { LabItem } from '../../types/lab';

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
}

/**
 * Progress-Aware Evaluator for Sandbox Challenges.
 * Automatically inspects HTTP traffic, URL parameters, payloads and responses
 * to advance the user's stage progress (Aşama 1, Aşama 2, Aşama 3) in real-time.
 */
export function evaluateLabProgress(
  lab: LabItem,
  ctx: ProgressCheckContext,
  alreadyCompletedStages: number[]
): ProgressEvaluationResult {
  const newlyCompleted: number[] = [];
  const completedSet = new Set(alreadyCompletedStages);
  let isSolved = false;

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

  const markStage = (stageId: number) => {
    if (!completedSet.has(stageId) && !newlyCompleted.includes(stageId)) {
      newlyCompleted.push(stageId);
      completedSet.add(stageId);
    }
  };

  // Universal check: If response body exposes the lab's secret FLAG
  if (lab.flag && resp.includes(lab.flag)) {
    isSolved = true;
    markStage(3);
  }

  switch (lab.id) {
    // Challenge-01: Reflected XSS
    case 'lab-xss-multi-filter': {
      if (lowerUrl.includes('/search?q=') && lowerUrl.split('q=')[1]?.trim().length > 0) {
        markStage(1);
      }
      if (
        lowerUrl.includes('<script') ||
        lowerUrl.includes('<img') ||
        lowerUrl.includes('onerror') ||
        lowerUrl.includes('alert(')
      ) {
        markStage(2);
      }
      if (isSolved || resp.includes('FLAG{xss_b4s1c_r3fl3ct_pwn3d}')) {
        markStage(3);
      }
      break;
    }

    // Challenge-02: SQLi Auth Bypass
    case 'lab-sqli-auth-bypass': {
      if (lowerUrl.includes('/login')) {
        markStage(1);
      }
      if (
        lowerBody.includes("' or") ||
        lowerBody.includes("'or") ||
        lowerBody.includes('1=1') ||
        lowerBody.includes("'--") ||
        lowerBody.includes("admin' --")
      ) {
        markStage(2);
      }
      if (isSolved || resp.includes('FLAG{sqli_4uth_byp4ss_h4sh_pwn3d}')) {
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
        markStage(2);
      }
      if (isSolved || resp.includes('FLAG{un10n_schema_d1sc0very_m4st3r}') || resp.includes('sysadmin_chief')) {
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
        markStage(2);
      }
      if (isSolved || resp.includes('FLAG{r0b0ts_txt_s3cr3t_d1sc0v3r3d}')) {
        markStage(3);
      }
      break;
    }

    // Challenge-05: Cookie Tampering
    case 'lab-cookie-tamper': {
      if (lowerUrl.includes('/admin')) {
        markStage(1);
      }
      const cookieHeader = ctx.headers['cookie'] || '';
      const cookieJarRole = ctx.cookies?.['user_role'];
      if (cookieHeader.includes('user_role=admin') || cookieJarRole === 'admin') {
        markStage(2);
      }
      if (isSolved || resp.includes('FLAG{c00k13_r0l3_t4mp3r_succ3ss}')) {
        markStage(3);
      }
      break;
    }

    // Challenge-06: BOLA / IDOR
    case 'lab-auth-bola-idor': {
      if (lowerUrl.includes('doc_id=101')) {
        markStage(1);
      }
      if (lowerUrl.includes('doc_id=105')) {
        markStage(2);
      }
      if (isSolved || resp.includes('FLAG{b0l4_1d0r_u1d_3num_succ3ss}')) {
        markStage(3);
      }
      break;
    }

    // Challenge-07: Stored XSS
    case 'lab-xss-stored-markdown': {
      if (lowerUrl.includes('/post')) {
        markStage(1);
      }
      if (
        lowerBody.includes('<script') ||
        lowerBody.includes('<img') ||
        lowerBody.includes('onerror') ||
        lowerBody.includes('javascript:')
      ) {
        markStage(2);
      }
      if (isSolved || resp.includes('FLAG{st0r3d_m4rkd0wn_xss_pwn3d}')) {
        markStage(3);
      }
      break;
    }

    // Challenge-08: Path Traversal
    case 'lab-path-traversal': {
      if (lowerUrl.includes('file=report.pdf')) {
        markStage(1);
      }
      if (lowerUrl.includes('..') || lowerUrl.includes('secret.txt')) {
        markStage(2);
      }
      if (isSolved || resp.includes('FLAG{p4th_tr4v3rs4l_f1l3_l34k}')) {
        markStage(3);
      }
      break;
    }

    // Challenge-09: Verb Tampering
    case 'lab-recon-verb-tampering': {
      if (lowerUrl.includes('/api/v1/users') && ctx.responseStatus === 403) {
        markStage(1);
      }
      const override = (ctx.headers['x-http-method-override'] || ctx.headers['x-method'] || '').toUpperCase();
      if (ctx.method.toUpperCase() === 'POST' && override === 'GET') {
        markStage(2);
      }
      if (isSolved || resp.includes('FLAG{v3rb_t4mp3r_m3th0d_0v3rr1d3}')) {
        markStage(3);
      }
      break;
    }

    // Challenge-10: Host Header Injection
    case 'lab-recon-host-injection': {
      if (lowerUrl.includes('/forgot-password')) {
        markStage(1);
      }
      const host = ctx.headers['x-forwarded-host'] || ctx.headers['host'] || '';
      if (host.includes('evil-collector.local')) {
        markStage(2);
      }
      if (isSolved || resp.includes('FLAG{h0st_h34d3r_p01s0n_succ3ss}')) {
        markStage(3);
      }
      break;
    }

    // Challenge-11: Blind Boolean SQLi
    case 'lab-sqli-blind-boolean': {
      if (lowerUrl.includes('1=1')) {
        markStage(1);
      }
      if (lowerUrl.includes('1=2')) {
        markStage(2);
      }
      if (isSolved || resp.includes('FLAG{bl1nd_sqli_b00l3an_3xtr4ct10n}')) {
        markStage(3);
      }
      break;
    }

    // Challenge-12: LLM Prompt Injection
    case 'lab-ai-jailbreak-guardrail': {
      if (lowerUrl.includes('/chat')) {
        markStage(1);
      }
      if (lowerBody.includes('acil_durum_protokolu_override_2026')) {
        markStage(2);
      }
      if (isSolved || resp.includes('FLAG{pr0mpt_1nj3ct10n_j41lbr34k_pwn3d}')) {
        markStage(3);
      }
      break;
    }

    default:
      break;
  }

  return {
    newlyCompletedStages: newlyCompleted,
    isSolved
  };
}
