import type { LinuxVfsState, VfsNode, CommandResult } from './types';

// Format numeric permission to standard Unix string (e.g. 0o755 -> -rwxr-xr-x)
export function formatPermissions(node: VfsNode): string {
  const isDir = node.type === 'dir';
  const p = node.permissions;

  const rwx = (shift: number) => {
    const val = (p >> shift) & 7;
    return `${val & 4 ? 'r' : '-'}${val & 2 ? 'w' : '-'}${val & 1 ? 'x' : '-'}`;
  };

  return `${isDir ? 'd' : '-'}${rwx(6)}${rwx(3)}${rwx(0)}`;
}

export function createInitialVfs(): LinuxVfsState {
  const now = new Date();

  const root: VfsNode = {
    name: '',
    type: 'dir',
    permissions: 0o755,
    owner: 'root',
    group: 'root',
    mtime: now,
    children: {
      home: {
        name: 'home',
        type: 'dir',
        permissions: 0o755,
        owner: 'root',
        group: 'root',
        mtime: now,
        children: {
          x: {
            name: 'x',
            type: 'dir',
            permissions: 0o755,
            owner: 'x',
            group: 'x',
            mtime: now,
            children: {
              Desktop: {
                name: 'Desktop',
                type: 'dir',
                permissions: 0o755,
                owner: 'x',
                group: 'x',
                mtime: now,
                children: {
                  'readme.txt': {
                    name: 'readme.txt',
                    type: 'file',
                    permissions: 0o644,
                    owner: 'x',
                    group: 'x',
                    mtime: now,
                    content: `[Y'nin Notu - 17:42]
X, mutfağa geçtim birazdan geleceğim.
Eğer terminali kurcalıyorsan dikkatli ol, her şeyi ortalıkta bırakmadım.
Noktaların ardına bakmayı unutma...`
                  }
                }
              },
              Documents: {
                name: 'Documents',
                type: 'dir',
                permissions: 0o755,
                owner: 'x',
                group: 'x',
                mtime: now,
                children: {
                  'todo.txt': {
                    name: 'todo.txt',
                    type: 'file',
                    permissions: 0o644,
                    owner: 'x',
                    group: 'x',
                    mtime: now,
                    content: `- [x] X'e çay demle
- [x] scripts/ klasöründeki kilit mekanizmasını test et
- [ ] /root altındaki gizli notu şifrele`
                  },
                  'old_notes.txt': {
                    name: 'old_notes.txt',
                    type: 'file',
                    permissions: 0o644,
                    owner: 'x',
                    group: 'x',
                    mtime: now,
                    content: `Linux dosya izinleri üç gruptan oluşur:
1. Sahip (u)
2. Grup (g)
3. Diğerleri (o)

Bir script oluşturulduğunda varsayılan olarak çalıştırma izni (x) almaz.`
                  }
                }
              },
              '.secrets': {
                name: '.secrets',
                type: 'dir',
                permissions: 0o700,
                owner: 'x',
                group: 'x',
                mtime: now,
                children: {
                  'first_clue.txt': {
                    name: 'first_clue.txt',
                    type: 'file',
                    permissions: 0o644,
                    owner: 'x',
                    group: 'x',
                    mtime: now,
                    content: `[İPUCU #01 // GİZLİ DİZİN BULUNDU]
Güzel! Linux'ta nokta (.) ile başlayan dosya ve dizinlerin gizlendiğini biliyorsun.

Sıradaki adım:
scripts/unlock.sh scriptini incele.
Script bir parola bekliyor: 'y_was_here_1998'
Fakat çalıştırmadan önce ona koşma yetkisi (chmod +x) vermelisin!`
                  }
                }
              },
              scripts: {
                name: 'scripts',
                type: 'dir',
                permissions: 0o755,
                owner: 'x',
                group: 'x',
                mtime: now,
                children: {
                  'unlock.sh': {
                    name: 'unlock.sh',
                    type: 'file',
                    permissions: 0o644, // Initially NO execute permission!
                    owner: 'x',
                    group: 'x',
                    mtime: now,
                    content: `#!/bin/bash
# Y'nin Otomasyon Kilit Scripti

KEY="$1"
EXPECTED="y_was_here_1998"

if [ -z "$KEY" ]; then
  echo "HATA: Bir anahtar kelime girmelisiniz!"
  echo "Kullanım: ./unlock.sh <anahtar_kelime>"
  exit 1
fi

if [ "$KEY" == "$EXPECTED" ]; then
  echo "[+] KİLİT AÇILDI: Anahtar doğrulandı!"
  echo "[+] TOKEN: Y_AUTH_TOKEN_77a9b0c2"
  echo "------------------------------------------------------"
  echo "Y, en önemli sırrını /root/final_message.txt dosyasına sakladı."
  echo "Normal bir kullanıcı (x) olarak o dosyayı okuyamazsın."
  echo "İpucu: 'sudo' komutunu kullanarak yetkili olmayı dene."
  echo "------------------------------------------------------"
  exit 0
else
  echo "[-] HATA: Geçersiz anahtar! Tekrar deneyin."
  exit 2
fi`
                  }
                }
              }
            }
          }
        }
      },
      opt: {
        name: 'opt',
        type: 'dir',
        permissions: 0o755,
        owner: 'root',
        group: 'root',
        mtime: now,
        children: {
          mission: {
            name: 'mission',
            type: 'dir',
            permissions: 0o755,
            owner: 'root',
            group: 'root',
            mtime: now,
            children: {
              tasks: {
                name: 'tasks',
                type: 'dir',
                permissions: 0o755,
                owner: 'root',
                group: 'root',
                mtime: now,
                children: {}
              },
              evidence: {
                name: 'evidence',
                type: 'dir',
                permissions: 0o755,
                owner: 'root',
                group: 'root',
                mtime: now,
                children: {}
              }
            }
          }
        }
      },
      var: {
        name: 'var',
        type: 'dir',
        permissions: 0o755,
        owner: 'root',
        group: 'root',
        mtime: now,
        children: {
          log: {
            name: 'log',
            type: 'dir',
            permissions: 0o755,
            owner: 'root',
            group: 'root',
            mtime: now,
            children: {
              'system_audit.log': {
                name: 'system_audit.log',
                type: 'file',
                permissions: 0o644,
                owner: 'root',
                group: 'root',
                mtime: now,
                content: `[2026-10-27 15:40:11] SYSTEM_INIT: Linux kernel boot sequence complete (x86_64 POSIX WASM).
[2026-10-27 15:42:04] NETWORK: eth0 link up, IP assigned: 192.168.1.55/24
[2026-10-27 16:01:29] AUTH_DAEMON: User 'y' logged in locally via tty1.
[2026-10-27 16:15:48] CRON_SERVICE: Periodic integrity check performed on /home/x
[2026-10-27 16:32:00] SECURITY_AUDIT: Backup script verified at /home/x/scripts/unlock.sh
[2026-10-27 16:48:19] KEY_VAULT: Emergency authentication key generated.
[2026-10-27 16:48:20] KEY_VAULT: PASSPHRASE='y_was_here_1998' [ACTIVE_TOKEN]
[2026-10-27 17:05:12] SESSION_SUSPEND: User 'y' stepped away from terminal. Awaiting operator.`
              }
            }
          }
        }
      },
      root: {
        name: 'root',
        type: 'dir',
        permissions: 0o700, // Only root can enter
        owner: 'root',
        group: 'root',
        mtime: now,
        children: {
          'final_message.txt': {
            name: 'final_message.txt',
            type: 'file',
            permissions: 0o600, // Only root can read/write!
            owner: 'root',
            group: 'root',
            mtime: now,
            content: `======================================================
  [Y'NİN SON MESAJI - GİZLİ GÖREV TAMAMLANDI]
======================================================

X... Bilgisayarın başına geçeceğini biliyordum.
Merak, bir hacker'ın en büyük gücüdür.

Bu sistemde öğrendiklerin:
1. Linux'un hiyerarşik dosya ağacı ve gizli dosyaları (.)
2. Dosya izinleri (rwx), octal kodlar ve script çalıştırma (+x)
3. Yetki sınırları ve SuperUser (root) gücü

Siber güvenlik sadece komut ezberlemek değildir; sistemin
nasıl düşündüğünü ve nerede kilitlendiğini anlamaktır.

Tebrikler dostum, artık terminalden korkmuyorsun!
Çaylar hazır, mutfağa gel :)

[FLAG: CTF{y_terminal_master_2026_conquered}]`
          }
        }
      },
      etc: {
        name: 'etc',
        type: 'dir',
        permissions: 0o755,
        owner: 'root',
        group: 'root',
        mtime: now,
        children: {
          passwd: {
            name: 'passwd',
            type: 'file',
            permissions: 0o644,
            owner: 'root',
            group: 'root',
            mtime: now,
            content: `root:x:0:0:root:/root:/bin/bash\nx:x:1000:1000:X User:/home/x:/bin/bash\n`
          },
          'os-release': {
            name: 'os-release',
            type: 'file',
            permissions: 0o644,
            owner: 'root',
            group: 'root',
            mtime: now,
            content: `PRETTY_NAME="Debian GNU/Linux 12 (bookworm / CheerpX Container)"\nNAME="Debian GNU/Linux"\nVERSION_ID="12"\nVERSION="12 (bookworm)"\nID=debian\n`
          },
          sudoers: {
            name: 'sudoers',
            type: 'file',
            permissions: 0o440,
            owner: 'root',
            group: 'root',
            mtime: now,
            content: `x ALL=(ALL:ALL) NOPASSWD: ALL\n`
          }
        }
      }
    }
  };

  return { root };
}

