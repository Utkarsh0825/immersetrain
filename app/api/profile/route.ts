import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfigured';

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    // Demo-mode: treat demo-user as onboarded with a fake org.
    if (userId === 'demo-user-001') {
      return NextResponse.json({
        exists: true,
        profile: {
          id: 'local-profile-demo',
          user_id: userId,
          full_name: 'Demo User',
          email: 'demo@immersetrain.com',
          org_id: 'local-org-demo',
          role: 'owner',
          onboarded: true,
        },
        org: {
          id: 'local-org-demo',
          name: 'Demo Organization',
          industry: 'Transit & Rail',
          size_range: '11–50',
          plan: 'starter',
        },
      });
    }
    return NextResponse.json({ exists: false });
  }

  try {
    const supabase = createServiceClient();
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!profile) return NextResponse.json({ exists: false });

    const { data: org, error: oErr } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.org_id)
      .maybeSingle();
    if (oErr) throw oErr;

    return NextResponse.json({ exists: true, profile, org });
  } catch (err) {
    console.error('[profile GET]', err);
    return NextResponse.json({ error: 'Failed to load profile', details: errorMessage(err) }, { status: 500 });
  }
}

