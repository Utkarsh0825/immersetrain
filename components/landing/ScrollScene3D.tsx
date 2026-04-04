'use client';

import { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Environment, Stars, Sparkles } from '@react-three/drei';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  type MotionValue,
} from 'framer-motion';
import * as THREE from 'three';

/* ────────────────────────────────────────────────
   Mobile detection hook
   ──────────────────────────────────────────────── */
function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return mobile;
}

/* ────────────────────────────────────────────────
   VR headset that reads framer-motion scroll values
   via a shared ref object updated each frame.
   ──────────────────────────────────────────────── */
interface HeadsetValues {
  rotY: number;
  rotX: number;
  scale: number;
  camZ: number;
  lensOpacity: number;
  dissolve: number;
  sparkleCount: number;
}

/** Stylized visor glow (no video — keeps performance and a clean product look). */
function HeadsetVisorGlow() {
  return (
    <mesh position={[0, 0, 0.505]} renderOrder={1}>
      <planeGeometry args={[1.72, 0.8]} />
      <meshStandardMaterial
        color="#0c1222"
        metalness={0.35}
        roughness={0.35}
        emissive="#5B4CFF"
        emissiveIntensity={0.55}
        toneMapped
      />
    </mesh>
  );
}

function VRHeadset({ vals }: { vals: React.MutableRefObject<HeadsetValues> }) {
  const groupRef = useRef<THREE.Group>(null);

  const bodyColor = '#2d3258';

  const lensMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const v = vals.current;

    const targetScale = Math.max(v.scale * (1 - v.dissolve), 0.01);
    const currentScale = groupRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 4);
    groupRef.current.scale.setScalar(nextScale);

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      v.rotY,
      delta * 3,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      v.rotX,
      delta * 3,
    );

    if (lensMatRef.current) {
      lensMatRef.current.opacity = THREE.MathUtils.lerp(
        lensMatRef.current.opacity,
        v.lensOpacity,
        delta * 4,
      );
    }
    if (bodyMatRef.current) {
      bodyMatRef.current.opacity = THREE.MathUtils.lerp(
        bodyMatRef.current.opacity,
        1 - v.dissolve * 0.8,
        delta * 4,
      );
      bodyMatRef.current.transparent = true;
    }
  });

  return (
    <group ref={groupRef}>
      <RoundedBox args={[2.4, 1.2, 1.0]} radius={0.18} smoothness={6}>
        <meshStandardMaterial
          ref={bodyMatRef}
          color={bodyColor}
          metalness={0.65}
          roughness={0.28}
          emissive="#1a1f3a"
          emissiveIntensity={0.15}
        />
      </RoundedBox>

      <HeadsetVisorGlow />

      <mesh position={[-0.48, 0, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.12, 48]} />
        <meshStandardMaterial
          ref={lensMatRef}
          color="#93c5fd"
          metalness={0.25}
          roughness={0.15}
          emissive="#00D4FF"
          emissiveIntensity={0.35}
          opacity={0.45}
          transparent
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0.48, 0, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.12, 48]} />
        <meshStandardMaterial
          color="#93c5fd"
          metalness={0.25}
          roughness={0.15}
          emissive="#5B4CFF"
          emissiveIntensity={0.35}
          opacity={0.45}
          transparent
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0, -0.3]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.5, 0.05, 12, 64]} />
        <meshStandardMaterial
          color={bodyColor}
          metalness={0.7}
          roughness={0.25}
          emissive="#5B4CFF"
          emissiveIntensity={0.08}
        />
      </mesh>
    </group>
  );
}

/* ────────────────────────────────────────────────
   Camera controller driven by scroll
   ──────────────────────────────────────────────── */
function CameraController({ vals }: { vals: React.MutableRefObject<HeadsetValues> }) {
  useFrame(({ camera }, delta) => {
    const targetZ = vals.current.camZ;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * 3);
  });
  return null;
}

/* ────────────────────────────────────────────────
   Dissolve sparkles that ramp up in phase 4
   ──────────────────────────────────────────────── */
function DissolveSparkles({ vals }: { vals: React.MutableRefObject<HeadsetValues> }) {
  const ref = useRef<THREE.Points>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.visible = vals.current.dissolve > 0.05;
  });

  return (
    <Sparkles
      ref={ref as never}
      count={200}
      size={3}
      color="#5B4CFF"
      scale={6}
      speed={2}
      opacity={0.9}
    />
  );
}

