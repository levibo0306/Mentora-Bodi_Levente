import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import { computeLevel, computeRank, ensureDailyMissions, getCurrentStreak, getWeeklyGoal, recordLearningEvent } from "../services/gamification";

export const usersRouter = Router();

usersRouter.get("/me/overview", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  const role = req.user?.role;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    if (role === "teacher") {
      const r = await pool.query(
        `SELECT
           COUNT(DISTINCT q.id)::int as active_quizzes,
           COUNT(DISTINCT a.user_id)::int as total_students,
           COUNT(a.id)::int as total_attempts,
           COALESCE(ROUND(AVG(a.score))::int, 0) as avg_score
         FROM quizzes q
         LEFT JOIN attempts a ON a.quiz_id = q.id
         WHERE q.owner_id = $1`,
        [userId]
      );

      return res.json({
        role,
        stats: r.rows[0],
        badges: [],
        xp: 0,
        level: 0,
        rank: "Tanár",
        daily_missions: [],
      });
    }

    const statsRes = await pool.query(
      `SELECT
         COUNT(DISTINCT quiz_id)::int as quizzes_completed,
         COUNT(*)::int as total_attempts,
         COALESCE(ROUND(AVG(score))::int, 0) as avg_score,
         SUM(CASE WHEN score = 100 THEN 1 ELSE 0 END)::int as perfect_count
       FROM attempts
       WHERE user_id = $1`,
      [userId]
    );

    const stats = statsRes.rows[0] as {
      quizzes_completed: number;
      total_attempts: number;
      avg_score: number;
      perfect_count: number;
    };

    const learning = (await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE event_type='review_flashcard')::int AS card_reviews,
         COUNT(DISTINCT metadata->>'pack_id') FILTER (WHERE event_type='review_flashcard')::int AS packs_studied,
         COUNT(*) FILTER (WHERE event_type='view_topic')::int AS topics_opened,
         COUNT(*) FILTER (WHERE event_type='send_feedback')::int AS feedback_sent
       FROM learning_events WHERE user_id=$1`,
      [userId]
    )).rows[0] as { card_reviews: number; packs_studied: number; topics_opened: number; feedback_sent: number };

    const xpRes = await pool.query("select xp from users where id=$1", [userId]);
    const xp = xpRes.rows[0]?.xp ?? 0;
    const level = computeLevel(xp);
    const rank = computeRank(level);
    const nextLevelXp = level * 100;
    const tzOffset = Number(req.headers["x-timezone-offset"] ?? 0);
    const offset = Number.isFinite(tzOffset) ? tzOffset : 0;
    const daily = await ensureDailyMissions(userId, offset);
    const streak = await getCurrentStreak(userId);

    const badges = [
      {
        id: "first_quiz",
        icon: "🏆",
        name: "Első kvíz",
        requirement: "Tölts ki 1 kvízt",
        earned: stats.quizzes_completed >= 1,
      },
      {
        id: "perfect_score",
        icon: "🎯",
        name: "Hibátlan",
        requirement: "100% egy kvízben",
        earned: stats.perfect_count >= 1,
      },
      {
        id: "five_quizzes",
        icon: "🔥",
        name: "5 kvíz",
        requirement: "Tölts ki 5 kvízt",
        earned: stats.quizzes_completed >= 5,
      },
      {
        id: "ten_quizzes",
        icon: "⭐",
        name: "10 kvíz",
        requirement: "Tölts ki 10 kvízt",
        earned: stats.quizzes_completed >= 10,
      },
      {
        id: "first_review",
        icon: "🧠",
        name: "Első ismétlés",
        requirement: "Értékelj 1 tanulókártyát",
        earned: learning.card_reviews >= 1,
      },
      {
        id: "memory_25",
        icon: "🌱",
        name: "Memóriaedzés",
        requirement: "Ismételj át 25 kártyát",
        earned: learning.card_reviews >= 25,
      },
      {
        id: "memory_100",
        icon: "🧩",
        name: "Kártyamaraton",
        requirement: "Ismételj át 100 kártyát",
        earned: learning.card_reviews >= 100,
      },
      {
        id: "pack_explorer",
        icon: "🗂️",
        name: "Packfelfedező",
        requirement: "Gyakorolj 3 különböző packet",
        earned: learning.packs_studied >= 3,
      },
      {
        id: "topic_explorer",
        icon: "🧭",
        name: "Tématúrázó",
        requirement: "Nyiss meg 5 tanulási témát",
        earned: learning.topics_opened >= 5,
      },
      {
        id: "feedback_first",
        icon: "💬",
        name: "Kapcsolódó",
        requirement: "Küldj tanulási visszajelzést",
        earned: learning.feedback_sent >= 1,
      },
      {
        id: "streak_3_badge",
        icon: "🌤️",
        name: "Háromnapos ritmus",
        requirement: "Tanulj 3 napig egymás után",
        earned: streak >= 3,
      },
      {
        id: "streak_7_badge",
        icon: "⚡",
        name: "Heti sorozat",
        requirement: "Tanulj 7 napig egymás után",
        earned: streak >= 7,
      },
      {
        id: "xp_500",
        icon: "🚀",
        name: "Ötszázas klub",
        requirement: "Gyűjts össze 500 XP-t",
        earned: xp >= 500,
      },
    ];

    const badgesEarned = badges.filter((b) => b.earned).length;

    return res.json({
      role,
      stats: {
        quizzes_completed: stats.quizzes_completed,
        total_attempts: stats.total_attempts,
        avg_score: stats.avg_score,
        badges_earned: badgesEarned,
      },
      badges,
      xp,
      level,
      rank,
      next_level_xp: nextLevelXp,
      daily_missions: daily,
      streak_days: streak,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

usersRouter.get("/me/missions", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const limit = Number(req.query.limit ?? 14);
  const safeLimit = Number.isFinite(limit) ? Math.min(60, Math.max(1, limit)) : 14;

  try {
    const offset = Number(req.headers["x-timezone-offset"] ?? 0);
    await ensureDailyMissions(userId, Number.isFinite(offset) ? offset : 0);
    const r = await pool.query(
      `select *
       from daily_missions
       where user_id=$1
       order by date desc, created_at asc
       limit $2`,
      [userId, safeLimit]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

usersRouter.get("/me/weekly-goal", requireAuth, async (req: any, res) => {
  try {
    const offset = Number(req.headers["x-timezone-offset"] ?? 0);
    res.json(await getWeeklyGoal(req.user.sub, Number.isFinite(offset) ? offset : 0));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Nem sikerült betölteni a heti célt." });
  }
});

usersRouter.post("/me/activity", requireAuth, async (req: any, res) => {
  const body = z.object({
    type: z.enum(["app_open", "view_topic", "visit_profile", "visit_missions", "visit_flashcards", "complete_flashcard_session"]),
    amount: z.number().int().min(1).max(20).default(1),
    metadata: z.record(z.unknown()).optional(),
  }).parse(req.body);
  try {
    const offset = Number(req.headers["x-timezone-offset"] ?? 0);
    await recordLearningEvent(req.user.sub, body.type, body.amount, body.metadata ?? {}, Number.isFinite(offset) ? offset : 0);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Nem sikerült menteni az aktivitást." });
  }
});
