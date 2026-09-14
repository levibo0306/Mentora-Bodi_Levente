import { useEffect, useMemo, useState } from "react";
import { getUserMissions, getWeeklyGoal, WeeklyGoal } from "../api/users";
import { PageLayout } from "../ui/PageLayout";

type Mission = NonNullable<ReturnType<typeof getUserMissions> extends Promise<infer U> ? U : any>[number];

export const Missions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);
  const [weekly, setWeekly] = useState<WeeklyGoal | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [data, weeklyData] = await Promise.all([getUserMissions(3), getWeeklyGoal()]);
        setMissions(data ?? []);
        setWeekly(weeklyData);
      } catch (err) {
        console.error("Nem sikerült betölteni a küldetéseket", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, Mission[]>();
    for (const m of missions) {
      const key = String(m.date ?? "");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries());
  }, [missions]);

  return (
    <PageLayout
      title="Küldetések"
      subtitle="Napi küldetések és az elmúlt időszakban elért eredményeid."
    >

        {weekly && (
          <section className="weekly-goal card">
            <div className="weekly-goal-heading"><div><span className="eyebrow">E heti iránytű</span><h2>Haladj háromféleképpen</h2></div><span>{new Date(weekly.week_start).toLocaleDateString("hu-HU")} óta</span></div>
            <div className="weekly-goal-grid">
              {[
                ["Kvízek", weekly.progress.quizzes, weekly.target_quizzes],
                ["Átnézett kártyák", weekly.progress.flashcards, weekly.target_flashcards],
                ["Aktív napok", weekly.progress.active_days, weekly.target_active_days],
              ].map(([label, value, target]) => {
                const current = Number(value); const maximum = Number(target);
                return <div className="weekly-goal-item" key={String(label)}><div><strong>{label}</strong><span>{current} / {maximum}</span></div><div className="mission-bar"><div className="mission-bar-fill" style={{ width: `${Math.min(100, current / maximum * 100)}%` }} /></div></div>;
              })}
            </div>
          </section>
        )}

        {loading && <div className="loading">Betöltés...</div>}

        {!loading && grouped.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎯</div>
            <p>Még nincs küldetésed.</p>
          </div>
        )}

        {!loading && grouped.length > 0 && (
          <div className="mission-history">
            {grouped.map(([date, items]) => (
              <div key={date} className="mission-day">
                <div className="mission-day-title">
                  {new Date(date).toLocaleDateString("hu-HU")}
                </div>
                <div className="mission-grid">
                  {items.map((m) => {
                    const progress = Math.min(100, Math.round((m.progress / m.target) * 100));
                    const done = !!m.completed_at || m.progress >= m.target;
                    return (
                      <div key={m.id} className={`mission-card ${done ? "completed" : ""}`}>
                        <div className="mission-title">{m.title}</div>
                        <div className="mission-desc">{m.description}</div>
                        <div className="mission-progress">
                          <div className="mission-bar">
                            <div className="mission-bar-fill" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="mission-meta">
                            {m.progress}/{m.target} · +{m.xp_reward} XP
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
    </PageLayout>
  );
};