/* ────────────────────────────────────────────────
   Inner 3D scene
   ──────────────────────────────────────────────── */
function Scene3D({ vals }: { vals: React.MutableRefObject<HeadsetValues> }) {
  return (
    <>
      <Environment preset="city" />
      <pointLight position={[0, 4, 2]} color="#5B4CFF" intensity={16} distance={16} />
      <pointLight position={[-3, -2, 3]} color="#00D4FF" intensity={12} distance={14} />
      <pointLight position={[2.5, 1, 4]} color="#ffffff" intensity={4} distance={20} />
      <ambientLight intensity={0.38} />

      <Stars count={2000} depth={50} fade saturation={0.2} />

      <CameraController vals={vals} />
      <VRHeadset vals={vals} />
      <Sparkles count={80} size={1.5} color="#5B4CFF" scale={8} speed={0.6} opacity={0.7} />
      <DissolveSparkles vals={vals} />
    </>
  );
}

/* ────────────────────────────────────────────────
   Static mobile fallback
   ──────────────────────────────────────────────── */
function MobileFallback() {
  const phases = [
    {
      title: 'Record your real workplace in 360°',
      sub: 'Any 360° camera works',
      icon: '01',
    },
    {
      title: 'Add questions at any moment',
      sub: 'Context-driven learning that sticks',
      icon: '02',
    },
    {
      title: 'Track every learner\u2019s progress',
      sub: '87% Pass rate \u00B7 4.2\u00D7 Faster \u00B7 $0 Hardware',
      icon: '03',
    },
    {
      title: 'From any device. Any browser.',
      sub: 'Laptop, phone, or VR headset',
      icon: '04',
    },
  ];

  return (
    <section style={{ padding: '80px 20px', background: '#060608' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {phases.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            style={{
              padding: '32px 28px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: 16,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(91,76,255,0.15)', border: '1px solid rgba(91,76,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#5B4CFF',
              fontFamily: 'var(--font-clash)', marginBottom: 16,
            }}>
              {p.icon}
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-clash)',
                fontSize: 22,
                fontWeight: 600,
                color: '#f1f5f9',
                marginBottom: 8,
              }}
            >
              {p.title}
            </h3>
            <p
              style={{
                fontSize: 14,
                color: 'rgba(241,245,249,0.5)',
                lineHeight: 1.5,
              }}
            >
              {p.sub}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   Device SVG icons for phase 4
   ──────────────────────────────────────────────── */
function LaptopIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(241,245,249,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M2 20h20" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(241,245,249,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" />
    </svg>
  );
}
function VRIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(241,245,249,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="10" rx="3" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="16" cy="12" r="2" />
      <path d="M10 12h4" />
    </svg>
  );
}

/** Scroll height reserve: after the journey completes we jump here so layout matches “How it works” below. */
const SCENE_SCROLL_VH = 260;

/* ────────────────────────────────────────────────
   MAIN EXPORT — sticky VR scene + desktop wheel journey
   ──────────────────────────────────────────────── */
