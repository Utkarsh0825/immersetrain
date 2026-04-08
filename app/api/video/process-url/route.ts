import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfigured';

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function isYouTubeUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes('youtube.com') || u.includes('youtu.be');
}

function looksLikeDirectVideo(url: string): boolean {
  const u = url.toLowerCase().split('?')[0];
  return u.endsWith('.mp4') || u.endsWith('.mov') || u.endsWith('.webm');
}

function isKnownCdn(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes('bunny') ||
    u.includes('b-cdn.net') ||
    u.includes('cloudflare') ||
    u.includes('r2.dev') ||
    u.includes('supabase') ||
    u.includes('storage.googleapis') ||
    u.includes('s3.amazonaws.com')
  );
}

export async function POST(req: NextRequest) {
  let body: { url?: string; orgId?: string; createdBy?: string };
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON', details: errorMessage(err) }, { status: 400 });
  }

  const url = (body.url ?? '').trim();
  const orgId = body.orgId;
  const createdBy = body.createdBy;

  if (!url || !orgId || !createdBy) {
    return NextResponse.json({ error: 'Missing required fields (url, orgId, createdBy)' }, { status: 400 });
  }

  if (isYouTubeUrl(url)) {
    return NextResponse.json(
      {
        error:
          "YouTube URLs coming soon. Use a direct MP4 URL or upload your file directly.",
      },
      { status: 400 }
    );
  }

  if (!looksLikeDirectVideo(url) && !isKnownCdn(url)) {
    return NextResponse.json(
      {
        error:
          'URL must be a direct video (.mp4/.mov/.webm) or from a supported CDN (Bunny, Cloudflare, Supabase).',
      },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      jobId: `local-job-${Date.now()}`,
      publicUrl: url,
      status: 'complete',
      offline: true,
    });
  }

  try {
    const supabase = createServiceClient();
    const { data: job, error } = await supabase
      .from('video_jobs')
      .insert({
        org_id: orgId,
        created_by: createdBy,
        source_type: 'url',
        source_url: url,
        public_url: url,
        status: 'complete',
        completed_at: new Date().toISOString(),
      })
      .select('id, public_url, status')
      .single();
    if (error) throw error;
    return NextResponse.json({ jobId: job.id, publicUrl: job.public_url, status: job.status });
  } catch (err) {
    console.error('[video/process-url POST]', err);
    return NextResponse.json({ error: 'Failed to process URL', details: errorMessage(err) }, { status: 500 });
  }
}

