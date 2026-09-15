import "dotenv/config";
import { pool } from "./db";

const migration = `
CREATE TABLE IF NOT EXISTS flashcard_packs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS pack_id uuid REFERENCES flashcard_packs(id) ON DELETE CASCADE;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;

INSERT INTO flashcard_packs (owner_id, topic_id, title, description)
SELECT DISTINCT f.owner_id, f.topic_id, 'Korábbi kártyák', 'A migráció előtt létrehozott tanulókártyák.'
FROM flashcards f
WHERE f.pack_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM flashcard_packs p
    WHERE p.owner_id = f.owner_id AND p.topic_id IS NOT DISTINCT FROM f.topic_id AND p.title = 'Korábbi kártyák'
  );

UPDATE flashcards f
SET pack_id = p.id
FROM flashcard_packs p
WHERE f.pack_id IS NULL
  AND p.owner_id = f.owner_id
  AND p.topic_id IS NOT DISTINCT FROM f.topic_id
  AND p.title = 'Korábbi kártyák';

CREATE TABLE IF NOT EXISTS flashcard_reviews (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  pack_id uuid NOT NULL REFERENCES flashcard_packs(id) ON DELETE CASCADE,
  repetitions integer NOT NULL DEFAULT 0,
  interval_days integer NOT NULL DEFAULT 0,
  ease_factor numeric(4,2) NOT NULL DEFAULT 2.50,
  due_at timestamptz NOT NULL DEFAULT now(),
  last_quality integer,
  review_count integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, card_id)
);

CREATE TABLE IF NOT EXISTS flashcard_shares (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pack_id uuid NOT NULL REFERENCES flashcard_packs(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  recipient_id uuid REFERENCES users(id) ON DELETE CASCADE,
  shared_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedback_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id) ON DELETE SET NULL,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

ALTER TABLE feedback_messages ADD COLUMN IF NOT EXISTS quiz_id uuid REFERENCES quizzes(id) ON DELETE SET NULL;
ALTER TABLE feedback_messages ADD COLUMN IF NOT EXISTS flashcard_pack_id uuid REFERENCES flashcard_packs(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS weekly_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  target_quizzes integer NOT NULL DEFAULT 5,
  target_flashcards integer NOT NULL DEFAULT 30,
  target_active_days integer NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

CREATE TABLE IF NOT EXISTS learning_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  amount integer NOT NULL DEFAULT 1,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_question_profiles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  attempts integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  mastery_score numeric(5,4) NOT NULL DEFAULT 0,
  last_answer_correct boolean,
  last_answered_at timestamptz,
  PRIMARY KEY (user_id, question_id)
);

ALTER TABLE daily_missions ADD COLUMN IF NOT EXISTS requirements jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_flashcard_packs_topic ON flashcard_packs(topic_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_pack ON flashcard_reviews(pack_id, user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_shares_recipient ON flashcard_shares(recipient_id, pack_id);
CREATE INDEX IF NOT EXISTS idx_feedback_pair ON feedback_messages(teacher_id, student_id, created_at);
CREATE INDEX IF NOT EXISTS idx_learning_events_user_date ON learning_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_student_question_profiles_user ON student_question_profiles(user_id, mastery_score, last_answered_at);
`;

async function migrate() {
  await pool.query(migration);
  console.log("Adatbazis-migracio kesz.");
}

migrate()
  .catch((error) => {
    console.error("A migracio sikertelen:", error);
    process.exitCode = 1;
  })
  .finally(async () => pool.end());
