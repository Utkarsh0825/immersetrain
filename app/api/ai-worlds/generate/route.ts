import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfigured';

export const maxDuration = 120;

const DEFAULT_MODELS = [
  'black-forest-labs/FLUX.1-schnell',
  'stabilityai/stable-diffusion-xl-base-1.0',
];

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function hfToken(): string | null {
  const t =
    process.env.HUGGING_FACE_API_KEY?.trim() ||
    process.env.HF_TOKEN?.trim() ||
    process.env.HUGGINGFACE_API_KEY?.trim() ||
    '';
  return t || null;
}

function enhancePrompt(prompt: string, hasReference: boolean): string {
  const base = prompt.trim();
  const suffix =
    'equirectangular 360 view, 360 panorama, seamless panoramic projection, photorealistic, high detail, wide angle immersion';
  if (hasReference) {
    return `${base}, match the architecture lighting materials and signage of the reference photo, ${suffix}`;
  }
  return `${base}, ${suffix}`;
}

function modelList(): string[] {
  const preferred = process.env.HUGGING_FACE_IMAGE_MODEL?.trim();
  const list = preferred ? [preferred, ...DEFAULT_MODELS] : [...DEFAULT_MODELS];
  return [...new Set(list)];
}

async function callHfTextToImage(
  token: string,
  model: string,
  prompt: string
): Promise<{ ok: true; bytes: Uint8Array; contentType: string } | { ok: false; status: number; body: string; estimated?: number }> {
  const endpoints = [
    `https://router.huggingface.co/hf-inference/models/${model}`,
    `https://api-inference.huggingface.co/models/${model}`,
  ];

  let last: { status: number; body: string; estimated?: number } = { status: 500, body: 'No endpoint tried' };

  for (const url of endpoints) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'image/png, image/jpeg, application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: 1024,
          height: 512,
          num_inference_steps: 28,
          guidance_scale: 7,
        },
      }),
    });

    if (res.status === 503) {
      const j = (await res.json().catch(() => ({}))) as { estimated_time?: number; error?: string };
      return {
        ok: false,
        status: 503,
        body: j.error || 'Model is loading',
        estimated: typeof j.estimated_time === 'number' ? j.estimated_time : 30,
      };
    }

    if (!res.ok) {
      last = { status: res.status, body: await res.text().catch(() => res.statusText) };
      continue;
    }

    const ct = res.headers.get('content-type') || 'image/jpeg';
    if (ct.includes('application/json')) {
      last = { status: 500, body: await res.text() };
      continue;
    }

    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength < 1000) {
      last = { status: 500, body: 'Empty image response' };
      continue;
    }
    return { ok: true, bytes: buf, contentType: ct.includes('png') ? 'image/png' : 'image/jpeg' };
  }

  return { ok: false, status: last.status, body: last.body };
}

async function callHfImageToImage(
  token: string,
  model: string,
  prompt: string,
  referenceBase64: string
): Promise<{ ok: true; bytes: Uint8Array; contentType: string } | { ok: false; status: number; body: string; estimated?: number }> {
  // Strip data-URL prefix if present
  const raw = referenceBase64.replace(/^data:image\/\w+;base64,/, '');
  const binary = Buffer.from(raw, 'base64');

  const endpoints = [
    `https://router.huggingface.co/hf-inference/models/${model}`,
    `https://api-inference.huggingface.co/models/${model}`,
  ];

  let last: { status: number; body: string; estimated?: number } = { status: 500, body: 'No endpoint tried' };

  for (const url of endpoints) {
    // Multipart-style: many HF image-to-image endpoints accept JSON with image base64
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'image/png, image/jpeg, application/json',
      },
      body: JSON.stringify({
        inputs: raw,
        parameters: {
          prompt,
          strength: 0.65,
          width: 1024,
          height: 512,
          num_inference_steps: 28,
          guidance_scale: 7,
        },
      }),
    });

    if (res.status === 503) {
      const j = (await res.json().catch(() => ({}))) as { estimated_time?: number; error?: string };
      return {
        ok: false,
        status: 503,
        body: j.error || 'Model is loading',
        estimated: typeof j.estimated_time === 'number' ? j.estimated_time : 30,
      };
    }

    if (!res.ok) {
      // Try binary blob POST as fallback for this endpoint
      const res2 = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
          'X-Prompt': prompt.slice(0, 500),
          Accept: 'image/png, image/jpeg, application/json',
        },
        body: binary,
      });
      if (res2.status === 503) {
        const j = (await res2.json().catch(() => ({}))) as { estimated_time?: number; error?: string };
        return {
          ok: false,
          status: 503,
          body: j.error || 'Model is loading',
          estimated: typeof j.estimated_time === 'number' ? j.estimated_time : 30,
        };
      }
      if (!res2.ok) {
        last = { status: res.status, body: await res.text().catch(() => res.statusText) };
        continue;
      }
      const ct2 = res2.headers.get('content-type') || 'image/jpeg';
      if (ct2.includes('application/json')) {
        last = { status: 500, body: await res2.text() };
        continue;
      }
      const buf2 = new Uint8Array(await res2.arrayBuffer());
      if (buf2.byteLength >= 1000) {
        return { ok: true, bytes: buf2, contentType: ct2.includes('png') ? 'image/png' : 'image/jpeg' };
      }
      last = { status: 500, body: 'Empty image response' };
      continue;
    }

    const ct = res.headers.get('content-type') || 'image/jpeg';
    if (ct.includes('application/json')) {
      last = { status: 500, body: await res.text() };
      continue;
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength < 1000) {
      last = { status: 500, body: 'Empty image response' };
      continue;
    }
    return { ok: true, bytes: buf, contentType: ct.includes('png') ? 'image/png' : 'image/jpeg' };
  }

  return { ok: false, status: last.status, body: last.body };
}

