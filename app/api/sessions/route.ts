import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfigured';

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/** Stable anonymous demo user (matches client useCurrentUser hook). */
const DEMO_USER_ID = 'demo-user-001';

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ sessionId: `local-${Date.now()}`, offline: true });
    }

    const userId = DEMO_USER_ID;

    let body: { scenarioId?: string; userEmail?: string; userName?: string };
    try {
      body = await req.json();
    } catch (parseErr) {
      console.error('[sessions POST] Invalid JSON body:', parseErr);
      return NextResponse.json(
        { error: 'Invalid JSON', details: errorMessage(parseErr) },
        { status: 400 }
      );
    }

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
    } catch (dbErr) {
      console.error('[sessions POST] Supabase insert failed:', dbErr);
      const details = errorMessage(dbErr);
      return NextResponse.json({
        sessionId: `local-${Date.now()}`,
        offline: true,
        error: 'Database insert failed',
        details,
      });
    }
  } catch (err) {
    console.error('[sessions POST] Unhandled error:', err);
    return NextResponse.json(
      { error: 'Session creation failed', details: errorMessage(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, offline: true });
    }

    const body = await req.json();
    const { sessionId, score, completed } = body;

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
    console.error('[sessions PATCH] Error:', err);
    return NextResponse.json(
      { error: 'Update failed', details: errorMessage(err) },
      { status: 500 }
    );
  }
}
