import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfigured';

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

type Body = {
  fullName?: string;
  orgName?: string;
  industry?: string;
  sizeRange?: string;
  userId?: string;
  email?: string;
};

/** Demo fallback when Supabase isn't configured. */
const mem = new Map<string, { orgId: string; profileId: string }>();

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON', details: errorMessage(err) }, { status: 400 });
  }

  const { fullName, orgName, industry, sizeRange, userId, email } = body;
  if (!userId || !orgName) {
    return NextResponse.json({ error: 'Missing required fields (userId, orgName)' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    const existing = mem.get(userId);
    if (existing) return NextResponse.json(existing);
    const orgId = `local-org-${Date.now()}`;
    const profileId = `local-profile-${Date.now()}`;
    const res = { orgId, profileId };
    mem.set(userId, res);
    return NextResponse.json(res);
  }

  try {
    const supabase = createServiceClient();

    // 1) Create org row
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({
        name: orgName,
        industry: industry ?? null,
        size_range: sizeRange ?? null,
        owner_id: userId,
      })
      .select('id')
      .single();
    if (orgErr) throw orgErr;

    // 2) Create profile row with onboarded true (or update existing)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingProfile?.id) {
      const { error: updErr } = await supabase
        .from('profiles')
        .update({
          full_name: fullName ?? null,
          email: email ?? null,
          org_id: org.id,
          onboarded: true,
        })
        .eq('id', existingProfile.id);
      if (updErr) throw updErr;
      return NextResponse.json({ orgId: org.id, profileId: existingProfile.id });
    }

    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        full_name: fullName ?? null,
        email: email ?? null,
        org_id: org.id,
        role: 'owner',
        onboarded: true,
      })
      .select('id')
      .single();
    if (pErr) throw pErr;

    return NextResponse.json({ orgId: org.id, profileId: profile.id });
  } catch (err) {
    console.error('[onboarding POST]', err);
    return NextResponse.json({ error: 'Onboarding failed', details: errorMessage(err) }, { status: 500 });
  }
}

