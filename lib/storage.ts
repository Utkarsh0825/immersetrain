import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadVideo(
  file: File,
  orgId: string,
  scenarioId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${orgId}/${scenarioId}/video.${ext}`;

  onProgress?.(5);
  const { error } = await supabase.storage.from('scenario-videos').upload(path, file, {
    contentType: file.type,
    upsert: true,
  });

  if (error) throw error;
  onProgress?.(95);

  const { data: urlData } = supabase.storage.from('scenario-videos').getPublicUrl(path);
  onProgress?.(100);
  return urlData.publicUrl;
}

export async function deleteVideo(path: string) {
  await supabase.storage.from('scenario-videos').remove([path]);
}

