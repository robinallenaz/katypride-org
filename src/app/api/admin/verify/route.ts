import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../auth/route';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') ?? null;

  if (!verifySession(token)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}
