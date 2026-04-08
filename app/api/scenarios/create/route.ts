import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfigured';

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

type IncomingQuestion = {
  timestamp_seconds: number;
  question_text: string;
  option_a: string;
  option_b: string;
  correct_option: 'a' | 'b';
  explanation?: string;
  points?: number;
  sort_order?: number;
};

export async function POST(req: NextRequest) {
  let body: {
    title?: string;
    description?: string;
    videoUrl?: string;
    orgId?: string;
    createdBy?: string;
    tags?: string[];
    questions?: IncomingQuestion[];
  };
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON', details: errorMessage(err) }, { status: 400 });
  }

  const title = (body.title ?? '').trim();
  const orgId = body.orgId;
  const createdBy = body.createdBy;
  const videoUrl = (body.videoUrl ?? '').trim();

  if (!title || !orgId || !createdBy || !videoUrl) {
    return NextResponse.json(
      { error: 'Missing required fields (title, videoUrl, orgId, createdBy)' },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    const scenarioId = `local-scn-${Date.now()}`;
    const inviteCode = 'localdemo';
    const shareUrl = `/train/${scenarioId}`;
    return NextResponse.json({ scenarioId, inviteCode, shareUrl, offline: true });
  }

  try {
    const supabase = createServiceClient();

    // 1) Insert scenario with status draft
    const { data: scenario, error: sErr } = await supabase
      .from('scenarios')
      .insert({
        title,
        description: body.description ?? null,
        video_url: videoUrl,
        org_id: orgId,
        created_by: createdBy,
        status: 'draft',
        tags: body.tags ?? null,
        published: false,
      })
      .select('id')
      .single();
    if (sErr) throw sErr;

    const scenarioId = scenario.id as string;

    // 2) Insert questions ordered by sort_order
    const questions = (body.questions ?? []).map((q, idx) => ({
      scenario_id: scenarioId,
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
      const { error: qErr } = await supabase.from('questions').insert(questions);
      if (qErr) throw qErr;
    }

    // 3) Create invite
    const { data: invite, error: iErr } = await supabase
      .from('scenario_invites')
      .insert({
        scenario_id: scenarioId,
        org_id: orgId,
      })
      .select('invite_code')
      .single();
    if (iErr) throw iErr;

    // 4) Return share URL
    const base = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const shareUrl = base ? `${base}/train/${scenarioId}` : `/train/${scenarioId}`;
    return NextResponse.json({ scenarioId, inviteCode: invite.invite_code, shareUrl });
  } catch (err) {
    console.error('[scenarios/create POST]', err);
    return NextResponse.json({ error: 'Create scenario failed', details: errorMessage(err) }, { status: 500 });
  }
}

