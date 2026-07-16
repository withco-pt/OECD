-- Dados fictícios (dummy) de análise por canal para a AT, pedidos explicitamente
-- pelo cliente para poderem testar a experiência completa de "Ver por Canal"
-- (ver/comparar desempenho por canal, por serviço e por dimensão da Matriz)
-- enquanto os dados reais segmentados por canal não existem para a maioria dos
-- indicadores (só a pergunta "ux_channel_ease" tinha essa segmentação real).
--
-- Âmbito: os 31 indicadores obrigatórios (9 dimensões) que ainda não tinham
-- nenhuma medição por canal para a AT, x os 14 serviços da AT x os 7 canais
-- usados pela AT (App, Chatbox, Digital/Online, Outro, Presencial, Telefone,
-- Videochamada). Período único: 2026-06 (mesmo "presente" do resto dos dados).
-- Ficam marcados como is_provisional=true e source_file='dummy_channel_at_2026'
-- para serem facilmente identificados/substituídos quando houver dados reais.

-- ── 1. Categóricos Sim/Não (12 indicadores) ──────────────────────────
INSERT INTO org_at.measurements
  (service_id, indicator_id, year, month, channel, geo_level, geo_name, value, category_counts, total_respondentes, total_inquiridos, is_provisional, source_file)
SELECT service_id, indicator_id, 2026, 6, channel, NULL, NULL,
       round(100.0 * sim / (sim + nao), 1),
       jsonb_build_object('Sim', sim, 'Não', nao),
       sim + nao, sim + nao,
       true, 'dummy_channel_at_2026'
