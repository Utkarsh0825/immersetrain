'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useThemeStyles } from '@/hooks/useThemeStyles';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  const t = useThemeStyles();
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: checked ? '#5B4CFF' : t.border,
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: checked ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

export default function SettingsPage() {
  const t = useThemeStyles();
  const glass: React.CSSProperties = {
    background: t.surface,
    backdropFilter: 'blur(20px)',
    border: '1px solid ' + t.border,
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14,
    fontFamily: 'var(--font-satoshi)', color: t.text,
    background: t.surface, border: '1px solid ' + t.border,
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: t.textSecondary, marginBottom: 8,
  };
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div style={{ padding: '40px 36px', maxWidth: 720, fontFamily: 'var(--font-satoshi)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 style={{
          fontFamily: 'var(--font-clash)', fontSize: 'clamp(28px, 3.5vw, 38px)',
          fontWeight: 700, margin: 0, letterSpacing: '-0.03em', color: t.text,
        }}>
          Settings
        </h1>
        <Link href="/dashboard" style={{ fontSize: 13, color: t.textMuted, textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>
      </div>

      <p style={{
        fontSize: 15, margin: '0 0 40px',
        background: `linear-gradient(90deg, ${t.textSecondary}, rgba(91,76,255,0.6))`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        Manage your profile and preferences
      </p>

      {/* Profile */}
      <div style={{ ...glass, borderRadius: 16, padding: '28px', marginBottom: 20 }}>
        <h2 style={{
          fontFamily: 'var(--font-clash)', fontSize: 18, fontWeight: 600,
          color: t.text, margin: '0 0 20px',
        }}>
          Profile
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input type="text" defaultValue="Demo User" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" defaultValue="demo@immersetrain.com" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div style={{ ...glass, borderRadius: 16, padding: '28px', marginBottom: 20 }}>
        <h2 style={{
          fontFamily: 'var(--font-clash)', fontSize: 18, fontWeight: 600,
          color: t.text, margin: '0 0 20px',
        }}>
          Preferences
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 2 }}>
                Notifications
              </div>
              <div style={{ fontSize: 12, color: t.textMuted }}>
                Receive email updates about training completions
              </div>
            </div>
            <Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />
          </div>
          <div style={{ height: 1, background: t.border }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 2 }}>
                Dark Mode
              </div>
              <div style={{ fontSize: 12, color: t.textMuted }}>
                Always on — we like it dark
              </div>
            </div>
            <Toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{
        ...glass, borderRadius: 16, padding: '28px',
        borderColor: 'rgba(239,68,68,0.15)',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-clash)', fontSize: 18, fontWeight: 600,
          color: '#ef4444', margin: '0 0 12px',
        }}>
          Danger Zone
        </h2>
        <p style={{ fontSize: 13, color: t.textMuted, margin: '0 0 16px' }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          disabled
          style={{
            padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.5)',
            fontWeight: 600, fontSize: 13, cursor: 'not-allowed',
            fontFamily: 'var(--font-satoshi)',
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
