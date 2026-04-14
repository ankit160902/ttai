import type { TempleProfile } from '../temple-types';
import type { TempleDataConnector, ConnectorTestResult, TempleOperationalData, ConnectorConfig } from './types';
import { generateTempleData } from '../temple-seed';
import { toOperationalData } from './utils';

export class MockConnector implements TempleDataConnector {
  readonly type = 'mock' as const;
  constructor(_config: ConnectorConfig) {}

  async testConnection(): Promise<ConnectorTestResult> {
    return { ok: true, message: 'Mock connector is always available.' };
  }

  async fetchOperationalData(profile: TempleProfile): Promise<TempleOperationalData> {
    return toOperationalData(generateTempleData(profile));
  }
}
