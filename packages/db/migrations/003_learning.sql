CREATE SCHEMA IF NOT EXISTS learning;

CREATE TABLE learning.programs (
  id text PRIMARY KEY,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT'
);

CREATE TABLE learning.modules (
  id uuid PRIMARY KEY,
  program_id text NOT NULL REFERENCES learning.programs(id) ON DELETE CASCADE,
  position int NOT NULL CHECK (position > 0),
  title text NOT NULL,
  UNIQUE (program_id, position)
);

CREATE TABLE learning.lessons (
  id uuid PRIMARY KEY,
  module_id uuid NOT NULL REFERENCES learning.modules(id) ON DELETE CASCADE,
  lesson_code text NOT NULL UNIQUE,
  position int NOT NULL CHECK (position > 0),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  UNIQUE (module_id, position)
);

CREATE TABLE learning.lesson_claims (
  lesson_id uuid NOT NULL REFERENCES learning.lessons(id) ON DELETE CASCADE,
  claim_id uuid NOT NULL REFERENCES knowledge.claims(id) ON DELETE RESTRICT,
  PRIMARY KEY (lesson_id, claim_id)
);

CREATE TABLE learning.exercises (
  id uuid PRIMARY KEY,
  lesson_id uuid NOT NULL REFERENCES learning.lessons(id) ON DELETE CASCADE,
  exercise_type text NOT NULL,
  title text NOT NULL,
  public_config jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE learning.progress (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES learning.lessons(id) ON DELETE CASCADE,
  state text NOT NULL,
  completed_at timestamptz NULL,
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX modules_program_idx ON learning.modules(program_id);
CREATE INDEX lessons_module_idx ON learning.lessons(module_id);
CREATE INDEX exercises_lesson_idx ON learning.exercises(lesson_id);
CREATE INDEX progress_user_idx ON learning.progress(user_id);

COMMENT ON TABLE learning.progress IS 'Minimal learning state only. Intimate assessment answers and private training state belong exclusively to vault.';
COMMENT ON COLUMN learning.exercises.public_config IS 'Public exercise definition; never user-specific intimate responses.';