export default function ScrollScene3D() {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollPinYRef = useRef<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  /**
   * Desktop: while the sticky block fills the viewport, the page scroll position is held fixed
   * and this value (0→1) is driven by the mouse wheel / trackpad — the VR journey.
   * Before/after that, we sync from native scroll progress through the section.
   * Mobile: unused (MobileFallback); hooks still run.
   */
  const journey = useMotionValue(0);

  /* ── Desktop: wheel drives journey while pinned; scroll sync when not pinned ── */
  useEffect(() => {
    if (isMobile) return;

    const root = sectionRef.current;
    if (!root) return;

    const isPinned = () => {
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      return rect.top <= 1 && rect.bottom >= vh - 2;
    };

    const syncJourneyFromScroll = () => {
      journey.set(scrollYProgress.get());
    };

    const onScroll = () => {
      const pinned = isPinned();
      const p = journey.get();

      /* Only snap scroll *down* past the pin point while the journey is incomplete.
         Allowing scroll *up* (scrollY < anchor) lets users leave the VR block back to the hero. */
      if (pinned && p < 0.995) {
        if (scrollPinYRef.current === null) {
          scrollPinYRef.current = window.scrollY;
        }
        const anchor = scrollPinYRef.current;
        if (anchor != null && window.scrollY > anchor + 6) {
          window.scrollTo({ top: anchor, left: 0, behavior: 'instant' });
        }
      } else {
        scrollPinYRef.current = null;
        syncJourneyFromScroll();
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!isPinned()) return;

      const p = journey.get();
      const down = e.deltaY > 0;

      if (down && p >= 1 - 1e-5) return;
      if (!down && p <= 1e-5) return;

      e.preventDefault();
      e.stopPropagation();

      const next = Math.min(1, Math.max(0, p + e.deltaY * 0.00088));
      journey.set(next);

      if (next >= 0.996 && down) {
        const vh = window.innerHeight;
        const top = root.offsetTop + root.offsetHeight - vh;
        requestAnimationFrame(() => {
          window.scrollTo({ top, left: 0, behavior: 'instant' });
          scrollPinYRef.current = null;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    syncJourneyFromScroll();
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel, { capture: true });
    };
  }, [isMobile, scrollYProgress, journey]);

  const s = journey;

  /* Headset transforms mapped from scroll */
  const rotY = useTransform(s, [0, 0.25, 0.5, 0.75, 1], [0, 0, Math.PI / 2, Math.PI / 2, Math.PI / 2]);
  const rotX = useTransform(s, [0, 0.25, 0.5, 0.75, 1], [0, 0, 0, -0.4, -0.4]);
  const headScale = useTransform(s, [0, 0.25, 0.5, 0.75, 0.92, 1], [1, 1, 1.6, 2.0, 1.0, 0.6]);
  const camZ = useTransform(s, [0, 0.25, 0.5, 0.75, 1], [5, 5, 3, 3, 5]);
  const lensOpacity = useTransform(s, [0, 0.5, 0.75, 1], [0.8, 0.8, 0.4, 0.3]);
  const dissolve = useTransform(s, [0.85, 1], [0, 0.8]);

  /* Background color morph */
  const bgColor = useTransform(
    s,
    [0, 0.25, 0.5, 0.75, 1],
    ['#060608', '#060608', '#0a0520', '#0f0828', '#060608'],
  );

  /* Phase opacities — each phase fills its full 25% with overlap for smooth crossfade */
  const p0 = useTransform(s, [0, 0.02, 0.22, 0.27], [0, 1, 1, 0]);
  const p1 = useTransform(s, [0.23, 0.28, 0.47, 0.52], [0, 1, 1, 0]);
  const p2 = useTransform(s, [0.48, 0.53, 0.72, 0.77], [0, 1, 1, 0]);
  const p3 = useTransform(s, [0.73, 0.78, 1.0, 1.0], [0, 1, 1, 1]);

  /* Stat cards (phase 3) */
  const statsOpacity = useTransform(s, [0.55, 0.61], [0, 1]);
  const statsY = useTransform(s, [0.55, 0.63], [40, 0]);

  /* Device icons (phase 4) */
  const devicesOpacity = useTransform(s, [0.80, 0.86], [0, 1]);
  const devicesScale = useTransform(s, [0.80, 0.88], [0.8, 1]);

  /* Shared ref for R3F to read motion values without re-renders */
  const valsRef = useRef<HeadsetValues>({
    rotY: 0,
    rotX: 0,
    scale: 1,
    camZ: 5,
    lensOpacity: 0.8,
    dissolve: 0,
    sparkleCount: 80,
  });

  /* Sync motion values → ref (runs in React reconciler, not R3F loop) */
  useMotionSync(rotY, (v) => { valsRef.current.rotY = v; });
  useMotionSync(rotX, (v) => { valsRef.current.rotX = v; });
  useMotionSync(headScale, (v) => { valsRef.current.scale = v; });
  useMotionSync(camZ, (v) => { valsRef.current.camZ = v; });
  useMotionSync(lensOpacity, (v) => { valsRef.current.lensOpacity = v; });
  useMotionSync(dissolve, (v) => { valsRef.current.dissolve = v; });

  if (isMobile) return <MobileFallback />;

  return (
    <div
      ref={sectionRef}
      data-vr-journey-root
      style={{
        height: `${SCENE_SCROLL_VH}vh`,
        position: 'relative',
        background: '#060608',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Background color morph */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: bgColor,
          }}
        />

        {/* 3D Canvas */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
          }}
        >
          <Canvas
            dpr={[1, 2]}
            gl={{ alpha: true, antialias: true }}
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
          >
            <Suspense fallback={null}>
              <Scene3D vals={valsRef} />
            </Suspense>
          </Canvas>
        </div>

        {/* ── Phase 0: Record ── */}
        <motion.div
          style={{
            opacity: p0,
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 clamp(32px, 6vw, 100px)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ maxWidth: 340 }}>
            <h3
              style={{
                fontFamily: 'var(--font-clash)',
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                fontWeight: 700,
                color: '#f1f5f9',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
              Record your real workplace in 360°
            </h3>
          </div>
          <div style={{ maxWidth: 240, textAlign: 'right' }}>
            <p
              style={{
                fontFamily: 'var(--font-satoshi)',
                fontSize: 18,
                color: 'rgba(241,245,249,0.5)',
                lineHeight: 1.5,
              }}
            >
              Any 360° camera works
            </p>
            <div
              style={{
                marginTop: 12,
                height: 2,
                background:
                  'linear-gradient(90deg, transparent, rgba(91,76,255,0.5), transparent)',
              }}
            />
          </div>
        </motion.div>

        {/* ── Phase 1: Questions ── */}
        <motion.div
          style={{
            opacity: p1,
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: '10vh',
            pointerEvents: 'none',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-clash)',
              fontSize: 'clamp(28px, 3.5vw, 44px)',
              fontWeight: 700,
              color: '#f1f5f9',
              letterSpacing: '-0.03em',
              textAlign: 'center',
              marginBottom: 32,
            }}
          >
            Add questions at{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #5B4CFF, #00D4FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              any moment
            </span>
          </h3>
        </motion.div>

        {/* ── Phase 2: Track progress ── */}
        <motion.div
          style={{
            opacity: p2,
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: '8vh',
            pointerEvents: 'none',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-clash)',
              fontSize: 'clamp(24px, 3vw, 40px)',
              fontWeight: 700,
              color: '#f1f5f9',
              letterSpacing: '-0.03em',
              textAlign: 'center',
              marginBottom: 36,
              maxWidth: 600,
            }}
          >
            Track every learner&apos;s progress{' '}
            <span style={{ color: '#00D4FF' }}>in real time</span>
          </h3>

          {/* Stat cards */}
          <motion.div
            style={{
              opacity: statsOpacity,
              y: statsY,
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {[
              { value: '87%', label: 'Pass rate', color: '#10b981' },
              { value: '4.2×', label: 'Faster', color: '#5B4CFF' },
              { value: '$0', label: 'Hardware required', color: '#00D4FF' },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  padding: '20px 28px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  textAlign: 'center',
                  minWidth: 140,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-clash)',
                    fontSize: 32,
                    fontWeight: 700,
                    color: s.color,
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'rgba(241,245,249,0.5)',
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Phase 3: Any device ── */}
        <motion.div
          style={{
            opacity: p3,
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-clash)',
              fontSize: 'clamp(28px, 4vw, 52px)',
              fontWeight: 700,
              color: '#f1f5f9',
              letterSpacing: '-0.03em',
              textAlign: 'center',
              lineHeight: 1.1,
              marginBottom: 48,
            }}
          >
            From any device.
            <br />
            Any browser.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #5B4CFF, #00D4FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Any worker.
            </span>
          </h3>

          <motion.div
            style={{
              opacity: devicesOpacity,
              scale: devicesScale,
              display: 'flex',
              gap: 48,
              alignItems: 'center',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <LaptopIcon />
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: 'rgba(241,245,249,0.4)',
                  fontWeight: 500,
                }}
              >
                Laptop
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <PhoneIcon />
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: 'rgba(241,245,249,0.4)',
                  fontWeight: 500,
                }}
              >
                Phone
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <VRIcon />
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: 'rgba(241,245,249,0.4)',
                  fontWeight: 500,
                }}
              >
                VR Headset
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll progress indicator */}
        <div
          style={{
            position: 'absolute',
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            zIndex: 30,
          }}
        >
          {[p0, p1, p2, p3].map((pOpacity, i) => (
            <motion.div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.3)',
                opacity: pOpacity,
              }}
            />
          ))}
        </div>

        {/* Desktop: explain wheel-driven journey */}
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 35,
            pointerEvents: 'none',
            textAlign: 'center',
            maxWidth: 320,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-satoshi)',
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(241,245,249,0.35)',
              fontWeight: 600,
            }}
          >
            Scroll with trackpad or mouse wheel to move through the journey
          </p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   Hook: subscribe to a MotionValue and call
   a setter on each change (batched via rAF).
   ──────────────────────────────────────────────── */
function useMotionSync(mv: MotionValue<number>, set: (v: number) => void) {
  useEffect(() => {
    const unsub = mv.on('change', set);
    return unsub;
  }, [mv, set]);
}
