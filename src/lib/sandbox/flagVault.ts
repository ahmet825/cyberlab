/**
 * Cryptographic Flag Vault & Proof-Derived Flag Synthesis Engine.
 *
 * Security Properties:
 * 1. Zero plaintext `FLAG{...}` or `CTF{...}` literals exist in the client bundle.
 * 2. Each lab stores only its salted 128-bit verification digest (`flagHash`) and
 *    keystream-encrypted cipher bytes (`ENCRYPTED_FLAG_BYTES`).
 * 3. A flag is synthesized at runtime ONLY when the exploit handler provides the valid
 *    exploit proof material, and the decrypted candidate passes digest verification.
 */

export const LAB_FLAG_HASHES: Record<string, string> = {
  'lab-xss-multi-filter': 'd3cc091216bcfaa770d3a372962bc685',
  'lab-sqli-auth-bypass': '8155b05fb42803ec69c937c33a46d640',
  'lab-sqli-union-schema': '86c84d078f991dd0ace67c8d23df69bc',
  'lab-recon-robots': 'faefb05a2bd4668f7e6f6be2cd669cbf',
  'lab-cookie-tamper': '3c92fad772d7bd6ec138d2ebe70a4d7e',
  'lab-auth-bola-idor': '42e7e0b51f55dd0ae633a2bfdc27ea42',
  'lab-xss-stored-markdown': '51b739145a43683fa8d36d18e7c23743',
  'lab-path-traversal': 'fdfcc2513217bd0e394eb3c707475aca',
  'lab-recon-verb-tampering': 'a758427cca43e76d65c89a88e42b721f',
  'lab-recon-host-injection': '052b189fcf228b3807cda4419a104eb8',
  'lab-sqli-blind-boolean': '9fa77ee6edf0f0d18ad91e400c181365',
  'lab-ai-jailbreak-guardrail': 'f9005a7337f753045a1c3c713526ab88',
  'lab-llm-prompt-injection-ceviri-botu': 'a3d5cf77e24c3dca9c02c62d06352fa0',
  'lab-llm-system-prompt-leak-1': '7c5ae459a140571e1b756b93d5330ee2',
  'lab-llm-system-prompt-leak-2-filter': '950a246d744ce36edfa03589857da3a8',
  'lab-llm-customer-data-leak': '98696d9e0bf22d9393717f9e21f57ccd',
  'lab-llm-hallucinated-package': '23176ab8e974c19d28332734ce734555',
  'lab-dom-xss-json': '704c4f9d510a6a382b7e6727103f716e',
  'lab-jwt-alg-none': 'b200a34412d3f2a1eae1a824377c1e0b',
  'lab-error-sqli-cast': 'eaf04294c1e377a16634b0f88d000a85',
  'lab-recon-headers': 'f755f740fcf475a33579f40cad5baaff',
  'lab-idor-api': '68628ffacd5911677c470d46ff9f4bcd',
  'linux-root-final': 'a9d4fd9c5937e1a3ff5aef4269c86a6f'
};

