import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfigured';

/** Demo mode: no auth — return all sessions when Supabase is configured. */
export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(req.url);
  const scenarioId = searchParams.get('scenarioId');

  try {
    const supabase = createServiceClient();
    let query = supabase
      .from('sessions')
      .select('*, scenarios(title)')
      .order('started_at', { ascending: false });

    if (scenarioId) {
      query = query.eq('scenario_id', scenarioId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error(err);
    return NextResponse.json([]);
  }
}
