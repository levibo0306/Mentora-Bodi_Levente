import { useEffect, useState } from "react";
import { getUserOverview, UserOverview } from "../api/users";
import { useAuth } from "../context/AuthContext";

export const DashboardOverview = () => {
  const { user } = useAuth();
  const [data, setData] = useState<UserOverview | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getUserOverview();
        setData(res);
      } catch (err) {
        console.error("Nem sikerült betölteni az összefoglalót", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading && !data) {
    return (
      <div className="overview-card overview-loading" aria-live="polite">
        Áttekintés betöltése…
      </div>
    );
  }

  if (!data || !user) return null;

  if (user.role === "teacher") {
    const stats = data.stats as {
      active_quizzes: number;
      total_students: number;
      total_attempts: number;
      avg_score: number;
    };
    return (
      <div className="overview-card teacher-overview">
        <div className="overview-copy">
          <span className="overview-icon" aria-hidden="true">📊</span>
          <div>
            <div className="overview-title">Gyors áttekintés</div>
            <div className="overview-subtitle">A legfontosabb számok a kvízeidről</div>
          </div>
        </div>
        <div className="overview-stats">
          <div className="overview-stat">
            <div className="stat-number">{stats.active_quizzes ?? 0}</div>
            <div className="stat-label">Aktív kvízek</div>
          </div>
          <div className="overview-stat">
            <div className="stat-number">{stats.total_students ?? 0}</div>
            <div className="stat-label">Diák</div>
          </div>
          <div className="overview-stat">
            <div className="stat-number">{stats.avg_score ?? 0}%</div>
            <div className="stat-label">Átlag</div>
          </div>
        </div>
      </div>
    );
  }

  const stats = data.stats as {
    quizzes_completed: number;
    total_attempts: number;
    avg_score: number;
    badges_earned: number;
  };

  const nextLevel = data.next_level_xp ?? ((data.level ?? 1) * 100);
  const xpPercent =
    nextLevel > 0 ? Math.min(100, Math.round(((data.xp ?? 0) / nextLevel) * 100)) : 0;
  const nextMission = (data.daily_missions ?? []).find((mission) => !mission.completed_at && mission.progress < mission.target)
    ?? (data.daily_missions ?? [])[0];

  return (
    <div className="overview-card student-overview">
      <div className="overview-progress">
        <div className="overview-copy">
          <span className="overview-icon" aria-hidden="true">🌱</span>
          <div>
            <div className="overview-title">{data.rank || `${data.level ?? 1}. szint`}</div>
            <div className="overview-subtitle">
              {nextLevel - (data.xp ?? 0) > 0 ? `${nextLevel - (data.xp ?? 0)} XP a következő szintig` : "A következő szint elérve"}
            </div>
          </div>
        </div>
        <div className="xp-bar" aria-label={`${xpPercent}% teljesítve`}>
          <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
        </div>
        <div className="progress-meta">
          <span>{data.xp ?? 0} / {nextLevel} XP</span>
          <span>🔥 {data.streak_days ?? 0} nap</span>
        </div>
      </div>

      {nextMission && (
        <div className="overview-mission">
          <span className="eyebrow">Mai cél</span>
          <div className="mission-title">{nextMission.title}</div>
          <div className="mission-desc">{nextMission.description}</div>
          <div className="mission-meta">
            {nextMission.progress}/{nextMission.target} kész · +{nextMission.xp_reward} XP
          </div>
        </div>
      )}

      <div className="overview-stats student-quick-stats" aria-label="Tanulási statisztikák">
        <div className="overview-stat">
          <div className="stat-number">{stats.quizzes_completed ?? 0}</div>
          <div className="stat-label">Kitöltött kvíz</div>
        </div>
        <div className="overview-stat">
          <div className="stat-number">{stats.avg_score ?? 0}%</div>
          <div className="stat-label">Átlag</div>
        </div>
      </div>
    </div>
  );
};
