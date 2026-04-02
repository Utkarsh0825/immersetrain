'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Search, ChevronUp, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

interface SessionRow {
  id: string;
  user_name: string;
  user_email: string;
  scenario_title: string;
  score: number;
  max_score: number;
  completed: boolean;
  started_at: string;
}

interface AdminTableProps {
  sessions: SessionRow[];
}

type SortKey = 'user_name' | 'score' | 'started_at';

export default function AdminTable({ sessions }: AdminTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('started_at');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = sessions
    .filter(s =>
      s.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      s.scenario_title?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let av: string | number = a[sortKey] ?? '';
      let bv: string | number = b[sortKey] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  };

  const exportCSV = () => {
    const header = ['Name', 'Email', 'Scenario', 'Score', 'Max Score', '%', 'Passed', 'Date'];
    const rows = filtered.map(s => {
      const pct = s.max_score > 0 ? Math.round((s.score / s.max_score) * 100) : 0;
      return [
        s.user_name, s.user_email, s.scenario_title,
        s.score, s.max_score, `${pct}%`,
        pct >= 70 ? 'Yes' : 'No',
        new Date(s.started_at).toLocaleDateString(),
      ].join(',');
    });
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `immersetrain-scores-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />
      : <ChevronDown size={13} style={{ opacity: 0.3 }} />;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: 200,
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, padding: '0 12px',
        }}>
          <Search size={14} color="rgba(255,255,255,0.35)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search trainee or scenario..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'white', fontSize: 14, padding: '10px 0',
            }}
          />
        </div>
        <button
          onClick={exportCSV}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
            background: 'rgba(0,102,255,0.12)', border: '1px solid rgba(0,102,255,0.25)',
            color: '#0066FF', fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,102,255,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,102,255,0.12)')}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block" style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { label: 'Trainee', key: 'user_name' as SortKey },
                { label: 'Scenario', key: null },
                { label: 'Score', key: 'score' as SortKey },
                { label: 'Status', key: null },
                { label: 'Date', key: 'started_at' as SortKey },
                { label: '', key: null },
              ].map(({ label, key }) => (
                <th
                  key={label}
                  onClick={() => key && handleSort(key)}
                  style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                    cursor: key ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {label} {key && <SortIcon k={key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>
                  No sessions found
                </td>
              </tr>
            )}
            {filtered.map((row, i) => {
              const pct = row.max_score > 0 ? Math.round((row.score / row.max_score) * 100) : 0;
              const passed = pct >= 70;
              return (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{row.user_name || '—'}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{row.user_email}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgba(255,255,255,0.55)', maxWidth: 220 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>
                      {row.scenario_title || 'Handling a Difficult Customer'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 18, fontWeight: 800, color: passed ? '#22c55e' : '#ef4444' }}>
                      {pct}%
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{row.score}/{row.max_score}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                      background: passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: passed ? '#22c55e' : '#ef4444',
                      border: `1px solid ${passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                      {passed ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {passed ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(row.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={`/results/${row.id}`} style={{
                      fontSize: 12, color: '#0066FF', textDecoration: 'none', fontWeight: 600,
                      transition: 'opacity 0.2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      View →
                    </Link>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((row) => {
          const pct = row.max_score > 0 ? Math.round((row.score / row.max_score) * 100) : 0;
          const passed = pct >= 70;
          return (
            <div key={row.id} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{row.user_name || '—'}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{row.user_email}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-syne, system-ui)', fontSize: 22, fontWeight: 800, color: passed ? '#22c55e' : '#ef4444' }}>
                  {pct}%
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 100, fontWeight: 600,
                  background: passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: passed ? '#22c55e' : '#ef4444',
                }}>
                  {passed ? 'Passed' : 'Failed'}
                </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  {new Date(row.started_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            No sessions found
          </div>
        )}
      </div>
    </div>
  );
}