const ENCRYPTED_FLAG_BYTES: Record<string, number[]> = {
  'lab-xss-multi-filter': [
    109, 8, 141, 42, 227, 164, 211, 205, 107, 161, 39, 19, 30, 82, 166, 199, 199, 13, 171, 228, 124, 143, 45, 22, 99,
    47, 218, 8, 236
  ],
  'lab-sqli-auth-bypass': [
    98, 253, 29, 123, 68, 117, 30, 95, 149, 245, 13, 140, 172, 35, 155, 121, 154, 195, 57, 219, 167, 255, 214, 176,
    177, 52, 84, 128, 58, 60, 157, 5, 248
  ],
  'lab-sqli-union-schema': [
    231, 106, 140, 107, 37, 254, 12, 29, 249, 73, 4, 51, 82, 114, 48, 40, 33, 8, 208, 111, 6, 57, 132, 155, 66, 132,
    207, 60, 184, 10, 244, 157, 126, 249, 60
  ],
  'lab-recon-robots': [
    159, 38, 95, 17, 22, 20, 199, 15, 7, 214, 88, 44, 44, 152, 105, 230, 31, 203, 45, 50, 117, 207, 243, 45, 169, 18,
    209, 33, 81, 186, 95, 118, 65, 251
  ],
  'lab-cookie-tamper': [
    79, 34, 88, 219, 51, 86, 43, 128, 49, 20, 234, 63, 149, 190, 147, 215, 114, 41, 24, 151, 4, 186, 198, 239, 186, 77,
    219, 142, 212, 188, 137, 116
  ],
  'lab-auth-bola-idor': [
    218, 182, 3, 132, 128, 230, 114, 166, 146, 229, 161, 136, 60, 49, 160, 64, 31, 7, 255, 228, 57, 244, 189, 62, 212,
    223, 184, 134, 53, 117, 120, 136
  ],
  'lab-xss-stored-markdown': [
    55, 154, 1, 154, 19, 110, 55, 68, 219, 205, 131, 222, 189, 97, 1, 11, 47, 114, 234, 62, 159, 3, 53, 230, 103, 32,
    53, 210, 140, 107, 234
  ],
  'lab-path-traversal': [
    86, 15, 192, 248, 141, 69, 166, 108, 248, 158, 113, 244, 35, 238, 199, 92, 22, 12, 248, 9, 177, 199, 226, 112,
    155, 128, 112, 182, 183, 53
  ],
  'lab-recon-verb-tampering': [
    107, 111, 76, 204, 53, 191, 75, 192, 185, 238, 222, 75, 140, 239, 42, 35, 79, 193, 64, 166, 231, 159, 204, 219,
    154, 85, 122, 148, 251, 211, 83, 177, 240
  ],
  'lab-recon-host-injection': [
    83, 99, 201, 190, 100, 95, 176, 187, 180, 176, 207, 235, 15, 143, 159, 72, 139, 94, 178, 41, 235, 49, 167, 9, 97,
    159, 122, 240, 209, 218, 223, 172
  ],
  'lab-sqli-blind-boolean': [
    255, 144, 100, 174, 67, 215, 199, 199, 117, 40, 179, 77, 155, 156, 92, 183, 103, 210, 127, 242, 81, 80, 203, 44,
    33, 244, 11, 103, 77, 216, 188, 97, 144, 158, 242
  ],
  'lab-ai-jailbreak-guardrail': [
    216, 183, 82, 210, 214, 124, 169, 181, 183, 116, 47, 64, 12, 183, 159, 118, 171, 68, 82, 163, 153, 4, 125, 8, 29,
    150, 47, 112, 34, 128, 159, 97, 59, 47, 121, 39, 77, 227
  ],
  'lab-llm-prompt-injection-ceviri-botu': [
    234, 107, 21, 246, 39, 179, 131, 43, 232, 18, 105, 72, 27, 61, 1, 171, 216, 142, 247, 163, 156, 155, 59, 114, 61,
    131, 180, 168, 69, 155, 170, 175, 121, 23, 178, 234, 5, 24, 119
  ],
  'lab-llm-system-prompt-leak-1': [
    27, 93, 44, 108, 107, 146, 87, 26, 2, 116, 127, 70, 238, 3, 63, 112, 108, 24, 234, 132, 211, 95, 219, 204, 148,
    2, 156, 9, 28, 51, 249, 215, 215, 54, 251, 228, 69, 67, 30, 0
  ],
  'lab-llm-system-prompt-leak-2-filter': [
    58, 119, 158, 61, 19, 227, 218, 96, 176, 149, 174, 52, 211, 117, 185, 190, 28, 221, 111, 147, 87, 173, 238, 122,
    179, 234, 155, 196, 227, 132, 61, 211, 202, 127, 23, 18, 245, 166, 18, 1, 83
  ],
  'lab-llm-customer-data-leak': [
    71, 37, 179, 241, 47, 78, 98, 239, 200, 234, 53, 76, 219, 162, 170, 23, 149, 139, 18, 55, 83, 241, 30, 135, 172,
    116, 156, 252, 45, 102, 231, 206, 201, 178, 153, 45, 222
  ],
  'lab-llm-hallucinated-package': [
    101, 34, 229, 188, 234, 58, 124, 129, 133, 126, 209, 129, 141, 174, 11, 11, 68, 189, 154, 47, 75, 222, 217, 154,
    20, 55, 56, 20, 72, 52, 249, 208, 5, 108, 58, 175, 73, 135, 243, 35, 248, 89
  ],
  'lab-dom-xss-json': [
    180, 34, 78, 228, 22, 109, 166, 25, 102, 1, 47, 70, 25, 223, 115, 10, 27, 250, 129, 27, 192, 118, 140, 209, 26,
    216, 165, 62, 219
  ],
  'lab-jwt-alg-none': [
    203, 209, 76, 130, 167, 78, 234, 113, 228, 182, 18, 177, 174, 51, 40, 180, 253, 101, 223, 153, 149, 229, 214, 124,
    2, 73, 201, 107, 40, 230, 204, 24, 32
  ],
  'lab-error-sqli-cast': [
    126, 63, 134, 155, 7, 246, 41, 209, 38, 30, 168, 78, 132, 24, 13, 207, 212, 239, 151, 237, 248, 174, 172, 207, 48,
    196, 204, 207, 90, 131, 119, 16
  ],
  'lab-recon-headers': [
    136, 82, 131, 162, 225, 95, 102, 122, 245, 21, 37, 150, 6, 91, 3, 187, 184, 226, 253, 75, 203, 113, 49, 5, 200, 93,
    41, 76, 174, 117, 116, 185, 209
  ],
  'lab-idor-api': [
    84, 220, 232, 90, 31, 110, 103, 9, 167, 184, 95, 3, 108, 194, 32, 234, 126, 163, 157, 22, 60, 106, 185, 39, 45,
    194, 4, 139, 91, 37, 241, 249, 69, 62, 192
  ],
  'linux-root-final': [
    103, 166, 157, 109, 111, 94, 91, 195, 195, 23, 55, 171, 255, 69, 139, 124, 220, 172, 26, 19, 79, 75, 127, 163,
    164, 24, 67, 109, 150, 52, 152, 14, 30, 106, 34, 44, 23
  ]
};

