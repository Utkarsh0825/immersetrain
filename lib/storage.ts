import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

function client(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  }
  cached = createClient(url, key);
  return cached;
}

export async function uploadVideo(
  file: File,
  orgId: string,
  scenarioId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${orgId}/${scenarioId}/video.${ext}`;

  onProgress?.(5);
  const { error } = await client().storage.from('scenario-videos').upload(path, file, {
    contentType: file.type,
    upsert: true,
  });

  if (error) throw error;
  onProgress?.(95);

  const { data: urlData } = client().storage.from('scenario-videos').getPublicUrl(path);
  onProgress?.(100);
  return urlData.publicUrl;
}

export async function deleteVideo(path: string) {
  await client().storage.from('scenario-videos').remove([path]);
}
