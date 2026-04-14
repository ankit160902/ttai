import { NextResponse } from 'next/server';
import { CONNECTOR_CATALOG } from '../../../lib/connectors/registry';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ connectors: CONNECTOR_CATALOG });
}
