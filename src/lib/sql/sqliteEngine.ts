import initSqlJs, { type Database } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

let sqlPromise: Promise<any> | null = null;
let activeDb: Database | null = null;
let wasmFailed = false;

// Default Seed Data for In-Memory Fallback & WASM
const SEED_PRODUCTS = [
  [1, 'Cyber Deck MK-4', 1299.99, 'Electronics', 'High-speed hardware penetration testing deck'],
  [2, 'Yagi 2.4/5GHz Antenna', 149.50, 'Electronics', 'Long range directional Wi-Fi recon unit'],
  [3, 'Rubber Ducky Pro', 59.99, 'Gadgets', 'Keystroke injection offensive automation'],
  [4, 'Black Tactical Hoodie', 45.00, 'Apparel', 'Comfortable stealth cotton hoodie'],
  [5, 'RFID Keyfob Duplicator', 89.00, 'Gadgets', '125kHz & 13.56MHz contactless cloner']
];

const SEED_CORP_ACCOUNTS = [
  [101, 'sysadmin_chief', 'chief@corp-defense.internal', 'FLAG{un10n_schema_d1sc0very_m4st3r}', 'superuser'],
  [102, 'dev_auditor', 'auditor@corp-defense.internal', 'audit_hash_b9901', 'security_analyst'],
  [103, 'ops_engineer', 'ops@corp-defense.internal', 'ops_hash_12944', 'developer']
];

