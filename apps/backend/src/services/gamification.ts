import { pool } from "../db";

export type MissionType =
  | "complete_quizzes"
  | "score_at_least"
  | "streak_days"
  | "review_flashcard"
  | "view_topic"
  | "app_open"
  | "create_flashcard_pack"
  | "import_quiz_cards"
  | "send_feedback"
  | "visit_profile"
  | "visit_missions"
  | "visit_flashcards"
  | "complete_flashcard_session";

type MissionRequirement = {
  event: MissionType;
  amount: number;
  minScore?: number;
  minQuality?: number;
  maxQuality?: number;
};

type MissionTemplate = {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  target: number;
  threshold?: number;
  difficulty: "easy" | "medium" | "hard";
  xp_reward: number;
  requirements: MissionRequirement[];
};

const actions: Array<{ title: string; text: string; requirement: MissionRequirement }> = [
  { title: "Visszatérő", text: "Térj vissza kétszer az alkalmazásba", requirement: { event: "app_open", amount: 2 } },
  { title: "Kíváncsi", text: "Nyiss meg egy tanulási témát", requirement: { event: "view_topic", amount: 1 } },
  { title: "Tématúra", text: "Nézz meg három tanulási témát", requirement: { event: "view_topic", amount: 3 } },
  { title: "Gyors ismétlés", text: "Értékelj három tanulókártyát", requirement: { event: "review_flashcard", amount: 3 } },
  { title: "Memóriaedzés", text: "Értékelj tíz tanulókártyát", requirement: { event: "review_flashcard", amount: 10 } },
  { title: "Őszinte válasz", text: "Jelölj egy kártyát nehéznek", requirement: { event: "review_flashcard", amount: 1, maxQuality: 3 } },
  { title: "Biztos tudás", text: "Jelölj egy kártyát könnyűnek", requirement: { event: "review_flashcard", amount: 1, minQuality: 5 } },
  { title: "Kártyarendező", text: "Készíts egy új Flashcards csomagot", requirement: { event: "create_flashcard_pack", amount: 1 } },
  { title: "Átalakító", text: "Alakíts át egy kvízt Flashcards csomaggá", requirement: { event: "import_quiz_cards", amount: 1 } },
  { title: "Kvízrajt", text: "Tölts ki egy kvízt", requirement: { event: "complete_quizzes", amount: 1 } },
  { title: "Dupla kör", text: "Tölts ki két kvízt", requirement: { event: "complete_quizzes", amount: 2 } },
  { title: "Jó alap", text: "Érj el legalább 70%-ot egy kvízben", requirement: { event: "score_at_least", amount: 1, minScore: 70 } },
  { title: "Pontos munka", text: "Érj el legalább 90%-ot egy kvízben", requirement: { event: "score_at_least", amount: 1, minScore: 90 } },
  { title: "Hibátlan", text: "Érj el 100%-ot egy kvízben", requirement: { event: "score_at_least", amount: 1, minScore: 100 } },
  { title: "Kapcsolódás", text: "Küldj egy tanulási visszajelzést", requirement: { event: "send_feedback", amount: 1 } },
  { title: "Párbeszéd", text: "Küldj két tanulási visszajelzést", requirement: { event: "send_feedback", amount: 2 } },
  { title: "Önellenőrzés", text: "Nézd meg a profilodat", requirement: { event: "visit_profile", amount: 1 } },
  { title: "Napi terv", text: "Ellenőrizd a küldetéseidet", requirement: { event: "visit_missions", amount: 1 } },
  { title: "Kártyapolc", text: "Nyisd meg a kártyakönyvtárat", requirement: { event: "visit_flashcards", amount: 1 } },
  { title: "Teljes kör", text: "Fejezz be egy teljes kártyakört", requirement: { event: "complete_flashcard_session", amount: 1 } },
];
const generatedMissions: MissionTemplate[] = actions.map((action, index) => {
  const difficulty = index < 8 ? "easy" : index < 15 ? "medium" : "hard";
  return {
    id: `quest_v3_${index}`,
    title: action.title,
    description: action.text,
    type: action.requirement.event,
    target: action.requirement.amount,
    difficulty,
    xp_reward: difficulty === "easy" ? 25 : difficulty === "medium" ? 45 : 70,
    requirements: [action.requirement],
  };
});

export function computeLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}

export function computeRank(level: number) {
  if (level >= 11) return "Legenda";
  if (level >= 9) return "Mester";
  if (level >= 7) return "Haladó";
  if (level >= 5) return "Felfedező";
  if (level >= 3) return "Tanuló";
  return "Újonc";
}

function todayKey(offsetMinutes = 0) {
  const adjusted = new Date(Date.now() - offsetMinutes * 60 * 1000);
  return adjusted.toISOString().slice(0, 10);
}

