import { executeVulnerableQuery } from '../sql/sqliteEngine';
import { synthesizeExploitFlag } from '../sandbox/flagVault';

export interface CommandContext {
  activeLabId: string;
  cookies: Record<string, string>;
  setCookie: (key: string, value: string) => void;
  onHttpRequest: (method: string, url: string, headers: Record<string, string>, body?: string) => Promise<{ status: number; headers: Record<string, string>; body: string }>;
  onLabSolved: (labId: string, verifiedFlag?: string) => void;
}

export interface CommandOutput {
  output: string;
  type?: 'standard' | 'error' | 'success' | 'system' | 'table';
}

export async function processTerminalCommand(
  input: string,
  context: CommandContext
): Promise<CommandOutput> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { output: '', type: 'standard' };
  }

  // Parse command and arguments
  const parts = parseCommandLine(trimmed);
  const cmd = parts[0]?.toLowerCase();
  const args = parts.slice(1);

  switch (cmd) {
    case 'help':
      return {
        type: 'system',
        output: `\x1b[36m=== CYBERPULSE WEB SECURITY TERMINAL v2.4 ===\x1b[0m
Available Offensive & Defensive Security Commands:

  \x1b[32mcurl\x1b[0m [options] <url>    Send HTTP requests (-i, -X POST, -H "Header: Val", -d "data")
  \x1b[32msqli\x1b[0m query <sql>        Execute raw query on SQLite WASM engine
  \x1b[32mdecode\x1b[0m <type> <val>     Decode (url | b64 | hex | jwt)
  \x1b[32mcookie\x1b[0m [get|set] [k] [v] View or modify target browser cookies
  \x1b[32mfuzz\x1b[0m <url_with_FUZZ>    Simulate directory/parameter fuzzing
  \x1b[32mcat\x1b[0m <file>             Read local files (wordlist.txt, notes.txt)
  \x1b[32mclear\x1b[0m                   Clear the terminal screen
  \x1b[32mwhoami\x1b[0m                  Display current active session role`
      };

    case 'clear':
      return { output: '__CLEAR__', type: 'system' };

    case 'whoami':
      const currentRole = context.cookies['user_role'] || context.cookies['access_tier'] || context.cookies['role'] || 'guest_user';
      return {
        type: 'standard',
        output: `uid=1001(student) gid=1001(security_lab) role=${currentRole} environment=browser_wasm`
      };

    case 'cat': {
      const file = args[0]?.toLowerCase();
      if (!file) return { output: 'Usage: cat <file> (e.g. cat wordlist.txt or cat notes.txt)', type: 'error' };
      if (file === 'wordlist.txt') {
        return {
          type: 'standard',
          output: `admin\nadministrator\nbackup\nconfig\napi\nusers\nsecret\ndashboard\nrobots.txt`
        };
      }
      if (file === 'notes.txt') {
        return {
          type: 'standard',
          output: `[Penetration Testing Notes]\n- Always check HTTP response headers\n- Look for unescaped characters: ' " < >\n- Check cookie values for tamperable role attributes`
        };
      }
      return { output: `cat: ${file}: No such file or directory`, type: 'error' };
    }

    case 'cookie': {
      const action = args[0]?.toLowerCase();
      if (!action || action === 'get') {
        const cookiesStr = Object.entries(context.cookies)
          .map(([k, v]) => `  \x1b[33m${k}\x1b[0m = \x1b[32m${v}\x1b[0m`)
          .join('\n');
        return {
          type: 'standard',
          output: cookiesStr ? `Active Target Cookies:\n${cookiesStr}` : 'No cookies currently stored.'
        };
      }
      if (action === 'set') {
        const key = args[1];
        const val = args[2];
        if (!key || val === undefined) {
          return { output: 'Usage: cookie set <key> <value>', type: 'error' };
        }
        context.setCookie(key, val);
        if ((key === 'user_role' || key === 'access_tier') && val === 'admin' && context.activeLabId === 'lab-cookie-tamper') {
          const dynFlag = synthesizeExploitFlag('lab-cookie-tamper', 'cookie_role_admin') || '';
          context.onLabSolved('lab-cookie-tamper', dynFlag);
          return {
            type: 'success',
            output: `[+] Cookie '${key}' set to '${val}'.\n\x1b[32m[!] EXPLOIT SUCCESSFUL: Privilege escalated to Admin tier! Flag: ${dynFlag}\x1b[0m`
          };
        }
        return {
          type: 'success',
          output: `[+] Cookie '${key}' successfully updated to '${val}'.`
        };
      }
      return { output: 'Usage: cookie [get | set <key> <value>]', type: 'error' };
    }

    case 'decode': {
      const mode = args[0]?.toLowerCase();
      const payload = args.slice(1).join(' ');
      if (!mode || !payload) {
        return { output: 'Usage: decode <url | b64 | hex | jwt> <string>', type: 'error' };
      }
      try {
        if (mode === 'url') {
          return { type: 'standard', output: decodeURIComponent(payload) };
        }
        if (mode === 'b64' || mode === 'base64') {
          return { type: 'standard', output: atob(payload) };
        }
        if (mode === 'hex') {
          let str = '';
          for (let i = 0; i < payload.length; i += 2) {
            str += String.fromCharCode(parseInt(payload.substr(i, 2), 16));
          }
          return { type: 'standard', output: str };
        }
        if (mode === 'jwt') {
          const parts = payload.split('.');
          if (parts.length < 2) return { output: 'Invalid JWT format (expected header.payload.signature)', type: 'error' };
          const header = atob(parts[0]);
          const claims = atob(parts[1]);
          return {
            type: 'standard',
            output: `\x1b[35m[JWT Header]\x1b[0m\n${header}\n\n\x1b[36m[JWT Claims/Payload]\x1b[0m\n${claims}\n\n\x1b[33m[Signature]\x1b[0m\n${parts[2] || 'NONE'}`
          };
        }
        return { output: `Unknown decode mode: ${mode}. Use url, b64, hex, or jwt.`, type: 'error' };
      } catch (err: any) {
        return { output: `Decoding error: ${err.message}`, type: 'error' };
      }
    }

    case 'sqli': {
      const sub = args[0]?.toLowerCase();
      if (sub === 'query') {
        const query = args.slice(1).join(' ');
        if (!query) return { output: 'Usage: sqli query <SQL statement>', type: 'error' };
        const res = await executeVulnerableQuery(query);
        if (res.error) {
          return { output: `\x1b[31m[SQLite Error]\x1b[0m ${res.error}`, type: 'error' };
        }
        if (res.columns.length === 0) {
          return { output: 'Query executed successfully. (0 rows returned)', type: 'standard' };
        }
        // Format as ASCII table
        const header = res.columns.join(' | ');
        const separator = res.columns.map((c) => '-'.repeat(Math.max(c.length, 12))).join('-+-');
        const rows = res.values
          .map((row) => row.map((val) => String(val ?? 'NULL')).join(' | '))
          .join('\n');
        return {
          type: 'table',
          output: `\x1b[36m${header}\x1b[0m\n${separator}\n${rows}`
        };
      }
      return { output: 'Usage: sqli query "SELECT * FROM users"', type: 'error' };
    }

    case 'fuzz': {
      const target = args[0];
      if (!target || !target.includes('FUZZ')) {
        return { output: 'Usage: fuzz <url_containing_FUZZ> (e.g. fuzz https://shop.local/FUZZ)', type: 'error' };
      }
      const wordlist = ['admin', 'api', 'dashboard', 'login', 'robots.txt', 'config', 'backup.zip'];
      let out = `\x1b[35m[+] Starting Fuzzing Engine against ${target}...\x1b[0m\n`;
      for (const word of wordlist) {
        const testUrl = target.replace('FUZZ', word);
        const status = word === 'admin' ? 403 : word === 'login' || word === 'dashboard' ? 200 : 404;
        const color = status === 200 ? '\x1b[32m' : status === 403 ? '\x1b[33m' : '\x1b[90m';
        out += `Payload: ${word.padEnd(12)} -> Status: ${color}${status}\x1b[0m | URL: ${testUrl}\n`;
      }
      out += `\x1b[32m[+] Fuzzing complete. 7 requests sent.\x1b[0m`;
      return { output: out, type: 'standard' };
    }

    case 'curl': {
      return await executeCurlCommand(args, context);
    }

    default:
      return {
        output: `command not found: ${cmd}. Type 'help' to see available cybersecurity tools.`,
        type: 'error'
      };
  }
}

