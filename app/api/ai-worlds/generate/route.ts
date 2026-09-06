import { NextRequest, NextResponse } from 'next/server';
import { InferenceClient } from '@huggingface/inference';
import { createServiceClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfigured';

export const maxDuration = 120;
export const runtime = 'nodejs';

const DEFAULT_MODELS = [
  'black-forest-labs/FLUX.1-schnell',
  'stabilityai/stable-diffusion-xl-base-1.0',
];

function errorMessage(err: unknown): string {
  if (err instanceof Error) {
    const anyErr = err as Error & { cause?: unknown };
    const cause =
      anyErr.cause instanceof Error
        ? anyErr.cause.message
        : typeof anyErr.cause === 'string'
          ? anyErr.cause
          : '';
    if (cause) return `${anyErr.message}: ${cause}`;
    return anyErr.message;
  }
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

function blobToBytes(blob: Blob): Promise<{ bytes: Uint8Array; contentType: string }> {
  return blob.arrayBuffer().then((ab) => ({
    bytes: new Uint8Array(ab),
    contentType: blob.type || 'image/jpeg',
  }));
}

async function normalizeImageResult(
  result: unknown
): Promise<{ bytes: Uint8Array; contentType: string }> {
  if (result instanceof Blob) return blobToBytes(result);
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(result)) {
    return { bytes: new Uint8Array(result), contentType: 'image/jpeg' };
  }
  if (result instanceof ArrayBuffer) {
    return { bytes: new Uint8Array(result), contentType: 'image/jpeg' };
  }
  if (typeof result === 'string' && result.startsWith('data:image/')) {
    const [meta, b64] = result.split(',');
    const ct = meta.includes('png') ? 'image/png' : 'image/jpeg';
    return { bytes: new Uint8Array(Buffer.from(b64 || '', 'base64')), contentType: ct };
  }
  throw new Error('Unexpected image response type from Hugging Face');
}

function isWarmupError(msg: string): boolean {
  const m = msg.toLowerCase();
  return m.includes('loading') || m.includes('warming') || m.includes('503') || m.includes('estimated_time');
}

async function generateTextToImage(
  client: InferenceClient,
  model: string,
  prompt: string
): Promise<{ bytes: Uint8Array; contentType: string }> {
  const result = await client.textToImage({
    model,
    inputs: prompt,
    parameters: {
      width: 1024,
      height: 512,
    },
  });
  return normalizeImageResult(result);
}

async function generateWithReference(
  client: InferenceClient,
  model: string,
  prompt: string,
  referenceBase64: string
): Promise<{ bytes: Uint8Array; contentType: string }> {
  const raw = referenceBase64.replace(/^data:image\/\w+;base64,/, '');
  const binary = Buffer.from(raw, 'base64');
  const imageBlob = new Blob([binary], { type: 'image/jpeg' });

  const result = await client.imageToImage({
    model,
    inputs: imageBlob,
    parameters: {
      prompt,
      strength: 0.7,
    },
  });
  return normalizeImageResult(result);
}

export async function POST(req: NextRequest) {
  try {
    const token = hfToken();
    if (!token) {
      return NextResponse.json(
        {
          error:
            'HUGGING_FACE_API_KEY is missing on the server. In Vercel → Settings → Environment Variables, add HUGGING_FACE_API_KEY for Production, then Redeploy.',
          code: 'MISSING_HF_KEY',
        },
        { status: 500 }
      );
    }

    let body: {
      prompt?: string;
      referenceImageBase64?: string | null;
      userId?: string;
      orgId?: string;
      saveScenario?: boolean;
      title?: string;
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const prompt = (body.prompt ?? '').trim();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Cap reference size — huge base64 payloads crash serverless fetch.
    const ref = body.referenceImageBase64 ?? null;
    const hasRef = Boolean(ref && ref.length > 100 && ref.length < 2_500_000);
    if (ref && ref.length >= 2_500_000) {
      return NextResponse.json(
        {
          error: 'Reference image is too large. Use a smaller photo (under ~1.5MB) or generate from text only.',
          code: 'REF_TOO_LARGE',
        },
        { status: 413 }
      );
    }

    const enhanced = enhancePrompt(prompt, hasRef);
    const models = modelList();
    const client = new InferenceClient(token);

    let bytes: Uint8Array | null = null;
    let contentType = 'image/jpeg';
    let usedModel = models[0];
    let usedReference = false;
    const errors: string[] = [];

    for (const model of models) {
      usedModel = model;

      if (hasRef && ref) {
        try {
          const out = await generateWithReference(client, model, enhanced, ref);
          bytes = out.bytes;
          contentType = out.contentType;
          usedReference = true;
          break;
        } catch (err) {
          const msg = errorMessage(err);
          errors.push(`img2img/${model}: ${msg}`);
          if (isWarmupError(msg)) {
            return NextResponse.json(
              {
                error: 'Model is warming up. Please wait and try again.',
                estimated_time: 35,
                retry: true,
                model,
              },
              { status: 503 }
            );
          }
          // Fall through to text-to-image with the same prompt (reference still influences via prompt text).
        }
      }

      try {
        const out = await generateTextToImage(client, model, enhanced);
        bytes = out.bytes;
        contentType = out.contentType;
        break;
      } catch (err) {
        const msg = errorMessage(err);
        errors.push(`txt2img/${model}: ${msg}`);
        if (isWarmupError(msg)) {
          return NextResponse.json(
            {
              error: 'Model is warming up. Please wait and try again.',
              estimated_time: 35,
              retry: true,
              model,
            },
            { status: 503 }
          );
        }
      }
    }

    if (!bytes || bytes.byteLength < 500) {
      const detail = errors.slice(0, 3).join(' | ') || 'Unknown provider error';
      // Common root causes → actionable copy
      let friendly = `Generation failed: ${detail.slice(0, 500)}`;
      if (/fetch failed|ENOTFOUND|ECONNRESET|network/i.test(detail)) {
        friendly =
          'Could not reach Hugging Face from the server. Confirm HUGGING_FACE_API_KEY is set for Production and the token has Inference permissions, then Redeploy.';
      } else if (/401|unauthorized|invalid.*token|forbidden/i.test(detail)) {
        friendly =
          'Hugging Face rejected the API key. Create a new token at huggingface.co → Settings → Access Tokens (enable Inference), update HUGGING_FACE_API_KEY on Vercel, Redeploy.';
      } else if (/402|payment|credits|quota|rate/i.test(detail)) {
        friendly =
          'Hugging Face quota/credits exhausted for this token. Wait a bit, or upgrade free Inference Provider credits on Hugging Face.';
      }
      return NextResponse.json({ error: friendly, details: errors, code: 'HF_GENERATE_FAILED' }, { status: 502 });
    }

    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const userId = body.userId || 'anonymous';
    const fileName = `ai-worlds/${userId}/${Date.now()}.${ext}`;

    let imageUrl: string;
    if (isSupabaseConfigured()) {
      try {
        const supabase = createServiceClient();
        const { error: uploadError } = await supabase.storage.from('scenario-videos').upload(fileName, bytes, {
          contentType,
          upsert: false,
        });
        if (uploadError) {
          imageUrl = `data:${contentType};base64,${Buffer.from(bytes).toString('base64')}`;
        } else {
          const { data: urlData } = supabase.storage.from('scenario-videos').getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      } catch {
        imageUrl = `data:${contentType};base64,${Buffer.from(bytes).toString('base64')}`;
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
        /* preview still works */
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      scenarioId,
      prompt: enhanced,
      model: usedModel,
      usedReference,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: errorMessage(err) || 'Unknown server error',
        code: 'UNHANDLED',
      },
      { status: 500 }
    );
  }
}
