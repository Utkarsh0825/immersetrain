import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfigured';

function isUuid(v: unknown): v is string {
  if (typeof v !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, offline: true });
  }

  const body = await req.json();
  const { sessionId, questionId, chosenOption, isCorrect, pointsEarned } = body;

  // Local/demo questions use non-uuid ids (e.g. "st-q001"). Ignore persistence for those.
  if (!isUuid(sessionId) || !isUuid(questionId)) {
    return NextResponse.json({ success: true, offline: true });
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from('answers').insert({
      session_id: sessionId,
      question_id: questionId,
      chosen_option: chosenOption,
      is_correct: isCorrect,
      points_earned: pointsEarned,
    });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