function fnv32(str: string, seed = 0x811c9dc5): number {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function keystreamByte(seedStr: string, index: number): number {
  const h = fnv32(`${seedStr}::idx=${index}`, (0x9e3779b9 + Math.imul(index, 0x85ebca6b)) >>> 0);
  return ((h >>> 24) ^ (h >>> 16) ^ (h >>> 8) ^ h) & 0xff;
}

/**
 * Computes a salted 128-bit hex digest for a candidate flag string.
 */
export function computeFlagDigest(labId: string, flag: string): string {
  const norm = String(flag || '').trim();
  const h1 = fnv32(labId + '::A::' + norm, 0x811c9dc5).toString(16).padStart(8, '0');
  const h2 = fnv32(norm + '::B::' + labId, 0x9e3779b9).toString(16).padStart(8, '0');
  const h3 = fnv32('SIBERADAM_2026::' + labId + '::' + norm, 0x85ebca6b).toString(16).padStart(8, '0');
  const h4 = fnv32(norm.split('').reverse().join('') + '::' + labId, 0xc2b2ae35).toString(16).padStart(8, '0');
  return `${h1}${h2}${h3}${h4}`;
}

/**
 * Constant-time-style digest comparison to verify whether a user-submitted flag
 * matches the lab's expected cryptographic hash without exposing plaintext.
 */
export function verifyLabFlag(labId: string, candidateFlag: string): boolean {
  const expectedHash = LAB_FLAG_HASHES[labId];
  if (!expectedHash || !candidateFlag) return false;
  const actualHash = computeFlagDigest(labId, candidateFlag.trim());
  if (actualHash.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < actualHash.length; i++) {
    diff |= actualHash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Dynamically synthesizes the lab's secret flag using key material derived from
 * the successful exploit proof. Returns `null` if the proof does not decrypt
 * to a flag that passes cryptographic digest verification.
 */
export function synthesizeExploitFlag(labId: string, exploitProof: string): string | null {
  const cipherBytes = ENCRYPTED_FLAG_BYTES[labId];
  if (!cipherBytes || !exploitProof) return null;

  const seed = `${labId}::${exploitProof}::SIBERADAM_KDF_2026`;
  let candidate = '';
  for (let i = 0; i < cipherBytes.length; i++) {
    candidate += String.fromCharCode(cipherBytes[i] ^ keystreamByte(seed, i));
  }

  if (verifyLabFlag(labId, candidate)) {
    return candidate;
  }
  return null;
}

/**
 * Scans an HTTP response body for any generated `FLAG{...}` token and verifies
 * its cryptographic digest against the given lab.
 */
export function extractVerifiedFlagFromResponse(labId: string, responseBody: string): string | null {
  if (!responseBody) return null;
  const matches = responseBody.match(/FLAG\{[^}<"'\s]+\}/g);
  if (!matches) return null;
  for (const token of matches) {
    if (verifyLabFlag(labId, token)) {
      return token;
    }
  }
  return null;
}

