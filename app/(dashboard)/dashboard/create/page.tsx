'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, Pencil, Save, UploadCloud, Link2, Play, Pause } from 'lucide-react';

import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { VideoPlayer360Handle } from '@/components/train/VideoPlayer360';
import { uploadVideo } from '@/lib/storage';

const VideoPlayer360 = dynamic(() => import('@/components/train/VideoPlayer360'), { ssr: false });

type Q = {
  id: string;
  timestamp_seconds: number;
  question_text: string;
  option_a: string;
  option_b: string;
  correct_option: 'a' | 'b';
  explanation: string;
  points: number;
  sort_order: number;
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

function uid() {
  return `q_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function SortableQuestionCard({
  q,
  active,
  onSeek,
  onEdit,
  onDelete,
  t,
}: {
  q: Q;
  active: boolean;
  onSeek: () => void;
  onEdit: () => void;
  onDelete: () => void;
  t: ReturnType<typeof useThemeStyles>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: q.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    borderRadius: 14,
    border: active ? '1px solid rgba(91,76,255,0.5)' : `1px solid ${t.border}`,
    background: active ? 'rgba(91,76,255,0.08)' : t.surface,
    padding: 14,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={onSeek}
          style={{
            padding: '6px 10px',
            borderRadius: 999,
            border: `1px solid ${t.border}`,
            background: 'rgba(255,255,255,0.03)',
            color: t.text,
            fontWeight: 800,
            fontFamily: 'var(--font-satoshi)',
            fontSize: 12,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {formatTime(q.timestamp_seconds)}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: t.text, fontWeight: 800, fontFamily: 'var(--font-satoshi)', fontSize: 13 }}>
            {q.question_text || 'Untitled question'}
          </div>
          <div style={{ color: t.textMuted, fontFamily: 'var(--font-satoshi)', fontSize: 12, marginTop: 4 }}>
            ✓ {q.correct_option === 'a' ? `A: ${q.option_a}` : `B: ${q.option_b}`}
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: `1px solid ${t.border}`,
            background: 'rgba(255,255,255,0.03)',
            color: t.text,
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
          }}
          aria-label="Edit question"
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: `1px solid rgba(239,68,68,0.25)`,
            background: 'rgba(239,68,68,0.06)',
            color: 'rgba(239,68,68,0.9)',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
          }}
          aria-label="Delete question"
        >
          <Trash2 size={16} />
        </button>

        <div
          {...attributes}
          {...listeners}
          style={{
            width: 22,
            height: 34,
            borderRadius: 10,
            border: `1px dashed ${t.border}`,
            display: 'grid',
            placeItems: 'center',
            color: t.textMuted,
            cursor: 'grab',
            flexShrink: 0,
          }}
          aria-label="Drag handle"
        >
          ⠿
        </div>
      </div>
    </div>
  );
}

export default function ScenarioBuilderPage() {
  const t = useThemeStyles();
  const { user } = useCurrentUser();
  const router = useRouter();

  const playerRef = useRef<VideoPlayer360Handle>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  const [orgId, setOrgId] = useState('local-org-demo');
  const createdBy = (user as any)?.userId ?? (user as any)?.id ?? 'demo-user-001';

  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [title, setTitle] = useState('New Scenario');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');

  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoTab, setVideoTab] = useState<'upload' | 'url'>('upload');
  const [urlDraft, setUrlDraft] = useState('');
  const [uploadPct, setUploadPct] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [publishModal, setPublishModal] = useState<{ open: boolean; shareUrl?: string }>({ open: false });

  const [questions, setQuestions] = useState<Q[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = questions.find((q) => q.id === editingId) ?? null;

  // Load profile for org context
  useEffect(() => {
    const run = async () => {
      const userId = createdBy;
      const pr = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`).then((r) => r.json());
      if (pr?.org?.id) setOrgId(pr.org.id);
    };
    void run();
  }, [createdBy]);

  // Read scenarioId from URL (client-only to avoid build-time suspense requirement).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const id = sp.get('scenarioId');
    if (id) setScenarioId(id);
  }, []);

  // Load existing scenario when editing
  useEffect(() => {
    if (!scenarioId) return;
    const run = async () => {
      try {
        const data = await fetch(`/api/scenarios/${encodeURIComponent(scenarioId)}`).then((r) => r.json());
        if (data?.error) throw new Error(data.error);
        setTitle(data.title ?? 'Untitled');
        setDescription(data.description ?? '');
        setIndustry(data.industry ?? '');
        setTags(Array.isArray(data.tags) ? data.tags : []);
        setStatus((data.status ?? 'draft') as any);
        setVideoUrl(data.video_url ?? data.videoUrl ?? '');
        const qs = (data.questions ?? []).map((q: any, idx: number) => ({
          id: q.id ?? uid(),
          timestamp_seconds: q.timestamp_seconds ?? 0,
          question_text: q.question_text ?? '',
          option_a: q.option_a ?? '',
          option_b: q.option_b ?? '',
          correct_option: (q.correct_option ?? 'a') as 'a' | 'b',
          explanation: q.explanation ?? '',
          points: q.points ?? 10,
          sort_order: q.sort_order ?? idx,
        }));
        setQuestions(qs);
      } catch (e: any) {
        toast.error(e?.message ?? 'Failed to load scenario');
      }
    };
    void run();
  }, [scenarioId]);

  // Wire time updates
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;
    const off = playerRef.current.onTimeUpdate((t) => setCurrentTime(t));
    const id = window.setInterval(() => {
      const dur = playerRef.current?.getDuration?.() ?? 0;
      if (dur && dur !== duration) setDuration(dur);
    }, 500);
    return () => {
      off?.();
      window.clearInterval(id);
    };
  }, [playerReady, duration]);

  const addQuestionAt = useCallback(
    (ts: number) => {
      const q: Q = {
        id: uid(),
        timestamp_seconds: Math.max(0, Math.floor(ts)),
        question_text: '',
        option_a: '',
        option_b: '',
        correct_option: 'a',
        explanation: '',
        points: 10,
        sort_order: questions.length,
      };
      setQuestions((prev) => [...prev, q]);
      setEditingId(q.id);
    },
    [questions.length]
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setQuestions((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const next = arrayMove(items, oldIndex, newIndex).map((q, idx) => ({ ...q, sort_order: idx }));
      return next;
    });
  };

  const ids = useMemo(() => questions.map((q) => q.id), [questions]);

  const save = async (nextStatus: 'draft' | 'published' | 'archived' = 'draft') => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!videoUrl.trim()) {
      toast.error('Add a video first (upload or URL)');
      return;
    }
    setSaving(true);
    try {
      if (!scenarioId) {
        // Create
        const res = await fetch('/api/scenarios/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            videoUrl,
            orgId,
            createdBy,
            tags,
            questions,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? 'Create failed');
        setScenarioId(data.scenarioId);
        toast.success('Draft created');
        router.replace(`/dashboard/create?scenarioId=${encodeURIComponent(data.scenarioId)}`);
      } else {
        const res = await fetch(`/api/scenarios/${encodeURIComponent(scenarioId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            videoUrl,
            status: nextStatus,
            questions,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? 'Save failed');
        toast.success(nextStatus === 'published' ? 'Published' : 'Saved');
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (questions.length < 1) {
      toast.error('Add at least 1 question before publishing');
      return;
    }
    await save('published');
    if (scenarioId) {
      const shareUrl = `${window.location.origin}/train/${scenarioId}`;
      setPublishModal({ open: true, shareUrl });
    }
  };

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      if (!scenarioId) {
        // create a local scenario id so the storage path is stable
        setScenarioId(`local-${Date.now()}`);
      }
      setUploadPct(6);
      try {
        // Fake a smooth progress bar (supabase-js upload has no progress callback)
        let p = 6;
        const prog = window.setInterval(() => {
          p = Math.min(92, p + Math.random() * 8);
          setUploadPct(Math.round(p));
        }, 220);
        const url = await uploadVideo(file, orgId, scenarioId ?? `local-${Date.now()}`, () => {});
        window.clearInterval(prog);
        setUploadPct(100);
        setVideoUrl(url);
        toast.success('Upload complete');
      } catch (e: any) {
        toast.error(e?.message ?? 'Upload failed');
      } finally {
        window.setTimeout(() => setUploadPct(0), 900);
      }
    },
    [orgId, scenarioId]
  );

  const dz = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.webm'] },
    maxFiles: 1,
  });

  const loadUrl = async () => {
    const url = urlDraft.trim();
    if (!url) return;
    try {
      const res = await fetch('/api/video/process-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, orgId, createdBy }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'URL failed');
      setVideoUrl(data.publicUrl);
      toast.success('Video loaded');
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not load URL');
    }
  };

  const markerTimes = useMemo(() => questions.map((q) => q.timestamp_seconds), [questions]);

  const glass: React.CSSProperties = { background: t.surface, border: `1px solid ${t.border}`, backdropFilter: 'blur(20px)' };

  return (
    <div style={{ height: 'calc(100vh - 64px)', minHeight: 760, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0 18px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/dashboard" style={{ color: t.textSecondary, textDecoration: 'none', fontWeight: 800, fontFamily: 'var(--font-satoshi)', fontSize: 13 }}>
            ← Dashboard
          </Link>
          <input
            value={title ?? ''}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              fontFamily: 'var(--font-clash)',
              fontWeight: 800,
              fontSize: 20,
              color: t.text,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              minWidth: 220,
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => save('draft')}
            disabled={saving}
            style={{
              padding: '10px 14px',
              borderRadius: 999,
              border: `1px solid ${t.border}`,
              background: 'rgba(255,255,255,0.04)',
              color: t.text,
              fontWeight: 800,
              fontFamily: 'var(--font-satoshi)',
              cursor: 'pointer',
              display: 'inline-flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <Save size={16} /> Save Draft
          </button>
          <button type="button" className="btn-primary" onClick={publish} disabled={saving} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            Publish →
          </button>
        </div>
      </div>

      {/* Main split */}
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14 }}>
        {/* Video panel */}
        <div style={{ ...glass, borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: 16, borderBottom: `1px solid ${t.border}` }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setVideoTab('upload')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: videoTab === 'upload' ? '1px solid rgba(91,76,255,0.5)' : `1px solid ${t.border}`,
                  background: videoTab === 'upload' ? 'rgba(91,76,255,0.10)' : 'rgba(255,255,255,0.02)',
                  color: t.text,
                  fontWeight: 800,
                  fontFamily: 'var(--font-satoshi)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UploadCloud size={16} /> Upload File
              </button>
              <button
                type="button"
                onClick={() => setVideoTab('url')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: videoTab === 'url' ? '1px solid rgba(91,76,255,0.5)' : `1px solid ${t.border}`,
                  background: videoTab === 'url' ? 'rgba(91,76,255,0.10)' : 'rgba(255,255,255,0.02)',
                  color: t.text,
                  fontWeight: 800,
                  fontFamily: 'var(--font-satoshi)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Link2 size={16} /> Paste URL
              </button>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, position: 'relative', background: '#000' }}>
            {!videoUrl ? (
              <div style={{ padding: 18 }}>
                {videoTab === 'upload' ? (
                  <div
                    {...dz.getRootProps()}
                    style={{
                      border: `2px dashed ${t.border}`,
                      borderRadius: 18,
                      padding: 26,
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.02)',
                      textAlign: 'center',
                      color: t.textSecondary,
                    }}
                  >
                    <input {...dz.getInputProps()} />
                    <div style={{ fontSize: 34, marginBottom: 8 }}>📁</div>
                    <div style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, color: t.text, fontSize: 18 }}>
                      Drop your 360° video here
                    </div>
                    <div style={{ marginTop: 8, fontSize: 13 }}>
                      MP4, MOV or WebM · Up to 500MB
                    </div>
                    {uploadPct > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                          <div style={{ width: `${uploadPct}%`, height: '100%', background: 'linear-gradient(90deg, #5B4CFF, #00D4FF)', transition: 'width 0.2s' }} />
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12, color: t.textMuted }}>
                          Uploading… {uploadPct}%
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                      className="input-dark"
                      value={urlDraft ?? ''}
                      onChange={(e) => setUrlDraft(e.target.value)}
                      placeholder="Paste a direct video URL (MP4/MOV/WebM)"
                    />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', color: t.textMuted, fontSize: 12 }}>
                      {['.mp4', 'Bunny CDN', 'Cloudflare', 'Supabase'].map((p) => (
                        <span key={p} style={{ padding: '4px 8px', borderRadius: 999, border: `1px solid ${t.border}`, background: 'rgba(255,255,255,0.02)' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                    <button type="button" className="btn-primary" onClick={loadUrl} style={{ width: 'fit-content' }}>
                      Load Video
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <VideoPlayer360
                  ref={playerRef}
                  videoUrl={videoUrl}
                  fullscreenOnStart={false}
                  onReady={() => setPlayerReady(true)}
                />
                {/* Controls */}
                <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12, zIndex: 50, ...glass, borderRadius: 14, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!playerRef.current) return;
                        if (playing) {
                          playerRef.current.pause();
                          setPlaying(false);
                        } else {
                          playerRef.current.play();
                          setPlaying(true);
                        }
                      }}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        border: `1px solid ${t.border}`,
                        background: 'rgba(255,255,255,0.04)',
                        color: t.text,
                        cursor: 'pointer',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                      aria-label={playing ? 'Pause' : 'Play'}
                    >
                      {playing ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ fontFamily: 'var(--font-satoshi)', fontWeight: 800, fontSize: 12, color: t.text }}>
                          {formatTime(currentTime)} / {formatTime(duration || 0)}
                        </div>
                        <button
                          type="button"
                          onClick={() => addQuestionAt(currentTime)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 999,
                            border: '1px solid rgba(91,76,255,0.35)',
                            background: 'rgba(91,76,255,0.10)',
                            color: 'rgba(240,240,245,0.95)',
                            fontWeight: 900,
                            fontFamily: 'var(--font-satoshi)',
                            cursor: 'pointer',
                          }}
                        >
                          📍 Add Question Here
                        </button>
                      </div>

                      <div style={{ position: 'relative' }}>
                        <input
                          type="range"
                          min={0}
                          max={Math.max(1, Math.floor(duration || 1))}
                          value={Math.floor(currentTime || 0)}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            playerRef.current?.seek(next);
                            setCurrentTime(next);
                          }}
                          style={{ width: '100%' }}
                        />
                        {/* markers */}
                        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                          {markerTimes.map((m, i) => {
                            const pct = duration ? (m / duration) * 100 : 0;
                            return (
                              <span
                                key={`${m}-${i}`}
                                style={{
                                  position: 'absolute',
                                  left: `calc(${pct}% - 3px)`,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: 6,
                                  height: 6,
                                  borderRadius: 99,
                                  background: 'rgba(91,76,255,0.95)',
                                  boxShadow: '0 0 10px rgba(91,76,255,0.35)',
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Details */}
          <div style={{ borderTop: `1px solid ${t.border}`, padding: 16 }}>
            <div style={{ fontFamily: 'var(--font-clash)', fontWeight: 800, fontSize: 14, color: t.text, marginBottom: 10 }}>
              Scenario Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              <input
                className="input-dark"
                value={title ?? ''}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your scenario a title…"
              />
              <textarea
                className="input-dark"
                value={description ?? ''}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                rows={3}
                style={{ resize: 'vertical' }}
              />
              <input className="input-dark" value={industry ?? ''} onChange={(e) => setIndustry(e.target.value)} placeholder="Industry (e.g. Transit & Rail)" />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {tags.map((tg) => (
                  <button
                    key={tg}
                    type="button"
                    onClick={() => setTags((p) => p.filter((x) => x !== tg))}
                    style={{
                      borderRadius: 999,
                      border: `1px solid ${t.border}`,
                      background: 'rgba(255,255,255,0.02)',
                      color: t.text,
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 800,
                      fontFamily: 'var(--font-satoshi)',
                    }}
                  >
                    {tg} ×
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input-dark"
                  value={tagDraft ?? ''}
                  onChange={(e) => setTagDraft(e.target.value)}
                  placeholder="Add tag and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const v = tagDraft.trim();
                      if (!v) return;
                      setTags((p) => (p.includes(v) ? p : [...p, v]));
                      setTagDraft('');
                    }
                  }}
                />
                <select
                  value={status ?? 'draft'}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="input-dark"
                  style={{ maxWidth: 160 }}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Questions panel */}
        <div style={{ ...glass, borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: 16, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-clash)', fontWeight: 800, color: t.text, fontSize: 16 }}>Questions ({questions.length})</div>
              <div style={{ color: t.textMuted, fontFamily: 'var(--font-satoshi)', fontSize: 12, marginTop: 4 }}>
                Click timestamps to seek. Drag to reorder.
              </div>
            </div>
            <button type="button" onClick={() => addQuestionAt(currentTime)} className="btn-primary" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <Plus size={16} /> Add Question
            </button>
          </div>

          <div style={{ padding: 16, overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {questions.length === 0 ? (
              <div className="card-dark" style={{ padding: 18, color: t.textSecondary, fontFamily: 'var(--font-satoshi)' }}>
                No questions yet. Watch your video and click “Add Question Here” at the right moment.
              </div>
            ) : (
              <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {questions.map((q) => (
                      <div key={q.id}>
                        <SortableQuestionCard
                          q={q}
                          active={editingId === q.id}
                          t={t}
                          onSeek={() => {
                            playerRef.current?.seek(q.timestamp_seconds);
                            setCurrentTime(q.timestamp_seconds);
                          }}
                          onEdit={() => setEditingId(q.id)}
                          onDelete={() => {
                            setQuestions((p) => p.filter((x) => x.id !== q.id));
                            if (editingId === q.id) setEditingId(null);
                          }}
                        />

                        {editingId === q.id && (
                          <div style={{ marginTop: 10, borderRadius: 14, border: `1px solid ${t.border}`, background: 'rgba(255,255,255,0.02)', padding: 14 }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                              <div style={{ fontFamily: 'var(--font-satoshi)', fontWeight: 800, fontSize: 12, color: t.textMuted }}>
                                Timestamp (sec)
                              </div>
                              <input
                                className="input-dark"
                                type="number"
                                value={q.timestamp_seconds ?? 0}
                                onChange={(e) => {
                                  const v = Math.max(0, Math.floor(Number(e.target.value || 0)));
                                  setQuestions((p) => p.map((x) => (x.id === q.id ? { ...x, timestamp_seconds: v } : x)));
                                }}
                                style={{ maxWidth: 120 }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const v = Math.max(0, Math.floor(currentTime));
                                  setQuestions((p) => p.map((x) => (x.id === q.id ? { ...x, timestamp_seconds: v } : x)));
                                }}
                                style={{ color: 'var(--color-indigo)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800 }}
                              >
                                Seek to current time
                              </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginTop: 12 }}>
                              <textarea
                                className="input-dark"
                                value={q.question_text ?? ''}
                                onChange={(e) => setQuestions((p) => p.map((x) => (x.id === q.id ? { ...x, question_text: e.target.value } : x)))}
                                placeholder="Question"
                                rows={2}
                              />
                              <input
                                className="input-dark"
                                value={q.option_a ?? ''}
                                onChange={(e) => setQuestions((p) => p.map((x) => (x.id === q.id ? { ...x, option_a: e.target.value } : x)))}
                                placeholder="Option A"
                              />
                              <input
                                className="input-dark"
                                value={q.option_b ?? ''}
                                onChange={(e) => setQuestions((p) => p.map((x) => (x.id === q.id ? { ...x, option_b: e.target.value } : x)))}
                                placeholder="Option B"
                              />

                              <div style={{ display: 'flex', gap: 14, alignItems: 'center', color: t.textSecondary, fontFamily: 'var(--font-satoshi)', fontWeight: 800, fontSize: 13 }}>
                                Correct:
                                <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                                  <input
                                    type="radio"
                                    checked={q.correct_option === 'a'}
                                    onChange={() => setQuestions((p) => p.map((x) => (x.id === q.id ? { ...x, correct_option: 'a' } : x)))}
                                  />
                                  Option A
                                </label>
                                <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                                  <input
                                    type="radio"
                                    checked={q.correct_option === 'b'}
                                    onChange={() => setQuestions((p) => p.map((x) => (x.id === q.id ? { ...x, correct_option: 'b' } : x)))}
                                  />
                                  Option B
                                </label>
                              </div>

                              <textarea
                                className="input-dark"
                                value={q.explanation ?? ''}
                                onChange={(e) => setQuestions((p) => p.map((x) => (x.id === q.id ? { ...x, explanation: e.target.value } : x)))}
                                placeholder="Explanation (optional, shown on wrong answer)"
                                rows={2}
                              />
                              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <div style={{ color: t.textMuted, fontFamily: 'var(--font-satoshi)', fontWeight: 900, fontSize: 12 }}>
                                  Points
                                </div>
                                <input
                                  className="input-dark"
                                  type="number"
                                  value={q.points ?? 10}
                                  onChange={(e) => setQuestions((p) => p.map((x) => (x.id === q.id ? { ...x, points: Math.max(0, Math.floor(Number(e.target.value || 0))) } : x)))}
                                  style={{ maxWidth: 120 }}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const qNow = questions.find((x) => x.id === q.id);
                                  if (!qNow?.question_text || !qNow.option_a || !qNow.option_b) {
                                    toast.error('Fill in question and both options');
                                    return;
                                  }
                                  if (!qNow.explanation) toast.message('Tip: add an explanation for better learning');
                                  setEditingId(null);
                                }}
                                className="btn-primary"
                              >
                                Save Question
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: 999,
                                  border: `1px solid ${t.border}`,
                                  background: 'rgba(255,255,255,0.04)',
                                  color: t.text,
                                  fontWeight: 800,
                                  fontFamily: 'var(--font-satoshi)',
                                  cursor: 'pointer',
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      {/* Publish modal */}
      {publishModal.open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.72)', display: 'grid', placeItems: 'center', padding: 18 }}>
          <div className="card-dark" style={{ width: '100%', maxWidth: 520, padding: 22, background: 'rgba(13,13,20,0.92)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontFamily: 'var(--font-clash)', fontWeight: 900, fontSize: 20, marginBottom: 6, color: t.text }}>
              🎉 Your scenario is live!
            </div>
            <div style={{ color: t.textSecondary, fontFamily: 'var(--font-satoshi)', marginBottom: 14, lineHeight: 1.5 }}>
              Share this link with your team:
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="input-dark" readOnly value={publishModal.shareUrl ?? ''} />
              <button
                type="button"
                className="btn-primary"
                onClick={async () => {
                  await navigator.clipboard.writeText(publishModal.shareUrl ?? '');
                  toast.success('Copied');
                }}
              >
                Copy
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
              <Link className="btn-primary" href={`/train/${encodeURIComponent(scenarioId ?? '')}`} style={{ textDecoration: 'none' }}>
                View as Learner
              </Link>
              <button
                type="button"
                onClick={() => setPublishModal({ open: false })}
                style={{ padding: '10px 14px', borderRadius: 999, border: `1px solid ${t.border}`, background: 'rgba(255,255,255,0.04)', color: t.text, fontWeight: 800, cursor: 'pointer' }}
              >
                Back to Builder
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          div[style*="grid-template-columns: 3fr 2fr"] { grid-template-columns: 1fr !important; }
          div[style*="height: calc(100vh - 64px)"] { height: auto !important; }
        }
      `}</style>
    </div>
  );
}

