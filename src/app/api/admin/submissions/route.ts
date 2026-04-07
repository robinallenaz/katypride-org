import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data-service';
import { verifySession } from '../auth/route';

interface FormSubmission {
  timestamp: string;
  type?: string;
  name?: string;
  email?: string;
  company?: string;
  error?: string;
  source?: string;
  [key: string]: any;
}

interface FormBackupData {
  submissions: FormSubmission[];
}

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
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // Read form backup data
    const data = await readData<FormBackupData>('form-backup');
    let submissions = data?.submissions || [];

    // Filter by type if specified
    if (type) {
      submissions = submissions.filter((sub: FormSubmission) => sub.type === type);
    }

    // Sort by timestamp descending (newest first)
    submissions.sort((a: FormSubmission, b: FormSubmission) => {
      const timeA = new Date(a.timestamp).getTime() || 0;
      const timeB = new Date(b.timestamp).getTime() || 0;
      return timeB - timeA;
    });

    // Limit results
    const limitedSubmissions = submissions.slice(0, limit);

    return NextResponse.json({
      success: true,
      submissions: limitedSubmissions,
      total: submissions.length,
      filters: { type, limit }
    });
  } catch (error) {
    console.error('Error reading form backup:', error);
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
    const timestamp = searchParams.get('timestamp');
    const email = searchParams.get('email');

    if (!timestamp) {
      return NextResponse.json(
        { success: false, error: 'Timestamp is required' },
        { status: 400 }
      );
    }

    // Read current data
    const data = await readData<FormBackupData>('form-backup');
    let submissions = data?.submissions || [];

    // Find and remove the matching submission
    const initialCount = submissions.length;
    submissions = submissions.filter((sub: FormSubmission) => {
      // Match by timestamp and optionally email
      // If email provided, match both; if no email, match by timestamp only
      if (sub.timestamp !== timestamp) return true;
      if (email && sub.email !== email) return true;
      return false;
    });

    const deletedCount = initialCount - submissions.length;

    if (deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Write updated data back
    await writeData('form-backup', { submissions });

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} submission(s)`,
      remaining: submissions.length
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
