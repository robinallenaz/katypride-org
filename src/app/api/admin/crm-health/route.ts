import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual, createHash } from 'crypto';
import { getCrmFailureStats, type CrmFailureStats } from '@/lib/data-service';
import { verifySession } from '../auth/route';

// Number of failed CRM syncs within the window that counts as an incident
// rather than the occasional one-off.
const DEFAULT_THRESHOLD = 3;
const DEFAULT_WINDOW_HOURS = 24;

const CRON_SECRET = process.env.CRON_SECRET || process.env.CRM_ADMIN_SECRET || '';
const ALERT_WEBHOOK_URL = process.env.CRM_ALERT_WEBHOOK_URL || '';

function safeEqual(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

function authorize(request: NextRequest): boolean {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ?? null;
  if (!token) return false;
  if (verifySession(token)) return true;
  return Boolean(CRON_SECRET) && safeEqual(token, CRON_SECRET);
}

function formatAlert(stats: CrmFailureStats, siteUrl: string): string {
  const errorLines = stats.topErrors
    .map((e) => `• ${e.count}× ${e.error}`)
    .join('\n');

  return [
    `:rotating_light: Katy Pride: ${stats.failed} form submission(s) failed to sync to GoHighLevel in the last ${stats.windowHours}h (${stats.contacts} contact(s)).`,
    errorLines,
    `Review: ${siteUrl}/admin/submissions`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * CRM sync health check. Returns failure counts for a recent window and, when
 * failures cross the threshold, posts to CRM_ALERT_WEBHOOK_URL (Slack/Discord
 * compatible) so a run of failures surfaces immediately.
 *
 * Callable by an admin session token or by a scheduler sending
 * `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const windowHours = Math.min(
    Math.max(parseInt(searchParams.get('hours') || `${DEFAULT_WINDOW_HOURS}`, 10) || DEFAULT_WINDOW_HOURS, 1),
    24 * 30
  );
  const threshold = Math.max(
    parseInt(searchParams.get('threshold') || `${DEFAULT_THRESHOLD}`, 10) || DEFAULT_THRESHOLD,
    1
  );

  try {
    const stats = await getCrmFailureStats(windowHours);
    const triggered = stats.failed >= threshold;
    let alerted = false;

    if (triggered) {
      console.error(
        `[CRM Health] ${stats.failed} failed submission(s) in the last ${windowHours}h`,
        stats.topErrors
      );

      if (ALERT_WEBHOOK_URL) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
        const response = await fetch(ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: formatAlert(stats, siteUrl) }),
        });
        alerted = response.ok;
        if (!response.ok) {
          console.error('[CRM Health] Alert webhook failed with status', response.status);
        }
      }
    }

    return NextResponse.json({ success: true, threshold, triggered, alerted, stats });
  } catch (error) {
    console.error('[CRM Health] Failed to read CRM failure stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read CRM failure stats' },
      { status: 500 }
    );
  }
}
