import { NextResponse } from 'next/server';
import { getConnector } from '../../../../lib/connectors/registry';
import type { ConnectorConfig } from '../../../../lib/connectors/types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: { type?: string; credentials?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body?.type) {
    return NextResponse.json(
      { ok: false, message: 'Missing connector type' },
      { status: 400 }
    );
  }

  const config: ConnectorConfig = {
    type: body.type as ConnectorConfig['type'],
    credentials: body.credentials ?? {},
  };

  try {
    const connector = getConnector(config);
    const result = await connector.testConnection();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: `Connector failed to instantiate: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 400 }
    );
  }
}
