// Connector registry — single factory + catalog metadata for the UI.
//
// To add a new SaaS adapter:
//   1. Create lib/connectors/<your-saas>.ts implementing TempleDataConnector
//   2. Add a case to getConnector() below
//   3. Add a CONNECTOR_CATALOG entry describing the credential fields
// That's it. The store, the API routes, and the UI all read from
// CONNECTOR_CATALOG, so they pick up the new option automatically.

import type {
  ConnectorConfig,
  ConnectorCatalogEntry,
  TempleDataConnector,
} from './types';
import { MockConnector } from './mock';
import { DharmaStackConnector } from './dharma-stack';
import { RestConnector } from './rest';
import { GoogleSheetsConnector } from './google-sheets';

export function getConnector(config: ConnectorConfig): TempleDataConnector {
  switch (config.type) {
    case 'mock':
      return new MockConnector(config);
    case 'dharma-stack':
      return new DharmaStackConnector(config);
    case 'rest':
      return new RestConnector(config);
    case 'google-sheets':
      return new GoogleSheetsConnector(config);
    default: {
      const _exhaustive: never = config.type;
      throw new Error(`Unknown connector type: ${String(_exhaustive)}`);
    }
  }
}

export const CONNECTOR_CATALOG: ConnectorCatalogEntry[] = [
  {
    type: 'mock',
    label: 'Demo / Mock data',
    description:
      'Auto-generates a realistic starter dataset. Use this to try TTAI before connecting a real source.',
    credentialFields: [],
  },
  {
    type: 'dharma-stack',
    label: '3ionetra Dharma Stack',
    description:
      "Connects directly to the temple's Dharma Stack MySQL database (the 3ionetra operating platform).",
    credentialFields: [
      { key: 'host', label: 'Host', placeholder: 'db.dharmastack.example.com', required: true },
      { key: 'port', label: 'Port', placeholder: '3306', type: 'number', required: true },
      { key: 'database', label: 'Database', placeholder: 'dharma_temple_001', required: true },
      { key: 'user', label: 'Username', placeholder: 'ttai_reader', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
    ],
  },
  {
    type: 'rest',
    label: 'Generic REST API',
    description:
      'Plug in any custom temple management system that exposes a REST API.',
    credentialFields: [
      { key: 'baseUrl', label: 'Base URL', placeholder: 'https://api.mytemple.org', required: true },
      { key: 'authType', label: 'Auth type', placeholder: 'bearer | apiKey | none', required: true },
      { key: 'authValue', label: 'Auth value', type: 'password', placeholder: 'Token or API key' },
    ],
  },
  {
    type: 'google-sheets',
    label: 'Google Sheets',
    description:
      'For temples that track operations in spreadsheets. Reads from a published Google Sheet via the Sheets API.',
    credentialFields: [
      { key: 'spreadsheetId', label: 'Spreadsheet ID', placeholder: '1AbCdEfGhIjKlMnOpQrStUvWxYz', required: true },
      { key: 'apiKey', label: 'Google API key', type: 'password', required: true },
    ],
  },
];

export function findCatalogEntry(type: string): ConnectorCatalogEntry | undefined {
  return CONNECTOR_CATALOG.find((c) => c.type === type);
}
