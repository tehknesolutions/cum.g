-- Structural/public seed only. No user, Vault, assessment or intimate payload data.

INSERT INTO learning.programs (id, title, status)
VALUES ('CUMG-P01', 'Controle Ejaculatório', 'DRAFT')
ON CONFLICT (id) DO NOTHING;

INSERT INTO learning.modules (id, program_id, position, title)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'CUMG-P01', 1, 'Fundamentos e Autopercepção'),
  ('10000000-0000-4000-8000-000000000002', 'CUMG-P01', 2, 'Treino e Integração')
ON CONFLICT (id) DO NOTHING;

INSERT INTO learning.lessons (id, module_id, lesson_code, position, title, status)
VALUES
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'P01-L01', 1, 'Mapa Inicial e Fundamentos', 'DRAFT'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'P01-L02', 2, 'Excitação, Atenção e Autorregulação', 'DRAFT'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'P01-L03', 1, 'Prática Estruturada e Revisão', 'DRAFT')
ON CONFLICT (id) DO NOTHING;

INSERT INTO learning.exercises (id, lesson_id, exercise_type, title, public_config)
VALUES
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'SELF_OBSERVATION', 'Check-in de Autopercepção', '{"privateAnswers":"vault-only"}'::jsonb),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'GUIDED_PRACTICE', 'Prática de Atenção e Ritmo', '{"privateAnswers":"vault-only"}'::jsonb),
  ('30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000003', 'REVIEW', 'Revisão de Treino', '{"privateAnswers":"vault-only"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
