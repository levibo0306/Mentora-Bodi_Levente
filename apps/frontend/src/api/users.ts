import { api } from "./http";

export type UserOverview = {
  role: "teacher" | "student";
  stats: Record<string, number>;
  badges: Array<{
    id: string;
    icon: string;
    name: string;
    requirement: string;
    earned: boolean;
  }>;
  xp: number;
  level: number;
  rank: string;
  next_level_xp?: number;
  daily_missions?: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    target: number;
    threshold?: number | null;
    difficulty: "easy" | "medium" | "hard";
    xp_reward: number;
    progress: number;
    completed_at?: string | null;
  }>;
  streak_days?: number;
};

export async function getUserOverview() {
  return api<UserOverview>("/api/users/me/overview");
}

export async function getUserMissions(limit = 14) {
  return api<UserOverview["daily_missions"]>(`/api/users/me/missions?limit=${limit}`);
}

export type WeeklyGoal = {
  week_start: string;
  target_quizzes: number;
  target_flashcards: number;
  target_active_days: number;
  progress: { quizzes: number; flashcards: number; active_days: number };
};

export const getWeeklyGoal = () => api<WeeklyGoal>("/api/users/me/weekly-goal");
export const trackActivity = (type: "app_open" | "view_topic" | "visit_profile" | "visit_missions" | "visit_flashcards" | "complete_flashcard_session", metadata?: Record<string, unknown>) =>
  api<{ ok: true }>("/api/users/me/activity", { method: "POST", body: JSON.stringify({ type, amount: 1, metadata }) });
