import { NextResponse } from 'next/server';
import { getTemple } from '../../../../lib/temple-store';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = body?.templeId ?? 'temple-001';

  const temple = await getTemple(id);
  if (!temple) {
    return NextResponse.json({ error: `Temple ${id} not found` }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: `Data loaded for ${temple.name}`,
    source: temple.connector?.type ?? 'mock',
    totalRows: temple.recentDonations.length + temple.donorDirectory.length + temple.upcomingBookings.length + temple.complaintLog.length,
  });
}
