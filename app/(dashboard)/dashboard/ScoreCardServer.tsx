import { DEMO_SCENARIO } from '@/lib/scenarios';
import ScoreCard from '@/components/dashboard/ScoreCard';

interface Session {
  id: string; score: number; max_score: number; completed: boolean; started_at: string; scenario_id: string;
}

export default function ScoreCardServer({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return (
      <div style={{
        background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.12)',
        borderRadius: 16, padding: '40px 24px', textAlign: 'center',
      }}>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', margin: '0 0 16px' }}>
          You haven&apos;t completed any training yet.
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          Start your first scenario above to begin tracking your progress.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sessions.map((session, i) => (
        <ScoreCard
          key={session.id}
          sessionId={session.id}
          scenarioTitle={DEMO_SCENARIO.title}
          score={session.score}
          maxScore={session.max_score}
          completed={session.completed}
          startedAt={session.started_at}
          index={i}
        />
      ))}
    </div>
  );
}
