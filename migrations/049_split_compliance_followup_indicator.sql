-- Feedback do cliente (2026-07-22): o indicador "Se sim, 1. tem periodicidade
-- definida? 2. Os dados são exportáveis? 3. Há uma clara documentação da utilização
-- desses dados para a melhoria do serviço?" combinava 3 perguntas distintas do
-- questionário de conformidade numa lógica "E" (só "Sim" se as 3 fossem "Sim"),
-- perdendo qual das 3 falhou. Confirmado nos ficheiros de origem que as respostas
-- podem divergir por pergunta (ex.: ISS tem serviços com periodicidade=Sim,
-- exportáveis=Sim, documentação=Não — tratados até agora como um único "Não").
--
-- Fontes usadas para os valores reais:
--   - ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx
--   - LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx
--
-- Serviços sem fonte de 3 colunas rastreável para esta pergunta (AT, restantes
-- serviços da ARTE/CML/ISS) ficam com o valor existente no indicador #1 inalterado
-- e sem dados nos indicadores #2/#3 — não há base para os inventar.

-- 1. Catálogo: reaproveita o indicador existente como #1 (periodicidade) e cria #2/#3.
UPDATE public.indicators
SET description = 'Se sim, tem periodicidade definida?'
WHERE id = '0e8c5ac1-9e2e-48de-852f-92a5636a1549';

INSERT INTO public.indicators (id, description, thematic_priority_id, type_of_indicator, channel_scope, value_type, parent_indicator_id, is_multi_channel, is_mandatory, escala_descricao)
VALUES
  ('8a41e5bd-f0a5-4385-b7fd-83feac1725e9'::uuid, 'Se sim, os dados são exportáveis?', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'compliance', 'Todos os canais', 'categorical_sim_nao', '0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid, false, true, 'Categórico: 1=Sim, 2=Não'),
  ('f8d3ea72-342d-41f0-a6a1-84549b0a736c'::uuid, 'Se sim, existe uma clara documentação da utilização desses dados para a melhoria do serviço?', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'compliance', 'Todos os canais', 'categorical_sim_nao', '0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid, false, true, 'Categórico: 1=Sim, 2=Não');

-- 2. ARTE (org_ec) — 5 serviços da Chave Móvel Digital + morada: periodicidade e
--    documentação reais, ambas "Não"; exportáveis não foi respondido na fonte.
DELETE FROM org_ec.measurements
WHERE indicator_id = '0e8c5ac1-9e2e-48de-852f-92a5636a1549'
  AND source_file = 'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx';

INSERT INTO org_ec.measurements (service_id, indicator_id, year, month, value, category_counts, source_file)
VALUES
  ('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid, 2026, 7, 0, '{"Sim":0,"Não":1}', 'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx'),
  ('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid, 2026, 7, 0, '{"Sim":0,"Não":1}', 'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx'),
  ('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid, 2026, 7, 0, '{"Sim":0,"Não":1}', 'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx'),
  ('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, '0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid, 2026, 7, 0, '{"Sim":0,"Não":1}', 'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx'),
  ('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid, 2026, 7, 0, '{"Sim":0,"Não":1}', 'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx'),
  ('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, 'f8d3ea72-342d-41f0-a6a1-84549b0a736c'::uuid, 2026, 7, 0, '{"Sim":0,"Não":1}', 'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx'),
  ('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, 'f8d3ea72-342d-41f0-a6a1-84549b0a736c'::uuid, 2026, 7, 0, '{"Sim":0,"Não":1}', 'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx'),
  ('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, 'f8d3ea72-342d-41f0-a6a1-84549b0a736c'::uuid, 2026, 7, 0, '{"Sim":0,"Não":1}', 'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx'),
  ('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, 'f8d3ea72-342d-41f0-a6a1-84549b0a736c'::uuid, 2026, 7, 0, '{"Sim":0,"Não":1}', 'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx'),
  ('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, 'f8d3ea72-342d-41f0-a6a1-84549b0a736c'::uuid, 2026, 7, 0, '{"Sim":0,"Não":1}', 'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx');

-- 3. CML (org_cml) — 2 serviços cuja fonte real mostra que a pergunta-mãe foi "Não"
--    (logo estas perguntas de seguimento não se aplicam); remove os valores
--    fictícios que lá estavam (dummy_compliance_cml_2026), sem os substituir.
DELETE FROM org_cml.measurements
WHERE indicator_id = '0e8c5ac1-9e2e-48de-852f-92a5636a1549'
  AND service_id IN ('fd42da38-0851-46d4-8afc-4c96cabbf7cb', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5');

-- 4. ISS (org_iss) — 4 serviços reais; 3 deles têm respostas DIFERENTES por
--    pergunta (o problema exato reportado pelo cliente).
DELETE FROM org_iss.measurements
WHERE indicator_id = '0e8c5ac1-9e2e-48de-852f-92a5636a1549'
  AND source_file = 'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx';

INSERT INTO org_iss.measurements (service_id, indicator_id, year, month, value, category_counts, source_file)
VALUES
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid, 2026, NULL, 100.0, '{"Sim":1,"Não":0}', 'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '8a41e5bd-f0a5-4385-b7fd-83feac1725e9'::uuid, 2026, NULL, 100.0, '{"Sim":1,"Não":0}', 'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, 'f8d3ea72-342d-41f0-a6a1-84549b0a736c'::uuid, 2026, NULL, 100.0, '{"Sim":1,"Não":0}', 'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid, 2026, NULL, 100.0, '{"Sim":1,"Não":0}', 'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '8a41e5bd-f0a5-4385-b7fd-83feac1725e9'::uuid, 2026, NULL, 100.0, '{"Sim":1,"Não":0}', 'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, 'f8d3ea72-342d-41f0-a6a1-84549b0a736c'::uuid, 2026, NULL, 0.0, '{"Sim":0,"Não":1}', 'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid, 2026, NULL, 100.0, '{"Sim":1,"Não":0}', 'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '8a41e5bd-f0a5-4385-b7fd-83feac1725e9'::uuid, 2026, NULL, 100.0, '{"Sim":1,"Não":0}', 'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, 'f8d3ea72-342d-41f0-a6a1-84549b0a736c'::uuid, 2026, NULL, 0.0, '{"Sim":0,"Não":1}', 'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid, 2026, NULL, 100.0, '{"Sim":1,"Não":0}', 'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '8a41e5bd-f0a5-4385-b7fd-83feac1725e9'::uuid, 2026, NULL, 100.0, '{"Sim":1,"Não":0}', 'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, 'f8d3ea72-342d-41f0-a6a1-84549b0a736c'::uuid, 2026, NULL, 0.0, '{"Sim":0,"Não":1}', 'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx');
