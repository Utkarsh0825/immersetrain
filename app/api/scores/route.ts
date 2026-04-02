import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check admin role
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string })?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const scenarioId = searchParams.get('scenarioId');

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xxx')) {
    return NextResponse.json([]);
  }

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
