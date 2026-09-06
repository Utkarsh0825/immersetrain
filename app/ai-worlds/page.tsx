'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Send, Sparkles, X } from 'lucide-react';
import Nav from '@/components/landing/Nav';
import AiWorldSkyPreview from '@/components/ai-worlds/AiWorldSkyPreview';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useCurrentUser } from '@/hooks/useCurrentUser';

type ChatRole = 'user' | 'assistant' | 'system';
type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  imagePreview?: string | null;
};

const PRESETS: { label: string; prompt: string }[] = [
  {
    label: 'Subway Station',
    prompt:
      'NYC MTA subway station platform, yellow safety line, turnstiles, MetroCard machines, brick walls, fluorescent lights, morning rush hour',
  },
  {
    label: 'Construction Site',
    prompt:
      'Active construction site with scaffolding, steel beams, concrete floor, hard hats and safety vests, heavy machinery, warning signs',
  },
  {
    label: 'Hospital',
    prompt:
      'Hospital emergency ward, medical equipment, patient beds with curtains, nurses station, clean white walls, hallway',
  },
  {
    label: 'Electrical Room',
    prompt:
      'Industrial electrical panel room, circuit breakers, wiring conduits, safety warning signs, concrete walls, overhead lighting',
  },
  {
    label: 'Factory Floor',
    prompt:
      'Manufacturing factory, assembly line, conveyor belts, industrial machinery, yellow floor markings, high ceiling',
  },
  {
    label: 'Emergency Scene',
    prompt:
      'Building evacuation hallway, emergency exit signs, light smoke, people moving to exits, fire extinguisher, emergency lighting',
  },
];

