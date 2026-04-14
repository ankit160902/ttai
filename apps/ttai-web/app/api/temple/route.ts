import { NextResponse } from 'next/server';
import { getTemple, getTempleSummaries } from '../../../lib/temple-store';
import { getRowCounts } from '../../../lib/mock-data';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  // If no id, return list of all temples
  if (!id) {
    const summaries = await getTempleSummaries();
    return NextResponse.json({ temples: summaries });
  }

  const temple = await getTemple(id);
  if (!temple) {
    return NextResponse.json({ error: 'Temple not found' }, { status: 404 });
  }

  const rowCounts = getRowCounts(temple);
  return NextResponse.json({ temple, rowCounts });
}
