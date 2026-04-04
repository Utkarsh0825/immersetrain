'use client';
import { useTheme } from '@/components/ThemeProvider';

export function useThemeStyles() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return {
    bg: dark ? '#060608' : '#ffffff',
    bgAlt: dark ? '#0d0d14' : '#f8f8fc',
    surface: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    surfaceHover: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    borderBright: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
    text: dark ? '#f1f5f9' : '#0f0f14',
    textSecondary: dark ? 'rgba(241,245,249,0.55)' : 'rgba(15,15,20,0.6)',
    textMuted: dark ? 'rgba(241,245,249,0.3)' : 'rgba(15,15,20,0.35)',
    textFaint: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
    cardBg: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    cardBorder: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    glassOverlay: dark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.92)',
    navBg: dark ? 'rgba(6,6,8,0.85)' : 'rgba(255,255,255,0.88)',
    navBorder: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    footerText: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
    footerTextDim: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
    indigo: '#5B4CFF',
    cyan: '#00D4FF',
    isDark: dark,
  };
}
