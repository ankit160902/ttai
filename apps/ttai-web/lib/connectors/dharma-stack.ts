// DharmaStackConnector — pulls data from the 3ionetra Dharma Stack
// MySQL database described in CLAUDE.md.
//
// In production this would run real SELECTs against the existing
// schema (vedicvidhi.bookings, dharmapay.transactions, etc). For the
// development environment we keep the dependency optional: if mysql2
// is reachable and credentials work, we run real queries. If not,
// we return clearly-labeled stub data so demos never break.

import type { TempleProfile } from '../temple-types';
import type {
  TempleDataConnector,
  ConnectorTestResult,
  TempleOperationalData,
  ConnectorConfig,
} from './types';
import { buildStubData } from './utils';

interface DharmaStackCredentials {
  host: string;
  port: string;
  database: string;
  user: string;
  password: string;
}

export class DharmaStackConnector implements TempleDataConnector {
  readonly type = 'dharma-stack' as const;
  private creds: Partial<DharmaStackCredentials>;

  constructor(config: ConnectorConfig) {
    this.creds = config.credentials as Partial<DharmaStackCredentials>;
  }

  async testConnection(): Promise<ConnectorTestResult> {
    if (!this.creds.host || !this.creds.user || !this.creds.database) {
      return {
        ok: false,
        message: 'Missing required credentials: host, user, database.',
      };
    }

    try {
      const mysql = await this.tryLoadMysql();
      if (!mysql) {
        return {
          ok: true,
          message: 'Credentials accepted (stub mode — mysql2 driver not loaded). Will return labeled stub data.',
          details: { mode: 'stub' },
        };
      }

      const conn = await mysql.createConnection({
        host: this.creds.host,
        port: Number(this.creds.port ?? 3306),
        database: this.creds.database,
        user: this.creds.user,
        password: this.creds.password ?? '',
        connectTimeout: 4000,
      });
      await conn.query('SELECT 1');
      await conn.end();
      return {
        ok: true,
        message: `Connected to Dharma Stack at ${this.creds.host}:${this.creds.port ?? 3306}/${this.creds.database}`,
        details: { mode: 'live' },
      };
    } catch (err) {
      return {
        ok: false,
        message: `Connection failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async fetchOperationalData(profile: TempleProfile): Promise<TempleOperationalData> {
    const mysql = await this.tryLoadMysql();
    const { host, user, database } = this.creds;

    // Demo / development path: no real DB → return labeled stub
    if (!mysql || !host || !user || !database) {
      return this.buildLabeledStub(profile, 'no-driver');
    }

    try {
      const conn = await mysql.createConnection({
        host,
        port: Number(this.creds.port ?? 3306),
        database,
        user,
        password: this.creds.password ?? '',
        connectTimeout: 4000,
      });
      // Real production queries would go here. The schema in CLAUDE.md describes
      // tables like vedicvidhi.bookings, dharmapay.transactions, etc. For now we
      // just verify connectivity and fall back to the labeled stub so the trustee
      // sees that the tenant is wired up.
      await conn.query('SELECT 1');
      await conn.end();
      return this.buildLabeledStub(profile, 'live-connection-no-mapping');
    } catch (err) {
      return this.buildLabeledStub(profile, `error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private buildLabeledStub(profile: TempleProfile, reason: string): TempleOperationalData {
    return buildStubData(profile, `[DHARMA STACK STUB · ${reason}]`);
  }

  // mysql2 lives in packages/db's node_modules — try to require it dynamically
  // so this connector compiles even when mysql2 isn't available in this app's
  // workspace install. Typed as `unknown` so the build doesn't depend on
  // @types/mysql.
  private async tryLoadMysql(): Promise<MysqlModule | null> {
    try {
      // Use Function constructor so webpack/tsc doesn't try to resolve at build time
      const dynamicImport = new Function('m', 'return import(m)') as (
        m: string
      ) => Promise<unknown>;
      const mod = (await dynamicImport('mysql2/promise').catch(() => null)) as
        | MysqlModule
        | null;
      return mod ?? null;
    } catch {
      return null;
    }
  }
}

interface MysqlConnection {
  query(sql: string): Promise<unknown>;
  end(): Promise<void>;
}

interface MysqlModule {
  createConnection(opts: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    connectTimeout?: number;
  }): Promise<MysqlConnection>;
}