function yesterdayKey(offsetMinutes = 0) {
  const adjusted = new Date(Date.now() - offsetMinutes * 60 * 1000);
  adjusted.setUTCDate(adjusted.getUTCDate() - 1);
  return adjusted.toISOString().slice(0, 10);
}

async function getUserXp(userId: string) {
  const r = await pool.query("select xp from users where id=$1", [userId]);
  return (r.rows[0]?.xp ?? 0) as number;
}

export async function addXp(userId: string, amount: number) {
  const r = await pool.query(
    "update users set xp = xp + $1 where id=$2 returning xp",
    [amount, userId]
  );
  const xp = r.rows[0]?.xp ?? 0;
  const level = computeLevel(xp);
  await pool.query("update users set level=$1 where id=$2", [level, userId]);
  return { xp, level };
}

function pickRandomMissions(_level: number, count: number, excludedIds: string[] = []) {
  const pool = generatedMissions;
  const picks: MissionTemplate[] = [];
  const used = new Set<string>(excludedIds);
  while (picks.length < Math.min(count, pool.length)) {
    const m = pool[Math.floor(Math.random() * pool.length)];
    if (used.has(m.id)) continue;
    used.add(m.id);
    picks.push(m);
  }
  return picks;
}

export async function ensureDailyMissions(userId: string, offsetMinutes = 0) {
  const date = todayKey(offsetMinutes);
  let existing = await pool.query(
    "select * from daily_missions where user_id=$1 and date=$2 order by created_at asc",
    [userId, date]
  );
  const ids = existing.rows.map((mission) => String(mission.mission_id));
  const hasDuplicates = new Set(ids).size !== ids.length;
  const hasOldVersion = existing.rows.some((mission) => !String(mission.mission_id).startsWith("quest_v3_"));

  if (hasOldVersion || hasDuplicates) {
    if (hasOldVersion) {
      await pool.query(
        "DELETE FROM daily_missions WHERE user_id=$1 AND date=$2 AND mission_id NOT LIKE 'quest_v3_%'",
        [userId, date]
      );
    } else {
      await pool.query(
        `DELETE FROM daily_missions WHERE id IN (
           SELECT id FROM (
             SELECT id,ROW_NUMBER() OVER (PARTITION BY mission_id ORDER BY created_at) AS duplicate_number
             FROM daily_missions WHERE user_id=$1 AND date=$2
           ) duplicates WHERE duplicate_number>1
         )`,
        [userId, date]
      );
    }
    existing = await pool.query(
      "select * from daily_missions where user_id=$1 and date=$2 order by created_at asc",
      [userId, date]
    );
  }
  if ((existing.rowCount ?? 0) > 3) {
    await pool.query(
      `DELETE FROM daily_missions WHERE id IN (
         SELECT id FROM daily_missions WHERE user_id=$1 AND date=$2
         ORDER BY created_at ASC,id ASC OFFSET 3
       )`,
      [userId, date]
    );
    existing = await pool.query(
      "select * from daily_missions where user_id=$1 and date=$2 order by created_at asc,id asc",
      [userId, date]
    );
  }
  if ((existing.rowCount ?? 0) >= 3) return existing.rows.slice(0, 3);

  const xp = await getUserXp(userId);
  const level = computeLevel(xp);
  const picks = pickRandomMissions(level, 3 - (existing.rowCount ?? 0), existing.rows.map((mission) => mission.mission_id));

  for (const m of picks) {
    await pool.query(
      `insert into daily_missions
       (user_id, date, mission_id, title, description, type, target, threshold, difficulty, xp_reward, progress, requirements)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        userId,
        date,
        m.id,
        m.title,
        m.description,
        m.type,
        m.target,
        m.threshold ?? null,
        m.difficulty,
        m.xp_reward,
        0,
        JSON.stringify(m.requirements),
      ]
    );
  }

  await pool.query(
    `DELETE FROM daily_missions WHERE id IN (
       SELECT id FROM daily_missions WHERE user_id=$1 AND date=$2
       ORDER BY created_at ASC,id ASC OFFSET 3
     )`,
    [userId, date]
  );

  const r = await pool.query(
    "select * from daily_missions where user_id=$1 and date=$2 order by created_at asc,id asc limit 3",
    [userId, date]
  );
  return r.rows;
}

export async function updateStreakOnAttempt(userId: string, offsetMinutes = 0) {
  const date = todayKey(offsetMinutes);
  const prevDate = yesterdayKey(offsetMinutes);
  const r = await pool.query(
    "select * from user_streaks where user_id=$1",
    [userId]
  );
  if (!r.rowCount || r.rowCount === 0) {
    await pool.query(
      "insert into user_streaks(user_id, current_streak, last_active_date) values($1,$2,$3)",
      [userId, 1, date]
    );
    return 1;
  }

  const row = r.rows[0];
  if (row.last_active_date === date) {
    return row.current_streak ?? 1;
  }

  const nextStreak = row.last_active_date === prevDate ? (row.current_streak ?? 0) + 1 : 1;
  await pool.query(
    "update user_streaks set current_streak=$1, last_active_date=$2 where user_id=$3",
    [nextStreak, date, userId]
  );
  return nextStreak;
}

export async function getCurrentStreak(userId: string) {
  const r = await pool.query("select current_streak from user_streaks where user_id=$1", [userId]);
  return r.rows[0]?.current_streak ?? 0;
}

export async function recordLearningEvent(
  userId: string,
  eventType: MissionType,
  amount = 1,
  metadata: Record<string, unknown> = {},
  offsetMinutes = 0
) {
  await pool.query(
    "INSERT INTO learning_events(user_id,event_type,amount,metadata) VALUES($1,$2,$3,$4)",
    [userId, eventType, amount, JSON.stringify(metadata)]
  );
  const missions = await ensureDailyMissions(userId, offsetMinutes);
  const date = todayKey(offsetMinutes);
  const eventRows = (await pool.query(
    "SELECT event_type,amount,metadata FROM learning_events WHERE user_id=$1 AND created_at >= $2::date",
    [userId, date]
  )).rows as Array<{ event_type: MissionType; amount: number; metadata: Record<string, unknown> }>;
  for (const mission of missions) {
    if (mission.completed_at) continue;
    const requirements = (mission.requirements ?? []) as MissionRequirement[];
    const requirement = requirements[0];
    if (!requirement) continue;
    const matchingAmount = eventRows
        .filter((entry) => entry.event_type === requirement.event)
        .filter((entry) => requirement.minScore === undefined || Number(entry.metadata?.score ?? 0) >= requirement.minScore)
        .filter((entry) => requirement.minQuality === undefined || Number(entry.metadata?.quality ?? 0) >= requirement.minQuality)
        .filter((entry) => requirement.maxQuality === undefined || Number(entry.metadata?.quality ?? 0) <= requirement.maxQuality)
        .reduce((sum, entry) => sum + Number(entry.amount), 0);
    const progress = Math.min(Number(mission.target), matchingAmount);
    if (progress === Number(mission.progress ?? 0)) continue;
    const completed = progress >= Number(mission.target);
    if (completed) {
      const awarded = await pool.query(
        "UPDATE daily_missions SET progress=$1,completed_at=now() WHERE id=$2 AND completed_at IS NULL RETURNING id",
        [progress, mission.id]
      );
      if (awarded.rowCount) await addXp(userId, Number(mission.xp_reward ?? 0));
    } else {
      await pool.query(
        "UPDATE daily_missions SET progress=$1 WHERE id=$2 AND completed_at IS NULL",
        [progress, mission.id]
      );
    }
  }
}

function weekStartKey(offsetMinutes = 0) {
  const date = new Date(Date.now() - offsetMinutes * 60 * 1000);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

export async function getWeeklyGoal(userId: string, offsetMinutes = 0) {
  const weekStart = weekStartKey(offsetMinutes);
  await pool.query(
    `INSERT INTO weekly_goals(user_id,week_start,target_quizzes,target_flashcards,target_active_days)
     VALUES($1,$2,5,30,3) ON CONFLICT(user_id,week_start) DO NOTHING`,
    [userId, weekStart]
  );
  const goal = (await pool.query(
    "SELECT * FROM weekly_goals WHERE user_id=$1 AND week_start=$2", [userId, weekStart]
  )).rows[0];
  const progress = (await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM attempts WHERE user_id=$1 AND created_at >= $2::date) AS quizzes,
       (SELECT COALESCE(SUM(amount),0)::int FROM learning_events WHERE user_id=$1 AND event_type='review_flashcard' AND created_at >= $2::date) AS flashcards,
       (SELECT COUNT(DISTINCT day)::int FROM (
          SELECT created_at::date AS day FROM attempts WHERE user_id=$1 AND created_at >= $2::date
          UNION SELECT created_at::date AS day FROM learning_events WHERE user_id=$1 AND created_at >= $2::date
        ) active) AS active_days`,
    [userId, weekStart]
  )).rows[0];
  return { ...goal, progress };
}

export async function updateDailyMissionsOnAttempt(
  userId: string,
  scorePercent: number,
  offsetMinutes = 0
) {
  const streak = await updateStreakOnAttempt(userId, offsetMinutes);
  await recordLearningEvent(userId, "complete_quizzes", 1, {}, offsetMinutes);
  await recordLearningEvent(userId, "score_at_least", 1, { score: scorePercent }, offsetMinutes);
  void streak;
}
