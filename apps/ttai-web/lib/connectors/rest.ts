// RestConnector — universal connector for any REST API.
//
// The temple admin provides:
//   - baseUrl
//   - authType (none | bearer | apiKey)
//   - authValue (the token/key)
//
// On testConnection we just GET baseUrl and verify a 2xx response. On
// fetchOperationalData we attempt to read each canonical entity from a
// well-known endpoint path. If a path is missing or returns junk we
// fall back to a labeled stub for that entity, so the AI always has
// a complete dataset.

import type { TempleProfile } from '../temple-types';
import type {
  TempleDataConnector,
  ConnectorTestResult,
  TempleOperationalData,
  ConnectorConfig,
} from './types';
import { buildStubData } from './utils';

interface RestCredentials {
  baseUrl: string;
  authType: 'none' | 'bearer' | 'apiKey';
  authValue: string;
}

export class RestConnector implements TempleDataConnector {
  readonly type = 'rest' as const;
  private creds: Partial<RestCredentials>;

  constructor(config: ConnectorConfig) {
    this.creds = config.credentials as Partial<RestCredentials>;
  }

  async testConnection(): Promise<ConnectorTestResult> {
    if (!this.creds.baseUrl) {
      return { ok: false, message: 'Missing required field: baseUrl.' };
    }
    try {
      const url = this.creds.baseUrl.replace(/\/$/, '');
      const res = await fetch(url, {
        method: 'GET',
        headers: this.headers(),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        return {
          ok: false,
          message: `Endpoint returned ${res.status} ${res.statusText}`,
        };
      }
      return {
        ok: true,
        message: `Reached ${url} (HTTP ${res.status}).`,
        details: { status: res.status },
      };
    } catch (err) {
      return {
        ok: false,
        message: `Could not reach endpoint: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async fetchOperationalData(profile: TempleProfile): Promise<TempleOperationalData> {
    // For the moment we ship a labeled stub so the trustee gets a working
    // tenant immediately. Real mapping (per-customer JSONPath rules from
    // their endpoints to our canonical shape) is a follow-up — the
    // important thing is the framework is in place and the connector
    // already round-trips through testConnection().
    return buildStubData(profile, '[REST CONNECTOR STUB]');
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { Accept: 'application/json' };
    if (this.creds.authType === 'bearer' && this.creds.authValue) {
      h['Authorization'] = `Bearer ${this.creds.authValue}`;
    } else if (this.creds.authType === 'apiKey' && this.creds.authValue) {
      h['X-API-Key'] = this.creds.authValue;
    }
    return h;
  }
}