const LOADING_LINES = [
  'Initializing AI model…',
  'Generating your 360° environment…',
  'Applying panoramic projection…',
  'Finalizing the world…',
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });

  // Downscale so serverless body stays small (avoids "fetch failed" on huge payloads).
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 1280;
      const scale = Math.min(1, maxW / Math.max(img.width, 1));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function AiWorldsPage() {
  const t = useThemeStyles();
  const router = useRouter();
  const { user } = useCurrentUser();
  const userId = (user as { userId?: string; id?: string } | null)?.userId ?? (user as { id?: string } | null)?.id ?? 'demo-user-001';

  const [orgId, setOrgId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Describe any workplace in plain English — or attach a reference photo. I’ll generate a navigable 360° training world.',
    },
  ]);
  const [draft, setDraft] = useState('');
  const [attachPreview, setAttachPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingLine, setLoadingLine] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryIn, setRetryIn] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [step, setStep] = useState<'chat' | 'name'>('chat');
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [industry, setIndustry] = useState('Transit & Rail');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastPromptRef = useRef('');
  const lastRefRef = useRef<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const pr = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`).then((r) => r.json());
        if (pr?.org?.id) setOrgId(pr.org.id);
      } catch {
        /* optional */
      }
    };
    void run();
  }, [userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  useEffect(() => {
    if (!isGenerating) return;
    const id = window.setInterval(() => setLoadingLine((i) => (i + 1) % LOADING_LINES.length), 2800);
    return () => window.clearInterval(id);
  }, [isGenerating]);

  const generate = useCallback(
    async (prompt: string, referenceImageBase64: string | null) => {
      const clean = prompt.trim();
      if (!clean || isGenerating) return;

      lastPromptRef.current = clean;
      lastRefRef.current = referenceImageBase64;
      setError(null);
      setRetryIn(null);
      setIsGenerating(true);
      setLoadingLine(0);

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'user',
          text: clean,
          imagePreview: referenceImageBase64,
        },
      ]);
      setDraft('');
      setAttachPreview(null);

      try {
        const res = await fetch('/api/ai-worlds/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: clean,
            referenceImageBase64,
            userId,
            orgId,
            saveScenario: Boolean(orgId),
            title: `AI World: ${clean.slice(0, 48)}`,
          }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.status === 503 && data?.retry) {
          const wait = Math.ceil(Number(data.estimated_time) || 30);
          setRetryIn(wait);
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: 'assistant',
              text: `The model is warming up. Retrying in about ${wait}s…`,
            },
          ]);
          setIsGenerating(false);
          return;
        }

        if (!res.ok) {
          throw new Error(data?.error || `Generation failed (${res.status})`);
        }

        setImageUrl(data.imageUrl);
        if (data.scenarioId) setScenarioId(data.scenarioId);
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: 'assistant',
            text: data.usedReference
              ? 'Generated a 360° world using your reference photo. Drag to look around — refine with another message, or use this world.'
              : 'Generated your 360° world. Drag to look around — refine with another message, or use this world.',
          },
        ]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Generation failed';
        const friendly =
          msg === 'Failed to fetch' || msg === 'fetch failed'
            ? 'Network error talking to the API. If this keeps happening, the Hugging Face key may be missing on Vercel — check HUGGING_FACE_API_KEY and Redeploy.'
            : msg;
        setError(friendly);
        setMessages((prev) => [...prev, { id: uid(), role: 'assistant', text: `Couldn’t generate: ${friendly}` }]);
      } finally {
        setIsGenerating(false);
      }
    },
    [isGenerating, orgId, userId]
  );

  // Auto-retry after 503 countdown
  useEffect(() => {
    if (retryIn == null) return;
    if (retryIn <= 0) {
      setRetryIn(null);
      void generate(lastPromptRef.current, lastRefRef.current);
      return;
    }
    const tmr = window.setTimeout(() => setRetryIn((n) => (n == null ? null : n - 1)), 1000);
    return () => window.clearTimeout(tmr);
  }, [retryIn, generate]);

  const onPickFile = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please attach an image file');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Reference image must be under 8MB');
      return;
    }
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setAttachPreview(dataUrl);
      setError(null);
    } catch {
      setError('Could not read that image');
    }
  };

  const useThisWorld = () => {
    if (!imageUrl) return;
    setScenarioTitle((v) => v || lastPromptRef.current.slice(0, 60) || 'AI Training World');
    setStep('name');
  };

  const continueToQuestions = () => {
    if (!imageUrl) return;
    const title = scenarioTitle.trim() || 'AI Training World';
    if (scenarioId) {
      router.push(`/dashboard/create?scenarioId=${encodeURIComponent(scenarioId)}`);
      return;
    }
    try {
      sessionStorage.setItem(
        'immersetrain_ai_world_handoff',
        JSON.stringify({
          imageUrl,
          title,
          industry,
          tag: 'ai-generated',
          at: Date.now(),
        })
      );
    } catch {
      /* ignore quota */
    }
    // Prefer short query for http(s) URLs; data: URLs go via sessionStorage only
    if (imageUrl.startsWith('http')) {
      router.push(
        `/dashboard/create?aiWorldUrl=${encodeURIComponent(imageUrl)}&title=${encodeURIComponent(title)}&industry=${encodeURIComponent(industry)}&tag=ai-generated`
      );
      return;
    }
    router.push(
      `/dashboard/create?aiWorld=1&title=${encodeURIComponent(title)}&industry=${encodeURIComponent(industry)}&tag=ai-generated`
    );
  };

  return (
    <div style={{ minHeight: '100dvh', background: t.bg, color: t.text }}>
      <Nav />

      <main style={{ paddingTop: 88, paddingBottom: 48, maxWidth: 1240, margin: '0 auto', paddingInline: 18 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          style={{ marginBottom: 28 }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 999,
              border: `1px solid ${t.border}`,
              background: t.surface,
              fontSize: 12,
              fontWeight: 700,
              color: t.indigo,
              marginBottom: 14,
              fontFamily: 'var(--font-satoshi, system-ui)',
            }}
          >
            <Sparkles size={14} /> Free · AI Worlds
          </div>
          <h1
            style={{
              margin: '0 0 10px',
              fontFamily: 'var(--font-clash, var(--font-syne, system-ui))',
              fontSize: 'clamp(28px, 5vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Generate any training world
          </h1>
          <p style={{ margin: 0, maxWidth: 640, color: t.textSecondary, fontSize: 16, lineHeight: 1.55 }}>
            No camera. No recording. Describe a workplace or drop a reference photo — AI builds a 360° environment you
            can train in.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.95fr)',
                gap: 18,
                alignItems: 'stretch',
              }}
              className="ai-worlds-grid"
            >
              <section
                style={{
                  borderRadius: 20,
                  border: `1px solid ${t.border}`,
                  background: t.cardBg,
                  overflow: 'hidden',
                  minHeight: 420,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ flex: 1, minHeight: 360, position: 'relative' }}>
                  <AiWorldSkyPreview imageUrl={imageUrl} />
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 10,
                    padding: 14,
                    borderTop: `1px solid ${t.border}`,
                  }}
                >
                  <button
                    type="button"
                    disabled={!imageUrl || isGenerating}
                    onClick={useThisWorld}
                    style={{
                      flex: 1,
                      minWidth: 160,
                      height: 48,
                      borderRadius: 12,
                      border: 'none',
                      background: imageUrl ? t.indigo : t.surface,
                      color: imageUrl ? '#fff' : t.textMuted,
                      fontWeight: 800,
                      cursor: imageUrl ? 'pointer' : 'not-allowed',
                      fontFamily: 'var(--font-satoshi, system-ui)',
                    }}
                  >
                    Use this world →
                  </button>
                  <button
                    type="button"
                    disabled={!imageUrl || isGenerating}
                    onClick={() => void generate(lastPromptRef.current || draft, lastRefRef.current || attachPreview)}
                    style={{
                      height: 48,
                      paddingInline: 16,
                      borderRadius: 12,
                      border: `1px solid ${t.border}`,
                      background: 'transparent',
                      color: t.textSecondary,
                      fontWeight: 700,
                      cursor: imageUrl ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Try again
                  </button>
                  {imageUrl && (
                    <a
                      href={imageUrl}
                      download="immersetrain-ai-world.jpg"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        height: 48,
                        paddingInline: 16,
                        borderRadius: 12,
                        border: `1px solid ${t.border}`,
                        display: 'grid',
                        placeItems: 'center',
                        textDecoration: 'none',
                        color: t.textSecondary,
                        fontWeight: 700,
                      }}
                    >
                      Download
                    </a>
                  )}
                </div>
              </section>

              <section
                style={{
                  borderRadius: 20,
                  border: `1px solid ${t.border}`,
                  background: t.cardBg,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 420,
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${t.border}` }}>
                  <p style={{ margin: 0, fontWeight: 800, fontFamily: 'var(--font-clash, system-ui)' }}>World builder chat</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: t.textMuted }}>
                    Attach a Google/phone photo as reference anytime
                  </p>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '92%',
                        padding: '10px 12px',
                        borderRadius: 14,
                        background:
                          m.role === 'user'
                            ? 'linear-gradient(135deg, rgba(91,76,255,0.92), rgba(0,212,255,0.55))'
                            : t.surface,
                        color: m.role === 'user' ? '#fff' : t.text,
                        border: m.role === 'user' ? 'none' : `1px solid ${t.border}`,
                        fontSize: 14,
                        lineHeight: 1.45,
                      }}
                    >
                      {m.imagePreview && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.imagePreview}
                          alt="Reference"
                          style={{
                            width: '100%',
                            maxHeight: 120,
                            objectFit: 'cover',
                            borderRadius: 10,
                            marginBottom: 8,
                          }}
                        />
                      )}
                      {m.text}
                    </div>
                  ))}
                  {isGenerating && (
                    <div
                      style={{
                        alignSelf: 'flex-start',
                        padding: '10px 12px',
                        borderRadius: 14,
                        background: t.surface,
                        border: `1px solid ${t.border}`,
                        color: t.textSecondary,
                        fontSize: 13,
                      }}
                    >
                      {LOADING_LINES[loadingLine]}
                      <div
                        style={{
                          marginTop: 8,
                          height: 4,
                          borderRadius: 99,
                          background: t.border,
                          overflow: 'hidden',
                        }}
                      >
                        <motion.div
                          style={{ height: '100%', background: `linear-gradient(90deg, ${t.indigo}, ${t.cyan})` }}
                          animate={{ width: ['12%', '88%', '40%'] }}
                          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      </div>
                    </div>
                  )}
                  {retryIn != null && (
                    <div style={{ fontSize: 13, color: t.cyan }}>Retrying in {retryIn}s…</div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div style={{ padding: 12, borderTop: `1px solid ${t.border}` }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setDraft(p.prompt)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 999,
                          border: `1px solid ${t.border}`,
                          background: t.surface,
                          color: t.textSecondary,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {attachPreview && (
                    <div style={{ position: 'relative', width: 72, marginBottom: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attachPreview}
                        alt="Attach"
                        style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: `1px solid ${t.border}` }}
                      />
                      <button
                        type="button"
                        aria-label="Remove attachment"
                        onClick={() => setAttachPreview(null)}
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          width: 22,
                          height: 22,
                          borderRadius: 99,
                          border: 'none',
                          background: t.indigo,
                          color: '#fff',
                          display: 'grid',
                          placeItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      aria-label="Attach reference image"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        border: `1px solid ${t.border}`,
                        background: t.surface,
                        color: t.textSecondary,
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <ImagePlus size={18} />
                    </button>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={2}
                      placeholder="Describe the training environment…"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          void generate(draft, attachPreview);
                        }
                      }}
                      style={{
                        flex: 1,
                        resize: 'none',
                        borderRadius: 12,
                        border: `1px solid ${t.border}`,
                        background: t.bgAlt,
                        color: t.text,
                        padding: '10px 12px',
                        fontSize: 14,
                        fontFamily: 'var(--font-satoshi, system-ui)',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      disabled={isGenerating || !draft.trim()}
                      onClick={() => void generate(draft, attachPreview)}
                      aria-label="Send"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        border: 'none',
                        background: isGenerating || !draft.trim() ? t.surface : t.indigo,
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: isGenerating || !draft.trim() ? 'not-allowed' : 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  {error && (
                    <p style={{ margin: '8px 0 0', color: '#f87171', fontSize: 13 }}>{error}</p>
                  )}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                maxWidth: 560,
                margin: '0 auto',
                borderRadius: 20,
                border: `1px solid ${t.border}`,
                background: t.cardBg,
                padding: 24,
              }}
            >
              <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--font-clash, system-ui)', fontSize: 24 }}>Name your scenario</h2>
              <p style={{ margin: '0 0 18px', color: t.textSecondary, fontSize: 14 }}>
                Then add quiz questions in the scenario editor.
              </p>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: t.textMuted, marginBottom: 6 }}>
                Scenario title
              </label>
              <input
                value={scenarioTitle}
                onChange={(e) => setScenarioTitle(e.target.value)}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 12,
                  border: `1px solid ${t.border}`,
                  background: t.bgAlt,
                  color: t.text,
                  padding: '0 12px',
                  marginBottom: 14,
                }}
              />
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: t.textMuted, marginBottom: 6 }}>
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 12,
                  border: `1px solid ${t.border}`,
                  background: t.bgAlt,
                  color: t.text,
                  padding: '0 12px',
                  marginBottom: 18,
                }}
              >
                {['Transit & Rail', 'Healthcare', 'Construction', 'Utilities', 'Manufacturing', 'Emergency Services'].map(
                  (i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  )
                )}
              </select>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setStep('chat')}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 12,
                    border: `1px solid ${t.border}`,
                    background: 'transparent',
                    color: t.textSecondary,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={continueToQuestions}
                  style={{
                    flex: 1.4,
                    height: 48,
                    borderRadius: 12,
                    border: 'none',
                    background: t.indigo,
                    color: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Add questions →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section style={{ marginTop: 40 }}>
          <h3 style={{ margin: '0 0 16px', fontFamily: 'var(--font-clash, system-ui)', fontSize: 20 }}>How it works</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }} className="ai-worlds-steps">
            {[
              { t: 'Describe', d: 'Type what you need, or attach a photo of a real station or workplace.' },
              { t: 'AI generates', d: 'We create a photorealistic 360° panorama you can look around in the browser.' },
              { t: 'Add & train', d: 'Name it, add quiz questions, and share a /train link with your team.' },
            ].map((s) => (
              <div
                key={s.t}
                style={{
                  borderRadius: 16,
                  border: `1px solid ${t.border}`,
                  background: t.surface,
                  padding: 18,
                }}
              >
                <p style={{ margin: '0 0 8px', fontWeight: 800, color: t.indigo }}>{s.t}</p>
                <p style={{ margin: 0, color: t.textSecondary, fontSize: 14, lineHeight: 1.5 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 18, fontSize: 13, color: t.textMuted }}>
            Prefer classic video scenarios?{' '}
            <Link href="/dashboard/create" style={{ color: t.cyan }}>
              Open the scenario builder
            </Link>
            .
          </p>
        </section>
      </main>

      <style>{`
        @media (max-width: 960px) {
          .ai-worlds-grid { grid-template-columns: 1fr !important; }
          .ai-worlds-steps { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