export async function POST(req: NextRequest) {
  try {
    const token = hfToken();
    if (!token) {
      return NextResponse.json(
        {
          error:
            'HUGGING_FACE_API_KEY is not set. Add it in Vercel Environment Variables (or .env.local).',
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as {
      prompt?: string;
      referenceImageBase64?: string | null;
      userId?: string;
      orgId?: string;
      saveScenario?: boolean;
      title?: string;
    };

    const prompt = (body.prompt ?? '').trim();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const hasRef = Boolean(body.referenceImageBase64 && body.referenceImageBase64.length > 100);
    const enhanced = enhancePrompt(prompt, hasRef);
    const models = modelList();

    let bytes: Uint8Array | null = null;
    let contentType = 'image/jpeg';
    let usedModel = models[0];
    let lastErr = 'Generation failed';

    for (const model of models) {
      usedModel = model;
      const result =
        hasRef && body.referenceImageBase64
          ? await callHfImageToImage(token, model, enhanced, body.referenceImageBase64)
          : await callHfTextToImage(token, model, enhanced);

      if (result.ok) {
        bytes = result.bytes;
        contentType = result.contentType;
        break;
      }

      if (result.status === 503) {
        return NextResponse.json(
          {
            error: 'Model is warming up. Please wait and try again.',
            estimated_time: result.estimated ?? 30,
            retry: true,
            model,
          },
          { status: 503 }
        );
      }

      // If img2img failed, fall back to text-only for same model
      if (hasRef) {
        const textOnly = await callHfTextToImage(token, model, enhanced);
        if (textOnly.ok) {
          bytes = textOnly.bytes;
          contentType = textOnly.contentType;
          break;
        }
        if (textOnly.status === 503) {
          return NextResponse.json(
            {
              error: 'Model is warming up. Please wait and try again.',
              estimated_time: textOnly.estimated ?? 30,
              retry: true,
              model,
            },
            { status: 503 }
          );
        }
        lastErr = textOnly.body || result.body;
      } else {
        lastErr = result.body;
      }
    }

    if (!bytes) {
      return NextResponse.json({ error: `Generation failed: ${lastErr.slice(0, 400)}` }, { status: 502 });
    }

    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const userId = body.userId || 'anonymous';
    const timestamp = Date.now();
    const fileName = `ai-worlds/${userId}/${timestamp}.${ext}`;

    let imageUrl: string;

    if (isSupabaseConfigured()) {
      const supabase = createServiceClient();
      const { error: uploadError } = await supabase.storage.from('scenario-videos').upload(fileName, bytes, {
        contentType,
        upsert: false,
      });
      if (uploadError) {
        // Fall back to data URL so the user can still preview
        imageUrl = `data:${contentType};base64,${Buffer.from(bytes).toString('base64')}`;
      } else {
        const { data: urlData } = supabase.storage.from('scenario-videos').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    } else {
      imageUrl = `data:${contentType};base64,${Buffer.from(bytes).toString('base64')}`;
    }

    let scenarioId: string | null = null;
    if (body.saveScenario && body.userId && body.orgId && isSupabaseConfigured() && !imageUrl.startsWith('data:')) {
      try {
        const supabase = createServiceClient();
        const title =
          (body.title ?? '').trim() ||
          `AI World: ${prompt.slice(0, 48)}${prompt.length > 48 ? '…' : ''}`;
        const { data: scenario } = await supabase
          .from('scenarios')
          .insert({
            title,
            description: prompt,
            video_url: imageUrl,
            org_id: body.orgId,
            created_by: body.userId,
            status: 'draft',
            tags: ['ai-generated'],
            published: false,
          })
          .select('id')
          .single();
        if (scenario?.id) scenarioId = scenario.id as string;
      } catch {
        // Preview still works without DB row
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      scenarioId,
      prompt: enhanced,
      model: usedModel,
      usedReference: hasRef,
    });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}