async function executeCurlCommand(args: string[], context: CommandContext): Promise<CommandOutput> {
  let method = 'GET';
  let headers: Record<string, string> = {
    'User-Agent': 'CyberTerminal/2.4 (Security-Student)',
    Accept: '*/*'
  };
  let body: string | undefined = undefined;
  let showHeaders = false;
  let url = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-i' || arg === '-I') {
      showHeaders = true;
    } else if (arg === '-X' && args[i + 1]) {
      method = args[++i].toUpperCase();
    } else if (arg === '-H' && args[i + 1]) {
      const headerStr = args[++i];
      const colonIdx = headerStr.indexOf(':');
      if (colonIdx > 0) {
        const k = headerStr.slice(0, colonIdx).trim();
        const v = headerStr.slice(colonIdx + 1).trim();
        headers[k] = v;
      }
    } else if (arg === '-d' || arg === '--data') {
      method = method === 'GET' ? 'POST' : method;
      body = args[++i];
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (arg === '-b' && args[i + 1]) {
      const cookieStr = args[++i];
      headers['Cookie'] = cookieStr;
    } else if (!arg.startsWith('-')) {
      url = arg;
    }
  }

  if (!url) {
    return { output: 'curl: try \'curl --help\' or specify a target URL', type: 'error' };
  }

  try {
    const res = await context.onHttpRequest(method, url, headers, body);
    let output = '';

    if (showHeaders || true) {
      const statusText = res.status === 200 ? 'OK' : res.status === 403 ? 'Forbidden' : res.status === 401 ? 'Unauthorized' : 'Found';
      output += `\x1b[36mHTTP/1.1 ${res.status} ${statusText}\x1b[0m\n`;
      for (const [k, v] of Object.entries(res.headers)) {
        output += `\x1b[34m${k}:\x1b[0m ${v}\n`;
      }
      output += '\n';
    }

    output += res.body;

    // Trigger lab completion checks for curl-driven labs
    if (context.activeLabId === 'lab-recon-headers') {
      if (headers['X-User-Role']?.toLowerCase() === 'administrator') {
        const dynFlag = synthesizeExploitFlag('lab-recon-headers', 'header_role_administrator') || '';
        context.onLabSolved('lab-recon-headers', dynFlag);
        output += `\n\n\x1b[32m[!] LAB SOLVED: Admin privilege header accepted! Flag: ${dynFlag}\x1b[0m`;
      }
    } else if (context.activeLabId === 'lab-idor-api') {
      if (url.includes('/api/users/1') || url.includes('/api/users/01')) {
        const dynFlag = synthesizeExploitFlag('lab-idor-api', 'idor_api_user_1') || '';
        context.onLabSolved('lab-idor-api', dynFlag);
        output += `\n\n\x1b[32m[!] LAB SOLVED: IDOR Vulnerability exploited! Exfiltrated Admin API Key: ${dynFlag}\x1b[0m`;
      }
    }

    return { output, type: 'standard' };
  } catch (err: any) {
    return { output: `curl: (7) Failed to connect: ${err.message}`, type: 'error' };
  }
}

function parseCommandLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if ((c === '"' || c === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = c;
    } else if (c === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = '';
    } else if (c === ' ' && !inQuotes) {
      if (cur) {
        result.push(cur);
        cur = '';
      }
    } else {
      cur += c;
    }
  }
  if (cur) result.push(cur);
  return result;
}
