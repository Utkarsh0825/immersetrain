import { NextResponse } from 'next/server';
import { DEMO_SCENARIO } from '@/lib/scenarios';
import { createServiceClient } from '@/lib/supabase';

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xxx')) {
      return NextResponse.json([DEMO_SCENARIO]);
    }
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data || [DEMO_SCENARIO]);
  } catch {
    return NextResponse.json([DEMO_SCENARIO]);
  }
}
