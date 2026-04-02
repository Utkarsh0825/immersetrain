import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { sessionId, questionId, chosenOption, isCorrect, pointsEarned } = body;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xxx')) {
    return NextResponse.json({ success: true });
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
    return NextResponse.json({ success: false });
  }
}
