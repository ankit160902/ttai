import { NextResponse } from 'next/server';
import { validateLogin } from '../../../lib/auth-config';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: { loginId?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false, message: 'Invalid request' }, { status: 400 });
  }

  if (!body?.loginId || !body?.password) {
    return NextResponse.json({ valid: false, message: 'Login ID and password are required' }, { status: 400 });
  }

  const result = validateLogin(body.loginId, body.password);

  if (!result.valid) {
    return NextResponse.json({ valid: false, message: 'Invalid credentials' }, { status: 401 });
  }

  return NextResponse.json(result);
}