export async function getSqlInstance() {
  if (wasmFailed) return null;
  if (!sqlPromise) {
    sqlPromise = (async () => {
      try {
        const res = await fetch(sqlWasmUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching wasm`);
        const wasmBinary = await res.arrayBuffer();
        return await initSqlJs({ wasmBinary } as any);
      } catch (err) {
        console.warn('WASM load error, switching to native JS SQL engine:', err);
        wasmFailed = true;
        return null;
      }
    })();
  }
  return sqlPromise;
}

export async function resetDatabase(): Promise<Database | null> {
  if (wasmFailed) return null;
  try {
    const SQL = await getSqlInstance();
    if (!SQL) {
      wasmFailed = true;
      return null;
    }

    if (activeDb) {
      try {
        activeDb.close();
      } catch {
        // ignore
      }
    }

    const db = new SQL.Database();

    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        api_key TEXT NOT NULL
      );
    `);

    db.run(`
      INSERT INTO users (id, username, password, role, api_key) VALUES
      (1, 'administrator', 'FLAG{sqli_4uth_byp4ss_h4sh_pwn3d}', 'admin', 'sk_live_adm_789123'),
      (2, 'carlos', 'carlosPassword99', 'user', 'sk_live_usr_445511'),
      (3, 'wiener', 'peter', 'user', 'sk_live_usr_998822');
    `);

    db.run(`
      CREATE TABLE system_secrets (
        key_id INTEGER PRIMARY KEY,
        secret_name TEXT NOT NULL,
        secret_value TEXT NOT NULL,
        classification TEXT NOT NULL
      );
    `);

    db.run(`
      INSERT INTO system_secrets (key_id, secret_name, secret_value, classification) VALUES
      (1, 'root_vault_flag', 'FLAG{bl1nd_sqli_b00l3an_3xtr4ct10n}', 'TOP_SECRET_ORCON'),
      (2, 'db_encryption_master_key', '0x99F4A8C1102DE', 'RESTRICTED'),
      (3, 'error_sqli_hash_leak', 'FLAG{3rr0r_b4s3d_sqli_c4st_l34k}', 'CONFIDENTIAL');
    `);

    db.run(`
      CREATE TABLE corp_accounts (
        acc_id INTEGER PRIMARY KEY,
        acc_username TEXT NOT NULL,
        acc_email TEXT NOT NULL,
        acc_pass_hash TEXT NOT NULL,
        acc_role TEXT NOT NULL
      );
    `);

    for (const acc of SEED_CORP_ACCOUNTS) {
      db.run(
        `INSERT INTO corp_accounts (acc_id, acc_username, acc_email, acc_pass_hash, acc_role) VALUES (?, ?, ?, ?, ?)`,
        acc
      );
    }

    db.run(`
      CREATE TABLE products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL
      );
    `);

    for (const p of SEED_PRODUCTS) {
      db.run(
        `INSERT INTO products (id, name, price, category, description) VALUES (?, ?, ?, ?, ?)`,
        p
      );
    }

    activeDb = db;
    return db;
  } catch (err) {
    console.warn('SQLite init warning, using JS SQL fallback:', err);
    wasmFailed = true;
    return null;
  }
}

export interface SqlQueryResult {
  columns: string[];
  values: any[][];
  error?: string;
  rawQuery: string;
}

/**
 * Executes queries against SQLite WASM if available;
 * Otherwise executes against the resilient In-Memory SQL Simulator.
 */
export async function executeVulnerableQuery(rawQuery: string): Promise<SqlQueryResult> {
  // Try WASM execution first if available
  if (!wasmFailed) {
    try {
      let db = activeDb;
      if (!db) {
        db = await resetDatabase();
      }

      if (db) {
        const res = db.exec(rawQuery);
        if (res.length === 0) {
          return { columns: [], values: [], rawQuery };
        }
        return {
          columns: res[0].columns,
          values: res[0].values,
          rawQuery
        };
      }
    } catch (err: any) {
      const msg = String(err?.message || err);
      // If error is a WASM compilation/fetch failure, fall through to native simulator
      if (msg.includes('WebAssembly') || msg.includes('CompileError') || msg.includes('magic word')) {
        wasmFailed = true;
      } else {
        return {
          columns: [],
          values: [],
          error: msg,
          rawQuery
        };
      }
    }
  }

  // --- Resilient In-Memory SQL Engine Fallback ---
  return executeInMemorySql(rawQuery);
}

function executeInMemorySql(rawQuery: string): SqlQueryResult {
  const qLower = rawQuery.toLowerCase();
  const productCols = ['id', 'name', 'price', 'category'];

  // 1. ORDER BY column count checks
  const orderMatch = rawQuery.match(/order\s+by\s+(\d+)/i);
  if (orderMatch) {
    const colNum = parseInt(orderMatch[1], 10);
    if (colNum > 4) {
      return {
        columns: [],
        values: [],
        error: `1st ORDER BY term out of range - should be between 1 and 4`,
        rawQuery
      };
    }
  }

  // 2. UNION SELECT Attack
  if (qLower.includes('union') && qLower.includes('select')) {
    // Check if selecting from corp_accounts
    const rows = [...SEED_PRODUCTS.slice(0, 2)];
    if (qLower.includes('corp_accounts') || qLower.includes('acc_')) {
      const unionRow = [1, 'sysadmin_chief', 'FLAG{un10n_schema_d1sc0very_m4st3r}', 'superuser'];
      return {
        columns: productCols,
        values: [...rows, unionRow],
        rawQuery
      };
    }
    // Generic UNION test
    return {
      columns: productCols,
      values: [...rows, [1, 'Test Title', '99.99', 'Test Category']],
      rawQuery
    };
  }

  // 3. Blind Boolean SQLi
  if (qLower.includes('1=2') || qLower.includes('1 = 2')) {
    return {
      columns: productCols,
      values: [],
      rawQuery
    };
  }
  if (qLower.includes('1=1') || qLower.includes('1 = 1') || qLower.includes("' or 1=1")) {
    return {
      columns: productCols,
      values: SEED_PRODUCTS,
      rawQuery
    };
  }

  // 4. system_secrets lookup (Error-based or lookup)
  if (qLower.includes('system_secrets')) {
    return {
      columns: ['key_id', 'secret_name', 'secret_value', 'classification'],
      values: [
        [1, 'root_vault_flag', 'FLAG{bl1nd_sqli_b00l3an_3xtr4ct10n}', 'TOP_SECRET_ORCON']
      ],
      rawQuery
    };
  }

  // 5. Standard Category Filtering
  const catMatch = rawQuery.match(/category\s*=\s*'([^']*)'/i);
  if (catMatch) {
    const cat = catMatch[1];
    const filtered = SEED_PRODUCTS.filter((p) => String(p[3]).toLowerCase() === cat.toLowerCase());
    return {
      columns: productCols,
      values: filtered,
      rawQuery
    };
  }

  return {
    columns: productCols,
    values: SEED_PRODUCTS,
    rawQuery
  };
}

/**
 * Executes a query in Blind SQLi mode.
 */
export async function executeBlindCondition(rawSql: string): Promise<{ success: boolean; error?: string }> {
  const res = await executeVulnerableQuery(rawSql);
  if (res.error) {
    return { success: false, error: res.error };
  }
  return { success: res.values.length > 0 };
}
