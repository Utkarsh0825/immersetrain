'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const SPRING_CONFIG = { stiffness: 500, damping: 28, mass: 0.5 };
const SPRING_LAG = { stiffness: 150, damping: 20, mass: 0.8 };

export default function CustomCursor() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const dotX = useSpring(mouseX, SPRING_CONFIG);
  const dotY = useSpring(mouseY, SPRING_CONFIG);
  const ringX = useSpring(mouseX, SPRING_LAG);
  const ringY = useSpring(mouseY, SPRING_LAG);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)');
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsDesktop(e.matches);
    onChange(mq);
    mq.addEventListener('change', onChange as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener('change', onChange as (e: MediaQueryListEvent) => void);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    const onHoverIn = () => setHovering(true);
    const onHoverOut = () => setHovering(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);

    const interactiveSelector = 'a, button, [role="button"], input, textarea, select, [data-cursor-hover]';
    const attachListeners = () => {
      document.querySelectorAll(interactiveSelector).forEach((el) => {
        el.addEventListener('mouseenter', onHoverIn);
        el.addEventListener('mouseleave', onHoverOut);
      });
    };

    attachListeners();
    const observer = new MutationObserver(attachListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      document.querySelectorAll(interactiveSelector).forEach((el) => {
        el.removeEventListener('mouseenter', onHoverIn);
        el.removeEventListener('mouseleave', onHoverOut);
      });
      observer.disconnect();
    };
  }, [isDesktop, mouseX, mouseY, visible]);

  if (!isDesktop) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.15s' }}
    >
      {/* Dot */}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className="absolute left-0 top-0 h-3 w-3 rounded-full bg-[var(--indigo)]"
      />

      {/* Ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: hovering ? 60 : 40,
          height: hovering ? 60 : 40,
          opacity: hovering ? 0.5 : 0.3,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="absolute left-0 top-0 rounded-full border border-[var(--indigo)]"
      />
    </div>
  );
}
