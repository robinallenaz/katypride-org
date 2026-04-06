import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;

// Runtime check function instead of module-level throw
function checkEnvVars(): { ok: boolean; error?: string } {
  if (!ADMIN_PASSWORD) {
    return { ok: false, error: 'ADMIN_PASSWORD environment variable is required' };
  }
  if (!SESSION_SECRET) {
    return { ok: false, error: 'SESSION_SECRET environment variable is required' };
  }
  return { ok: true };
}

// JWT-based session for serverless compatibility
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

function hashPassword(password: string): Buffer {
  return createHash('sha256').update(password).digest();
}

function safeEqual(a: string, b: string): boolean {
  const hashA = hashPassword(a);
  const hashB = hashPassword(b);
  return timingSafeEqual(hashA, hashB);
}

// Create JWT token with email
function createToken(email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: email,
    email: email,
    iat: now,
    exp: now + SESSION_MAX_AGE,
  })).toString('base64url');
  const data = `${header}.${payload}`;
  const signature = createHash('sha256').update(`${data}.${SESSION_SECRET}`).digest('base64url');
  return `${data}.${signature}`;
}

// Verify JWT token
function verifyToken(token: string): boolean {
  // Runtime env check
  const envCheck = checkEnvVars();
  if (!envCheck.ok) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [header, payload, signature] = parts;
    const data = `${header}.${payload}`;
    const expectedSignature = createHash('sha256').update(`${data}.${SESSION_SECRET}`).digest('base64url');
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length) return false;
    if (!timingSafeEqual(sigBuf, expBuf)) {
      return false;
    }
    const payloadData = JSON.parse(Buffer.from(payload, 'base64url').toString());
    const now = Math.floor(Date.now() / 1000);
    return payloadData.exp > now;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // Runtime env check
  const envCheck = checkEnvVars();
  if (!envCheck.ok) {
    return NextResponse.json(
      { success: false, error: envCheck.error },
      { status: 500 }
    );
  }

  try {
    const { email, password } = await request.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email domain
    if (!email.endsWith('@katypride.org')) {
      return NextResponse.json(
        { success: false, error: 'Only @katypride.org email addresses are allowed' },
        { status: 401 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password required' },
        { status: 400 }
      );
    }

    if (!safeEqual(password, ADMIN_PASSWORD!)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token with email
    const token = createToken(email);

    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // JWT is stateless - client just needs to delete the token
    // No server-side action needed
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}

// Helper to verify session - now uses JWT verification
export function verifySession(token: string | null): boolean {
  if (!token) return false;
  return verifyToken(token);
}