// Path navigation and resolution helper
export function resolvePath(cwd: string, targetPath: string): string {
  if (!targetPath || targetPath === '.') return cwd;

  let base = targetPath.startsWith('/') ? '' : cwd;
  if (targetPath.startsWith('~')) {
    base = '/home/x';
    targetPath = targetPath.slice(1);
  }

  const combined = `${base}/${targetPath}`;
  const parts = combined.split('/').filter(Boolean);
  const stack: string[] = [];

  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      stack.pop();
    } else {
      stack.push(part);
    }
  }

  return '/' + stack.join('/');
}

// Find node at absolute path
export function getNodeAtPath(vfs: LinuxVfsState, absPath: string): VfsNode | null {
  if (absPath === '/' || absPath === '') return vfs.root;

  const parts = absPath.split('/').filter(Boolean);
  let current: VfsNode = vfs.root;

  for (const part of parts) {
    if (current.type !== 'dir' || !current.children) return null;
    const next = current.children[part];
    if (!next) return null;
    current = next;
  }

  return current;
}

// Permission evaluator: checks read/write/exec for user
export function checkPermission(node: VfsNode, user: string, mode: 'r' | 'w' | 'x'): boolean {
  if (user === 'root') return true; // root has supreme access

  const p = node.permissions;
  let shift = 0; // others
  if (user === node.owner) {
    shift = 6;
  } else if (user === node.group) {
    shift = 3;
  }

  const mask = (p >> shift) & 7;
  if (mode === 'r') return (mask & 4) !== 0;
  if (mode === 'w') return (mask & 2) !== 0;
  if (mode === 'x') return (mask & 1) !== 0;
  return false;
}

