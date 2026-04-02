import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfigured';

export async function POST(req: NextRequest) {
  // No DB / placeholder envs: demo mode — no Clerk required (Quest / boss testing without Supabase)
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ sessionId: `local-${Date.now()}`, offline: true });
  }

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { scenarioId, userEmail, userName } = body;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        scenario_id: scenarioId,
        score: 0,
        max_score: 100,
        completed: false,
      })
      .select('id')
      .single();
    if (error) throw error;
    return NextResponse.json({ sessionId: data.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ sessionId: `local-${Date.now()}`, offline: true });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, offline: true });
  }

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { sessionId, score, completed } = body;

  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('sessions')
      .update({
        score,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', sessionId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