FROM (
  SELECT s.id AS service_id, i.id AS indicator_id, c.channel,
    (5 + (abs(hashtext(s.id::text || c.channel || i.id::text || 'sim')) % 40))::int AS sim,
    (2 + (abs(hashtext(s.id::text || c.channel || i.id::text || 'nao')) % 15))::int AS nao
  FROM org_at.services s
  CROSS JOIN (VALUES ('App'),('Chatbox'),('Digital/Online'),('Outro'),('Presencial'),('Telefone'),('Videochamada')) AS c(channel)
  CROSS JOIN (VALUES
    ('37732d56-b185-47ca-a827-71a327d524cd'::uuid),
    ('88467533-a43c-4e47-8293-62320cf47b2d'::uuid),
    ('4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid),
    ('0eb55c0c-ee11-45ed-9274-8c6815b716bd'::uuid),
    ('197f10a6-35b0-4e21-a317-6d423c9c411b'::uuid),
    ('a561671e-06dd-4362-b34e-0238999a9889'::uuid),
    ('79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid),
    ('f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid),
    ('4850d9fb-1934-4759-b084-27523d453856'::uuid),
    ('0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid),
    ('0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid),
    ('d8debeb6-4b50-404c-9109-a316ee2307c6'::uuid)
  ) AS i(id)
) sub;

-- ── 2. Likert 1-5 (16 indicadores, exclui "ux_channel_ease" que já tem dados reais) ──
INSERT INTO org_at.measurements
  (service_id, indicator_id, year, month, channel, geo_level, geo_name, value, category_counts, total_respondentes, total_inquiridos, is_provisional, source_file)
SELECT service_id, indicator_id, 2026, 6, channel, NULL, NULL,
       val, NULL, resp, inq,
       true, 'dummy_channel_at_2026'
FROM (
  SELECT s.id AS service_id, i.id AS indicator_id, c.channel,
    round((1.5 + (abs(hashtext(s.id::text || c.channel || i.id::text || 'val')) % 350) / 100.0)::numeric, 2) AS val,
    (5 + (abs(hashtext(s.id::text || c.channel || i.id::text || 'resp')) % 45))::int AS resp,
    (5 + (abs(hashtext(s.id::text || c.channel || i.id::text || 'resp')) % 45) + (abs(hashtext(s.id::text || c.channel || i.id::text || 'inq')) % 20))::int AS inq
  FROM org_at.services s
  CROSS JOIN (VALUES ('App'),('Chatbox'),('Digital/Online'),('Outro'),('Presencial'),('Telefone'),('Videochamada')) AS c(channel)
  CROSS JOIN (VALUES
    ('0e2341fa-ea68-4453-bebd-fe5af7be7c12'::uuid),
    ('09ee5ed8-31be-4702-83b6-40066c2ffce9'::uuid),
    ('06cf8e9f-b6aa-40b5-a93d-c05e07b7d19c'::uuid),
    ('718ce242-06f2-4e05-93f1-ff5f04811588'::uuid),
    ('dd3ccc77-c31c-40da-a5ed-6dc9502833ca'::uuid),
    ('30dc4f36-b42d-49c4-9a11-9ba032053b31'::uuid),
    ('e9361303-b1f4-4294-a310-a7fcb6918d8c'::uuid),
    ('bea96625-f206-4385-9289-e0826500389b'::uuid),
    ('51d04d58-a82e-4f20-aec1-8a06fbe13d5f'::uuid),
    ('ca65798d-6236-414d-b183-df0a4eb995d3'::uuid),
    ('19147bb2-6858-470e-98f0-d9d44520b7be'::uuid),
    ('09750617-3c71-4e71-897d-f4630a90c106'::uuid),
    ('777c4c1c-b104-42f6-8a13-f605d0b390df'::uuid),
    ('32545583-6689-4eca-ac16-863ae8ca4517'::uuid),
    ('9593bb15-4fd3-4a92-9f39-a540321aa3c7'::uuid),
    ('f21b4261-433b-4357-b4fd-3b4a4aee1014'::uuid)
  ) AS i(id)
) sub(service_id, indicator_id, channel, val, resp, inq);

-- ── 3. Escala 1-10 (CSAT, 1 indicador) ───────────────────────────────
INSERT INTO org_at.measurements
  (service_id, indicator_id, year, month, channel, geo_level, geo_name, value, category_counts, total_respondentes, total_inquiridos, is_provisional, source_file)
SELECT s.id, 'c9d3c07b-af78-48ec-bda2-5cba78b73d65'::uuid, 2026, 6, c.channel, NULL, NULL,
    round((4.0 + (abs(hashtext(s.id::text || c.channel || 'val')) % 550) / 100.0)::numeric, 2),
    NULL,
    (5 + (abs(hashtext(s.id::text || c.channel || 'resp')) % 45))::int,
    (5 + (abs(hashtext(s.id::text || c.channel || 'resp')) % 45) + (abs(hashtext(s.id::text || c.channel || 'inq')) % 20))::int,
    true, 'dummy_channel_at_2026'
FROM org_at.services s
CROSS JOIN (VALUES ('App'),('Chatbox'),('Digital/Online'),('Outro'),('Presencial'),('Telefone'),('Videochamada')) AS c(channel);

-- ── 4. NPS (1 indicador) ──────────────────────────────────────────────
INSERT INTO org_at.measurements
  (service_id, indicator_id, year, month, channel, geo_level, geo_name, value, category_counts, total_respondentes, total_inquiridos, is_provisional, source_file)
SELECT service_id, '394ee8df-939a-40e4-ad90-243859da641a'::uuid, 2026, 6, channel, NULL, NULL,
       round(100.0 * (promotores - detratores) / (promotores + passivos + detratores), 1),
       jsonb_build_object('Promotores', promotores, 'Passivos', passivos, 'Detratores', detratores),
       promotores + passivos + detratores, promotores + passivos + detratores,
       true, 'dummy_channel_at_2026'
FROM (
  SELECT s.id AS service_id, c.channel,
    (3 + (abs(hashtext(s.id::text || c.channel || 'promo')) % 25))::int AS promotores,
    (2 + (abs(hashtext(s.id::text || c.channel || 'passivo')) % 12))::int AS passivos,
    (1 + (abs(hashtext(s.id::text || c.channel || 'detrator')) % 10))::int AS detratores
  FROM org_at.services s
  CROSS JOIN (VALUES ('App'),('Chatbox'),('Digital/Online'),('Outro'),('Presencial'),('Telefone'),('Videochamada')) AS c(channel)
) sub;

-- ── 5. Categórico Agendamento (1 indicador) ──────────────────────────
INSERT INTO org_at.measurements
  (service_id, indicator_id, year, month, channel, geo_level, geo_name, value, category_counts, total_respondentes, total_inquiridos, is_provisional, source_file)
SELECT service_id, '638f6811-4ef5-4097-ba78-21bdad14866b'::uuid, 2026, 6, channel, NULL, NULL,
       NULL,
       jsonb_build_object('Sim', sim, 'Não', nao, 'Não, mas tentei', tentei),
       sim + nao + tentei, sim + nao + tentei,
       true, 'dummy_channel_at_2026'
FROM (
  SELECT s.id AS service_id, c.channel,
    (1 + (abs(hashtext(s.id::text || c.channel || 'sim')) % 8))::int AS sim,
    (5 + (abs(hashtext(s.id::text || c.channel || 'nao')) % 30))::int AS nao,
    (0 + (abs(hashtext(s.id::text || c.channel || 'tentei')) % 6))::int AS tentei
  FROM org_at.services s
  CROSS JOIN (VALUES ('App'),('Chatbox'),('Digital/Online'),('Outro'),('Presencial'),('Telefone'),('Videochamada')) AS c(channel)
) sub;