// Core Linux shell command executor
export function executeVfsCommand(
  rawCmd: string,
  cwd: string,
  user: string,
  vfs: LinuxVfsState
): CommandResult {
  const trimmed = rawCmd.trim();
  if (!trimmed) {
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  const tokens = parseCommandTokens(trimmed);
  const cmd = tokens[0];
  const args = tokens.slice(1);

  // Sudo wrapper
  if (cmd === 'sudo') {
    if (args.length === 0) {
      return {
        stdout: '',
        stderr: 'usage: sudo command [args...]',
        exitCode: 1
      };
    }
    const subCmdLine = args.join(' ');
    // Execute as root
    const res = executeVfsCommand(subCmdLine, cwd, 'root', vfs);
    return res;
  }

  // pwd
  if (cmd === 'pwd') {
    return { stdout: cwd, stderr: '', exitCode: 0 };
  }

  // whoami
  if (cmd === 'whoami') {
    return { stdout: user, stderr: '', exitCode: 0 };
  }

  // uname
  if (cmd === 'uname') {
    if (args.includes('-a')) {
      return {
        stdout: 'Linux y-machine 6.1.0-21-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.90-1 x86_64 GNU/Linux',
        stderr: '',
        exitCode: 0
      };
    }
    return { stdout: 'Linux', stderr: '', exitCode: 0 };
  }

  // cd
  if (cmd === 'cd') {
    const target = args[0] || '/home/x';
    const resolved = resolvePath(cwd, target);
    const node = getNodeAtPath(vfs, resolved);

    if (!node) {
      return { stdout: '', stderr: `bash: cd: ${target}: No such file or directory`, exitCode: 1 };
    }
    if (node.type !== 'dir') {
      return { stdout: '', stderr: `bash: cd: ${target}: Not a directory`, exitCode: 1 };
    }
    if (!checkPermission(node, user, 'x')) {
      return { stdout: '', stderr: `bash: cd: ${target}: Permission denied`, exitCode: 1 };
    }
    return { stdout: '', stderr: '', exitCode: 0, newCwd: resolved };
  }

  // ls
  if (cmd === 'ls') {
    const showAll = args.some(a => a.startsWith('-') && a.includes('a'));
    const showLong = args.some(a => a.startsWith('-') && a.includes('l'));
    const pathArg = args.find(a => !a.startsWith('-')) || '.';
    const resolved = resolvePath(cwd, pathArg);
    const node = getNodeAtPath(vfs, resolved);

    if (!node) {
      return { stdout: '', stderr: `ls: cannot access '${pathArg}': No such file or directory`, exitCode: 2 };
    }
    if (node.type === 'file') {
      return { stdout: node.name, stderr: '', exitCode: 0 };
    }
    if (!checkPermission(node, user, 'r')) {
      return { stdout: '', stderr: `ls: cannot open directory '${pathArg}': Permission denied`, exitCode: 2 };
    }

    const children = node.children || {};
    let names = Object.keys(children);
    if (!showAll) {
      names = names.filter(n => !n.startsWith('.'));
    }
    names.sort();

    if (showLong) {
      const lines = names.map(n => {
        const c = children[n];
        const perms = formatPermissions(c);
        const size = c.type === 'file' ? (c.content?.length || 0) : 4096;
        const dateStr = 'Oct 27 12:00';
        return `${perms} 1 ${c.owner} ${c.group} ${size.toString().padStart(5, ' ')} ${dateStr} ${c.name}${c.type === 'dir' ? '/' : ''}`;
      });
      return { stdout: `total ${names.length * 4}\n` + lines.join('\n'), stderr: '', exitCode: 0 };
    } else {
      return { stdout: names.join('  '), stderr: '', exitCode: 0 };
    }
  }

  // cat
  if (cmd === 'cat') {
    if (args.length === 0) {
      return { stdout: '', stderr: 'cat: missing file operand', exitCode: 1 };
    }
    const outputs: string[] = [];
    for (const fileArg of args) {
      const resolved = resolvePath(cwd, fileArg);
      const node = getNodeAtPath(vfs, resolved);
      if (!node) {
        return { stdout: '', stderr: `cat: ${fileArg}: No such file or directory`, exitCode: 1 };
      }
      if (node.type === 'dir') {
        return { stdout: '', stderr: `cat: ${fileArg}: Is a directory`, exitCode: 1 };
      }
      if (!checkPermission(node, user, 'r')) {
        return { stdout: '', stderr: `cat: ${fileArg}: Permission denied`, exitCode: 1 };
      }
      outputs.push(node.content || '');
    }
    return { stdout: outputs.join('\n'), stderr: '', exitCode: 0 };
  }

  // head / tail
  if (cmd === 'head' || cmd === 'tail') {
    const fileArg = args.find(a => !a.startsWith('-'));
    if (!fileArg) return { stdout: '', stderr: `${cmd}: missing operand`, exitCode: 1 };
    const resolved = resolvePath(cwd, fileArg);
    const node = getNodeAtPath(vfs, resolved);
    if (!node || node.type !== 'file') {
      return { stdout: '', stderr: `${cmd}: cannot open '${fileArg}': No such file or directory`, exitCode: 1 };
    }
    if (!checkPermission(node, user, 'r')) {
      return { stdout: '', stderr: `${cmd}: cannot open '${fileArg}': Permission denied`, exitCode: 1 };
    }
    const lines = (node.content || '').split('\n');
    const slice = cmd === 'head' ? lines.slice(0, 10) : lines.slice(-10);
    return { stdout: slice.join('\n'), stderr: '', exitCode: 0 };
  }

  // grep
  if (cmd === 'grep') {
    if (args.length < 2) {
      return { stdout: '', stderr: 'Usage: grep <pattern> <file>', exitCode: 2 };
    }
    const pattern = args[0];
    const fileArg = args[1];
    const resolved = resolvePath(cwd, fileArg);
    const node = getNodeAtPath(vfs, resolved);
    if (!node || node.type !== 'file') {
      return { stdout: '', stderr: `grep: ${fileArg}: No such file or directory`, exitCode: 2 };
    }
    if (!checkPermission(node, user, 'r')) {
      return { stdout: '', stderr: `grep: ${fileArg}: Permission denied`, exitCode: 2 };
    }
    const matches = (node.content || '').split('\n').filter(line => line.includes(pattern));
    return { stdout: matches.join('\n'), stderr: '', exitCode: matches.length > 0 ? 0 : 1 };
  }

  // find
  if (cmd === 'find') {
    const nameFlagIdx = args.indexOf('-name');
    const pattern = nameFlagIdx !== -1 && args[nameFlagIdx + 1] ? args[nameFlagIdx + 1].replace(/['"]/g, '') : null;
    let targetDir = '.';
    if (args.length > 0 && !args[0].startsWith('-')) {
      targetDir = args[0];
    }
    const resolved = resolvePath(cwd, targetDir);
    const startNode = getNodeAtPath(vfs, resolved);
    if (!startNode) {
      return { stdout: '', stderr: `find: '${targetDir}': No such file or directory`, exitCode: 1 };
    }
    const results: string[] = [];
    const walk = (node: VfsNode, currPath: string) => {
      let isMatch = true;
      if (pattern) {
        if (pattern.startsWith('*')) {
          const suffix = pattern.slice(1);
          isMatch = node.name.endsWith(suffix);
        } else if (pattern.endsWith('*')) {
          const prefix = pattern.slice(0, -1);
          isMatch = node.name.startsWith(prefix);
        } else {
          isMatch = node.name === pattern || node.name.includes(pattern);
        }
      }
      if (isMatch && currPath !== '') {
        results.push(currPath);
      }
      if (node.type === 'dir' && node.children) {
        for (const [childName, childNode] of Object.entries(node.children)) {
          const childPath = currPath === '/' ? `/${childName}` : `${currPath}/${childName}`;
          walk(childNode, childPath);
        }
      }
    };
    walk(startNode, resolved === '/' ? '/' : resolved);
    return { stdout: results.join('\n'), stderr: '', exitCode: 0 };
  }

  // file
  if (cmd === 'file') {
    if (args.length === 0) {
      return { stdout: '', stderr: 'file: missing argument', exitCode: 1 };
    }
    const fileArg = args[0];
    const resolved = resolvePath(cwd, fileArg);
    const node = getNodeAtPath(vfs, resolved);
    if (!node) {
      return { stdout: '', stderr: `file: cannot open '${fileArg}': No such file or directory`, exitCode: 1 };
    }
    if (node.type === 'dir') {
      return { stdout: `${fileArg}: directory`, stderr: '', exitCode: 0 };
    }
    if (node.name.endsWith('.sh')) {
      return { stdout: `${fileArg}: POSIX shell script, ASCII text executable`, stderr: '', exitCode: 0 };
    }
    if (node.name.endsWith('.log') || node.name.endsWith('.txt')) {
      return { stdout: `${fileArg}: ASCII text`, stderr: '', exitCode: 0 };
    }
    return { stdout: `${fileArg}: ASCII text data`, stderr: '', exitCode: 0 };
  }

  // chmod
  if (cmd === 'chmod') {
    if (args.length < 2) {
      return { stdout: '', stderr: 'chmod: missing operand', exitCode: 1 };
    }
    const modeStr = args[0];
    const fileArg = args[1];
    const resolved = resolvePath(cwd, fileArg);
    const node = getNodeAtPath(vfs, resolved);
    if (!node) {
      return { stdout: '', stderr: `chmod: cannot access '${fileArg}': No such file or directory`, exitCode: 1 };
    }
    if (user !== 'root' && user !== node.owner) {
      return { stdout: '', stderr: `chmod: changing permissions of '${fileArg}': Operation not permitted`, exitCode: 1 };
    }

    if (modeStr === '+x') {
      node.permissions |= 0o111;
    } else if (modeStr === '-x') {
      node.permissions &= ~0o111;
    } else if (/^[0-7]{3,4}$/.test(modeStr)) {
      node.permissions = parseInt(modeStr, 8);
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  // Script direct execution: ./unlock.sh or /home/x/scripts/unlock.sh
  if (cmd.startsWith('./') || cmd.startsWith('/') || cmd.endsWith('.sh')) {
    const resolved = resolvePath(cwd, cmd);
    const node = getNodeAtPath(vfs, resolved);
    if (!node) {
      return { stdout: '', stderr: `bash: ${cmd}: No such file or directory`, exitCode: 127 };
    }
    if (node.type !== 'file') {
      return { stdout: '', stderr: `bash: ${cmd}: Is a directory`, exitCode: 126 };
    }
    if (!checkPermission(node, user, 'x')) {
      return { stdout: '', stderr: `bash: ${cmd}: Permission denied`, exitCode: 126 };
    }

    // Execute unlock.sh logic
    if (node.name === 'unlock.sh') {
      const keyArg = args[0] || '';
      if (!keyArg) {
        return {
          stdout: `HATA: Bir anahtar kelime girmelisiniz!\nKullanım: ./unlock.sh <anahtar_kelime>`,
          stderr: '',
          exitCode: 1
        };
      }
      if (keyArg === 'y_was_here_1998') {
        return {
          stdout: `[+] KİLİT AÇILDI: Anahtar doğrulandı!\n[+] TOKEN: Y_AUTH_TOKEN_77a9b0c2\n------------------------------------------------------\nY, en önemli sırrını /root/final_message.txt dosyasına sakladı.\nNormal bir kullanıcı (x) olarak o dosyayı okuyamazsın.\nİpucu: 'sudo' komutunu kullanarak yetkili olmayı dene.\n------------------------------------------------------`,
          stderr: '',
          exitCode: 0
        };
      } else {
        return {
          stdout: `[-] HATA: Geçersiz anahtar! Tekrar deneyin.`,
          stderr: '',
          exitCode: 2
        };
      }
    }
  }

  // bash script interpreter invocation: bash scripts/unlock.sh ...
  if (cmd === 'bash' || cmd === 'sh') {
    if (args.length === 0) {
      return { stdout: 'bash 5.2.15(1)-release', stderr: '', exitCode: 0 };
    }
    const scriptPath = args[0];
    const scriptArgs = args.slice(1);
    const resolved = resolvePath(cwd, scriptPath);
    const node = getNodeAtPath(vfs, resolved);
    if (!node) {
      return { stdout: '', stderr: `bash: ${scriptPath}: No such file or directory`, exitCode: 127 };
    }
    // Note: bash can read and execute if read permission exists even without +x!
    if (!checkPermission(node, user, 'r')) {
      return { stdout: '', stderr: `bash: ${scriptPath}: Permission denied`, exitCode: 126 };
    }

    if (node.name === 'unlock.sh') {
      const keyArg = scriptArgs[0] || '';
      if (!keyArg) {
        return {
          stdout: `HATA: Bir anahtar kelime girmelisiniz!\nKullanım: bash unlock.sh <anahtar_kelime>`,
          stderr: '',
          exitCode: 1
        };
      }
      if (keyArg === 'y_was_here_1998') {
        return {
          stdout: `[+] KİLİT AÇILDI: Anahtar doğrulandı!\n[+] TOKEN: Y_AUTH_TOKEN_77a9b0c2\n------------------------------------------------------\nY, en önemli sırrını /root/final_message.txt dosyasına sakladı.\nNormal bir kullanıcı (x) olarak o dosyayı okuyamazsın.\nİpucu: 'sudo' komutunu kullanarak yetkili olmayı dene.\n------------------------------------------------------`,
          stderr: '',
          exitCode: 0
        };
      } else {
        return {
          stdout: `[-] HATA: Geçersiz anahtar! Tekrar deneyin.`,
          stderr: '',
          exitCode: 2
        };
      }
    }
  }

  // apt vs snap demonstration for curriculum section 5
  if (cmd === 'apt' || cmd === 'apt-get') {
    return {
      stdout: `Reading package lists... Done\nBuilding dependency tree... Done\n[i] Debian APT Paket Yöneticisi: Paket indeksleri yerel depoyla eşleştirildi.`,
      stderr: '',
      exitCode: 0
    };
  }

  if (cmd === 'snap') {
    return {
      stdout: '',
      stderr: `error: cannot communicate with server: Post "http://localhost/v2/snaps": dial unix /run/snapd.socket: connect: no such file or directory\n[!] TEKNİK NOT: CheerpX / Tarayıcı WebAssembly ortamlarında systemd ve kernel loop-mount (squashfs) desteği bulunmadığından snapd arka plan servisi çalışamaz. Minimal Linux ve WASM kapsayıcılarında APT veya doğrudan ikili (binary) dağıtımlar tercih edilir.`,
      exitCode: 1
    };
  }

  // clear
  if (cmd === 'clear') {
    return { stdout: '\x1b[2J\x1b[0;0H', stderr: '', exitCode: 0 };
  }

  // help
  if (cmd === 'help') {
    return {
      stdout: `Mevcut komutlar:
  pwd, whoami, uname, ls, cd, cat, head, tail, grep,
  chmod, sudo, bash, ./<script.sh>, apt, snap, clear, help`,
      stderr: '',
      exitCode: 0
    };
  }

  return {
    stdout: '',
    stderr: `bash: ${cmd}: command not found`,
    exitCode: 127
  };
}

// Simple bash command line tokenizer with quote awareness
function parseCommandTokens(line: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inDouble = false;
  let inSingle = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (char === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (/\s/.test(char) && !inDouble && !inSingle) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}
