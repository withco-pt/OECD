-- 054_add_cml_feiras_indicators_and_fix_ocasional.sql
--
-- Segundo caso da verificação caso-a-caso pedida pela cliente (ver memória
-- cml-data-gap-reconciliation) para o serviço "Solicitação de Lugar em Feira".
--
-- Fontes:
--   1. Feiras_Representativo-01062025 a 30062026.xlsx: coluna "Tipo deAtribuição" tem 3
--      valores (Ocasional Mensal=356, Extraordinária=260, Estudante=161, total 777). O
--      indicador já existente (853081cf, "Número de licenças ocasionais atribuidas por
--      feira e período", migration 026) tinha sido ingerido SEM filtrar por tipo — os seus
--      valores publicados somavam os 3 tipos (777), não só "ocasionais" como o nome diz.
--      Corrigido aqui para conter só Ocasional Mensal (356) — satisfaz também o pedido da
--      cliente de "Número de licenças ocasionais mensais por feira" (mesmo conceito, não
--      cria indicador duplicado). Criado 1 indicador novo para "Extraordinária" (260),
--      que não tinha equivalente no catálogo. "Estudante" fica de fora (não pedido).
--      Bucketing por mês usa "Data deAtribuição", mesma convenção da migration 026.
--
--   2. Reclamacoes_Dashboard_*.xlsx (os mesmos 7 ficheiros, transversais a toda a CML):
--      filtrados por "Assunto (Novo)" ∈ {"Feiras", "Feira da Ladra"} — só 5 registos em
--      5.428 (0 elogios, 0 sugestões, 5 reclamações: 4 resolvidas, 1 encaminhada).
--      is_provisional=TRUE: mesma reserva de sempre sobre recall/precisão do match por
--      texto — pelo menos 2 dos 5 parecem tangenciais (fiscalização numa feira não
--      catalogada, perturbação de trânsito em dias de feira), não estritamente sobre
--      atribuição de lugar/licença, mas seguimos a mesma convenção de match por categoria
--      de Assunto usada nos casos anteriores, sem leitura subjetiva de cada descrição.
--      Reutiliza os indicadores de elogios/sugestões/reclamações já criados na migration
--      053 (são indicadores ao nível da entidade CML, não específicos de 1 serviço).
--      "Reclamações por assunto" tem 2 categorias reais aqui (ao contrário do caso
--      anterior, que só tinha 1) — usa category_counts.
--
-- Aprovado por David em 2026-07-24.

-- ── 1) Corrigir indicador existente: licenças ocasionais (só "Ocasional Mensal") ──
DELETE FROM org_cml.measurements
WHERE service_id = '8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid AND indicator_id = '853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid;

INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, is_provisional, source_file)
VALUES
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,3,NULL,NULL,19.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,4,NULL,NULL,19.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,5,NULL,NULL,16.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,6,NULL,NULL,16.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,7,NULL,NULL,29.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,8,NULL,NULL,21.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,9,NULL,NULL,25.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,10,NULL,NULL,29.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,11,NULL,NULL,28.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,12,NULL,NULL,25.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,1,NULL,NULL,27.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,2,NULL,NULL,28.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,3,NULL,NULL,54.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,4,NULL,NULL,14.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,5,NULL,NULL,2.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,6,NULL,NULL,4.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,NULL,NULL,NULL,4.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,10,'feira','Galinheiras',4.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,11,'feira','Galinheiras',3.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,12,'feira','Galinheiras',2.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,1,'feira','Galinheiras',2.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,2,'feira','Galinheiras',3.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,3,'feira','Galinheiras',3.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,4,'feira','Galinheiras',1.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,3,'feira','Ladra',16.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,4,'feira','Ladra',16.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,5,'feira','Ladra',16.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,6,'feira','Ladra',16.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,7,'feira','Ladra',16.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,8,'feira','Ladra',16.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,9,'feira','Ladra',17.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,10,'feira','Ladra',16.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,11,'feira','Ladra',18.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,12,'feira','Ladra',16.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,1,'feira','Ladra',16.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,2,'feira','Ladra',16.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,3,'feira','Ladra',32.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,3,'feira','Relógio',3.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,4,'feira','Relógio',3.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,7,'feira','Relógio',13.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,8,'feira','Relógio',5.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,9,'feira','Relógio',8.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,10,'feira','Relógio',9.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,11,'feira','Relógio',7.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2025,12,'feira','Relógio',7.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,1,'feira','Relógio',9.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,2,'feira','Relógio',9.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,3,'feira','Relógio',19.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,4,'feira','Relógio',13.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,5,'feira','Relógio',2.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'853081cf-47f8-4d67-94d3-b600a302f3c3'::uuid,2026,6,'feira','Relógio',4.0,FALSE,'feiras_representativo_2025_2026');

-- ── 2) Novo indicador: licenças extraordinárias por feira (só a Feira da Ladra) ──
INSERT INTO public.indicators (id, description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, channel_scope, entity_specific)
VALUES
  ('91329160-6beb-430f-a817-1b252f26433b'::uuid, 'Número de licenças extraordinárias por feira', '69234517-f6a5-4890-b801-5e8de0167e74'::uuid, 'operational', 'decimal', false, 'Presencial', 'cml');

INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, value, is_provisional, source_file)
VALUES
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'91329160-6beb-430f-a817-1b252f26433b'::uuid,2025,3,12.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'91329160-6beb-430f-a817-1b252f26433b'::uuid,2025,4,11.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'91329160-6beb-430f-a817-1b252f26433b'::uuid,2025,5,12.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'91329160-6beb-430f-a817-1b252f26433b'::uuid,2025,6,13.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'91329160-6beb-430f-a817-1b252f26433b'::uuid,2025,7,12.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'91329160-6beb-430f-a817-1b252f26433b'::uuid,2025,8,12.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'91329160-6beb-430f-a817-1b252f26433b'::uuid,2025,9,11.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'91329160-6beb-430f-a817-1b252f26433b'::uuid,2025,10,8.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'91329160-6beb-430f-a817-1b252f26433b'::uuid,2025,11,10.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'91329160-6beb-430f-a817-1b252f26433b'::uuid,2025,12,12.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'91329160-6beb-430f-a817-1b252f26433b'::uuid,2026,1,15.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'91329160-6beb-430f-a817-1b252f26433b'::uuid,2026,2,12.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'91329160-6beb-430f-a817-1b252f26433b'::uuid,2026,3,67.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'91329160-6beb-430f-a817-1b252f26433b'::uuid,2026,4,53.0,FALSE,'feiras_representativo_2025_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'91329160-6beb-430f-a817-1b252f26433b'::uuid,2026,NULL,53.0,FALSE,'feiras_representativo_2025_2026');

-- ── 3) Reclamações (5 registos reais, filtrados por assunto Feiras/Feira da Ladra) ──
-- Reutiliza os indicadores de satisfação criados na migration 053 (nível de entidade, não
-- específicos de 1 serviço). Elogios/sugestões: 0 registos com estes assuntos — sem measurement.
-- CML-988120 (2025-10, Feiras, Resolvido); CML-997894 (2025-12, Feira da Ladra, Resolvido);
-- CML-998958 (2025-12, Feiras, Encaminhado); CML-1005800 (2026-02, Feira da Ladra, Resolvido);
-- CML-1028463 (2026-06, Feiras, Resolvido).
INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, value, is_provisional, source_file, category_counts)
VALUES
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'09808270-02b0-4979-b299-9ac1ffe5b6f7'::uuid,2025,10,1,TRUE,'reclamacoes_dashboard_2025_2026',NULL),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'09808270-02b0-4979-b299-9ac1ffe5b6f7'::uuid,2025,12,2,TRUE,'reclamacoes_dashboard_2025_2026',NULL),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'09808270-02b0-4979-b299-9ac1ffe5b6f7'::uuid,2026,2,1,TRUE,'reclamacoes_dashboard_2025_2026',NULL),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'09808270-02b0-4979-b299-9ac1ffe5b6f7'::uuid,2026,6,1,TRUE,'reclamacoes_dashboard_2025_2026',NULL),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'09808270-02b0-4979-b299-9ac1ffe5b6f7'::uuid,2026,NULL,1,TRUE,'reclamacoes_dashboard_2025_2026',NULL),

  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'4f0340ca-1fa9-486a-8076-aa7c9f31a8df'::uuid,2025,10,1,TRUE,'reclamacoes_dashboard_2025_2026',NULL),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'4f0340ca-1fa9-486a-8076-aa7c9f31a8df'::uuid,2025,12,1,TRUE,'reclamacoes_dashboard_2025_2026',NULL),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'4f0340ca-1fa9-486a-8076-aa7c9f31a8df'::uuid,2026,2,1,TRUE,'reclamacoes_dashboard_2025_2026',NULL),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'4f0340ca-1fa9-486a-8076-aa7c9f31a8df'::uuid,2026,6,1,TRUE,'reclamacoes_dashboard_2025_2026',NULL),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'4f0340ca-1fa9-486a-8076-aa7c9f31a8df'::uuid,2026,NULL,1,TRUE,'reclamacoes_dashboard_2025_2026',NULL),

  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'fe0b8381-d85b-43a8-a491-9ea3519b8ca7'::uuid,2025,12,1,TRUE,'reclamacoes_dashboard_2025_2026',NULL),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'fe0b8381-d85b-43a8-a491-9ea3519b8ca7'::uuid,2025,NULL,1,TRUE,'reclamacoes_dashboard_2025_2026',NULL),

  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'7a06eeb3-ed9d-4d0e-9935-2d2642fb627f'::uuid,2025,10,1,TRUE,'reclamacoes_dashboard_2025_2026','{"Feiras": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'7a06eeb3-ed9d-4d0e-9935-2d2642fb627f'::uuid,2025,12,2,TRUE,'reclamacoes_dashboard_2025_2026','{"Feiras": 1, "Feira da Ladra": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'7a06eeb3-ed9d-4d0e-9935-2d2642fb627f'::uuid,2026,2,1,TRUE,'reclamacoes_dashboard_2025_2026','{"Feira da Ladra": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'7a06eeb3-ed9d-4d0e-9935-2d2642fb627f'::uuid,2026,6,1,TRUE,'reclamacoes_dashboard_2025_2026','{"Feiras": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'7a06eeb3-ed9d-4d0e-9935-2d2642fb627f'::uuid,2026,NULL,1,TRUE,'reclamacoes_dashboard_2025_2026','{"Feiras": 1}'::jsonb);
