import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfigured';

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId');
  if (!orgId) return NextResponse.json({ error: 'Missing orgId' }, { status: 400 });

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      scenarios: [],
      totalTrainees: 0,
      overallPassRate: 0,
      sessionsThisWeek: 0,
      offline: true,
    });
  }

  try {
    const supabase = createServiceClient();

    const { data: scenarios, error: sErr } = await supabase
      .from('scenarios')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    if (sErr) throw sErr;

    // Sessions across org scenarios
    const scenarioIds = (scenarios ?? []).map((s: any) => s.id);
    if (scenarioIds.length === 0) {
      return NextResponse.json({
        scenarios: [],
        totalTrainees: 0,
        overallPassRate: 0,
        sessionsThisWeek: 0,
      });
    }

    const { data: sessions, error: sessErr } = await supabase
      .from('sessions')
      .select('id, user_id, score, max_score, completed, started_at, scenario_id')
      .in('scenario_id', scenarioIds);
    if (sessErr) throw sessErr;

    const totalTrainees = new Set((sessions ?? []).map((s: any) => s.user_id)).size;
    const completed = (sessions ?? []).filter((s: any) => s.completed);
    const overallPassRate =
      completed.length === 0
        ? 0
        : Math.round(
            (completed.filter((s: any) => (s.score ?? 0) >= 0.7 * (s.max_score ?? 100)).length /
              completed.length) *
              100
          );

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const sessionsThisWeek = (sessions ?? []).filter((s: any) => {
      const ts = new Date(s.started_at ?? 0).getTime();
      return Number.isFinite(ts) && ts >= weekAgo;
    }).length;

    return NextResponse.json({
      scenarios: scenarios ?? [],
      totalTrainees,
      overallPassRate,
      sessionsThisWeek,
    });
  } catch (err) {
    console.error('[dashboard/overview GET]', err);
    return NextResponse.json({ error: 'Failed to load overview', details: errorMessage(err) }, { status: 500 });
  }
}

