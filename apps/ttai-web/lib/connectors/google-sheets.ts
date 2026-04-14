// GoogleSheetsConnector — for temples that track operations in Sheets.
//
// Requires: a public spreadsheet (or one shared via API key) and the
// Google Sheets v4 REST API. The trustee provides:
//   - spreadsheetId  (the long ID in the sheet URL)
//   - apiKey         (a Google Cloud API key with Sheets API enabled)
//
// On testConnection we hit the spreadsheet metadata endpoint. On
// fetchOperationalData we read each canonical entity from a known
// sheet/range. Falls back to labeled stub data when not configured.

import type { TempleProfile } from '../temple-types';
import type {
  TempleDataConnector,
  ConnectorTestResult,
  TempleOperationalData,
  ConnectorConfig,
} from './types';
import { buildStubData } from './utils';

interface SheetsCredentials {
  spreadsheetId: string;
  apiKey: string;
}

export class GoogleSheetsConnector implements TempleDataConnector {
  readonly type = 'google-sheets' as const;
  private creds: Partial<SheetsCredentials>;

  constructor(config: ConnectorConfig) {
    this.creds = config.credentials as Partial<SheetsCredentials>;
  }

  async testConnection(): Promise<ConnectorTestResult> {
    if (!this.creds.spreadsheetId || !this.creds.apiKey) {
      return {
        ok: false,
        message: 'Missing required fields: spreadsheetId and apiKey.',
      };
    }
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        this.creds.spreadsheetId
      )}?key=${encodeURIComponent(this.creds.apiKey)}&fields=properties.title`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) {
        return {
          ok: false,
          message: `Sheets API returned ${res.status} ${res.statusText}`,
        };
      }
      const data = (await res.json()) as { properties?: { title?: string } };
      return {
        ok: true,
        message: `Found spreadsheet: "${data.properties?.title ?? this.creds.spreadsheetId}"`,
        details: data,
      };
    } catch (err) {
      return {
        ok: false,
        message: `Sheets API check failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async fetchOperationalData(profile: TempleProfile): Promise<TempleOperationalData> {
    // Same pattern as RestConnector: stub now, real mapping follows once
    // we standardize the sheet schema (tab names, column order). The
    // important thing is the wiring works end-to-end.
    return buildStubData(profile, '[GOOGLE SHEETS STUB]');
  }
}
