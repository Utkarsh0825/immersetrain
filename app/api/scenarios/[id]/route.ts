import { NextRequest, NextResponse } from 'next/server';
import { getScenario, DEMO_SCENARIO } from '@/lib/scenarios';
import { createServiceClient } from '@/lib/supabase';

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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xxx')) {
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
    return NextResponse.json({ ...scenario, questions: questions || [] });
  } catch {
    return NextResponse.json(local ?? DEMO_SCENARIO);
  }
}
