import { NextRequest, NextResponse } from 'next/server';
import { getScenario, DEMO_SCENARIO } from '@/lib/scenarios';
import { createServiceClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfigured';

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check local scenarios first (demo + subway tour)
  const local = await getScenario(id);
  if (local && (id === 'demo-scenario-001' || id === 'subway-tour-001')) {
    return NextResponse.json(local);
  }

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(DEMO_SCENARIO);
    }
    const supabase = createServiceClient();
    const { data: scenario, error: sErr } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', id)
      .single();
    if (sErr) throw sErr;
    const { data: questions, error: qErr } = await supabase
      .from('questions')
      .select('*')
      .eq('scenario_id', id)
      .order('sort_order', { ascending: true });
    if (qErr) throw qErr;
    // Invites + stats (creator surfaces can use these; learners can ignore)
    const { data: invites } = await supabase
      .from('scenario_invites')
      .select('id, invite_code, max_uses, use_count, expires_at, created_at')
      .eq('scenario_id', id);

    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, score, max_score, completed, completed_at, started_at, user_email, user_name')
      .eq('scenario_id', id)
      .order('started_at', { ascending: false });

    const totalSessions = (sessions ?? []).length;
    const completed = (sessions ?? []).filter((s: any) => s.completed);
    const avgScore =
      completed.length === 0
        ? 0
        : Math.round(
            completed.reduce((acc: number, s: any) => acc + (s.max_score ? s.score / s.max_score : 0), 0) /
              completed.length *
              100
          );
    const passRate =
      completed.length === 0
        ? 0
        : Math.round(
            (completed.filter((s: any) => (s.score ?? 0) >= 0.7 * (s.max_score ?? 100)).length /
              completed.length) *
              100
          );
    const recentSessions = (sessions ?? []).slice(0, 5);

    return NextResponse.json({
      ...scenario,
      questions: questions || [],
      invites: invites || [],
      stats: { totalSessions, avgScore, passRate, recentSessions },
    });
  } catch {
    return NextResponse.json(local ?? DEMO_SCENARIO);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, offline: true });
  }

  let body: {
    title?: string;
    description?: string;
    videoUrl?: string;
    status?: 'draft' | 'published' | 'archived';
    questions?: Array<{
      timestamp_seconds: number;
      question_text: string;
      option_a: string;
      option_b: string;
      correct_option: 'a' | 'b';
      explanation?: string;
      points?: number;
      sort_order?: number;
    }>;
  };
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON', details: errorMessage(err) }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
    const status = body.status ?? 'draft';
    const published = status === 'published';

    const { error: updErr } = await supabase
      .from('scenarios')
      .update({
        title: body.title,
        description: body.description ?? null,
        video_url: body.videoUrl,
        status,
        published,
      })
      .eq('id', id);
    if (updErr) throw updErr;

    // Replace questions
    const { error: delErr } = await supabase.from('questions').delete().eq('scenario_id', id);
    if (delErr) throw delErr;

    const questions = (body.questions ?? []).map((q, idx) => ({
      scenario_id: id,
      timestamp_seconds: Math.max(0, Math.floor(q.timestamp_seconds ?? 0)),
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      correct_option: q.correct_option,
      explanation: q.explanation ?? '',
      points: q.points ?? 10,
      sort_order: q.sort_order ?? idx,
    }));
    if (questions.length) {
      const { error: insErr } = await supabase.from('questions').insert(questions);
      if (insErr) throw insErr;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[scenarios PUT]', err);
    return NextResponse.json({ error: 'Update failed', details: errorMessage(err) }, { status: 500 });
  }
}
