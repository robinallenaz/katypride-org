import { NextRequest, NextResponse } from 'next/server';
import { getFormSubmissionsFromDb, deleteFormSubmissionFromDb } from '@/lib/data-service';
import { verifySession } from '../auth/route';

// Helper to check authentication
function authenticate(request: NextRequest): { success: boolean; response?: NextResponse } {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') ?? null;

  if (!verifySession(token)) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    };
  }
  return { success: true };
}

export async function GET(request: NextRequest) {
  const auth = authenticate(request);
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '500', 10);

    const { submissions, total } = await getFormSubmissionsFromDb({ type, limit });

    return NextResponse.json({
      success: true,
      submissions,
      total,
      filters: { type, limit },
    });
  } catch (error) {
    console.error('Error reading form submissions from DB:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read form submissions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = authenticate(request);
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    // Primary key: _dbId (PostgreSQL serial id) preferred; falls back to legacy
    // timestamp+email for submissions that pre-date the DB migration.
    const dbId = searchParams.get('id');

    if (!dbId || isNaN(parseInt(dbId, 10))) {
      return NextResponse.json(
        { success: false, error: 'Numeric id is required for deletion' },
        { status: 400 }
      );
    }

    const deleted = await deleteFormSubmissionFromDb(parseInt(dbId, 10));

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Submission deleted',
    });
  } catch (error) {
    console.error('Error deleting form submission from DB:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
