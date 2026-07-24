-- 053_add_cml_certidao_reclamacoes_indicators.sql
--
-- A cliente (via OCDE PM) reportou que a plataforma tem dados em falta para o serviço
-- "Certidão de Licença de Utilização" (CML). Verificação caso-a-caso (ver memória
-- cml-data-gap-reconciliation) confirmou que nenhum dos 9 indicadores pedidos existia no
-- catálogo (public.indicators) — não era um problema de carregamento, mas de catálogo. Já
-- tinha sido deliberadamente deixado de fora por scripts/ingest_cml_operational.py
-- ("não há onde os inserir sem criar um novo indicador, o que não está aprovado").
--
-- Aprovado agora (David, 2026-07-24) criar os 9 indicadores. Fontes:
--
--   1-2. Licenca_Utilizacao_CRM - 01062025 a 30062026.xlsx (100% específico ao serviço,
--        4.725 pedidos): "Número de pedidos resolvidos"/"encaminhados" por mês, via
--        "Razão do Estado" ∈ {Resolvido, Encaminhado}. Mês = mês de "Criado Em" (o ficheiro
--        não tem data de resolução/encaminhamento separada) — por isso is_provisional=TRUE,
--        tal como o indicador "Número de atendimentos presenciais por serviço" já ingerido
--        deste mesmo ficheiro (migration 026).
--
--   3-9. Reclamacoes_Dashboard_*.xlsx (7 ficheiros, 5.428 registos no total, transversais a
--        toda a CML): filtrados por "Assunto (Novo)" = "Cópia certificada - autorização /
--        licença de utilização" (o mesmo texto exato usado no ficheiro CRM), seguindo a
--        mesma convenção de match-por-texto já usada para a UE (indicador f25b4776,
--        migration 026) — aqui só há 2 registos em 5.428 com este assunto, por isso
--        is_provisional=TRUE (recall do match desconhecido).
--        Resultado do filtro: 0 elogios, 0 sugestões (recebidas/encaminhadas), 2 reclamações
--        (1 resolvida em 2025-03, 1 encaminhada em 2025-05). Os indicadores de elogios/
--        sugestões entram no catálogo mas SEM measurements (não há dados destes tipos para
--        este assunto nos 7 ficheiros — não confundir com "não foi medido").
--        "Número de reclamações por assunto" entra só no catálogo, sem measurement: depois
--        de filtrar pelo assunto do próprio serviço, todas as reclamações partilham o mesmo
--        assunto (por definição), pelo que uma repartição "por assunto" não é possível com
--        os dados atuais.
--
-- Dimensão: "Procura" (Demand) para os 2 indicadores do CRM; "Satisfação e Impacto"
-- (Satisfaction and Impact) para os 7 de elogios/sugestões/reclamações — mesma dimensão já
-- usada no indicador análogo da UE (f25b4776). entity_specific='cml' e channel_scope=
-- 'Presencial' seguem a convenção já usada nos outros indicadores operacionais da CML
-- (0b30f2bd, 853081cf, f25b4776).

-- ── 1) Catálogo: 9 novos indicadores ────────────────────────────────────────
INSERT INTO public.indicators (id, description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, channel_scope, entity_specific)
VALUES
  ('cea03bfd-50cc-4134-9d95-893183254b6b'::uuid, 'Número de pedidos resolvidos', '69234517-f6a5-4890-b801-5e8de0167e74'::uuid, 'operational', 'integer', false, 'Presencial', 'cml'),
  ('3439d9aa-7299-4cec-a667-f4e301413897'::uuid, 'Número de pedidos encaminhados', '69234517-f6a5-4890-b801-5e8de0167e74'::uuid, 'operational', 'integer', false, 'Presencial', 'cml'),
  ('807fbe08-c491-4e78-8ee4-904c84085cdd'::uuid, 'Número de elogios recebidos', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'operational', 'decimal', false, 'Presencial', 'cml'),
  ('bc73095a-0bd6-40f5-b649-fdd3bb4d73f9'::uuid, 'Número de sugestões recebidas', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'operational', 'decimal', false, 'Presencial', 'cml'),
  ('bd6cdc07-ff27-4f0c-96f7-a0102b47f2b7'::uuid, 'Número de sugestões encaminhadas', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'operational', 'decimal', false, 'Presencial', 'cml'),
  ('09808270-02b0-4979-b299-9ac1ffe5b6f7'::uuid, 'Número de reclamações recebidas', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'operational', 'decimal', false, 'Presencial', 'cml'),
  ('4f0340ca-1fa9-486a-8076-aa7c9f31a8df'::uuid, 'Número de reclamações resolvidas', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'operational', 'decimal', false, 'Presencial', 'cml'),
  ('fe0b8381-d85b-43a8-a491-9ea3519b8ca7'::uuid, 'Número de reclamações encaminhadas', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'operational', 'decimal', false, 'Presencial', 'cml'),
  ('7a06eeb3-ed9d-4d0e-9935-2d2642fb627f'::uuid, 'Número de reclamações por assunto', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'operational', 'decimal', false, 'Presencial', 'cml');

-- ── 2) Measurements: pedidos resolvidos (mensal, jun/2025-jun/2026 + snapshot) ──
INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, value, is_provisional, source_file)
VALUES
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'cea03bfd-50cc-4134-9d95-893183254b6b'::uuid,2025,6,279,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'cea03bfd-50cc-4134-9d95-893183254b6b'::uuid,2025,7,360,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'cea03bfd-50cc-4134-9d95-893183254b6b'::uuid,2025,8,231,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'cea03bfd-50cc-4134-9d95-893183254b6b'::uuid,2025,9,317,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'cea03bfd-50cc-4134-9d95-893183254b6b'::uuid,2025,10,340,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'cea03bfd-50cc-4134-9d95-893183254b6b'::uuid,2025,11,342,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'cea03bfd-50cc-4134-9d95-893183254b6b'::uuid,2025,12,166,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'cea03bfd-50cc-4134-9d95-893183254b6b'::uuid,2026,1,291,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'cea03bfd-50cc-4134-9d95-893183254b6b'::uuid,2026,2,269,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'cea03bfd-50cc-4134-9d95-893183254b6b'::uuid,2026,3,341,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'cea03bfd-50cc-4134-9d95-893183254b6b'::uuid,2026,4,328,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'cea03bfd-50cc-4134-9d95-893183254b6b'::uuid,2026,5,285,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'cea03bfd-50cc-4134-9d95-893183254b6b'::uuid,2026,6,74,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'cea03bfd-50cc-4134-9d95-893183254b6b'::uuid,2026,NULL,74,TRUE,'licenca_utilizacao_crm_2025_2026');

-- ── 3) Measurements: pedidos encaminhados (mensal, jun/2025-jun/2026 + snapshot) ──
INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, value, is_provisional, source_file)
VALUES
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3439d9aa-7299-4cec-a667-f4e301413897'::uuid,2025,6,50,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3439d9aa-7299-4cec-a667-f4e301413897'::uuid,2025,7,45,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3439d9aa-7299-4cec-a667-f4e301413897'::uuid,2025,8,46,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3439d9aa-7299-4cec-a667-f4e301413897'::uuid,2025,9,49,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3439d9aa-7299-4cec-a667-f4e301413897'::uuid,2025,10,56,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3439d9aa-7299-4cec-a667-f4e301413897'::uuid,2025,11,47,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3439d9aa-7299-4cec-a667-f4e301413897'::uuid,2025,12,24,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3439d9aa-7299-4cec-a667-f4e301413897'::uuid,2026,1,45,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3439d9aa-7299-4cec-a667-f4e301413897'::uuid,2026,2,62,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3439d9aa-7299-4cec-a667-f4e301413897'::uuid,2026,3,28,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3439d9aa-7299-4cec-a667-f4e301413897'::uuid,2026,4,34,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3439d9aa-7299-4cec-a667-f4e301413897'::uuid,2026,5,27,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3439d9aa-7299-4cec-a667-f4e301413897'::uuid,2026,6,11,TRUE,'licenca_utilizacao_crm_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3439d9aa-7299-4cec-a667-f4e301413897'::uuid,2026,NULL,11,TRUE,'licenca_utilizacao_crm_2025_2026');

-- ── 4) Measurements: reclamações (2 registos reais, filtrados por assunto) ─────
-- CML-949845-K1L4 (2025-03, Resolvido) e CML-963715-Q7T6 (2025-05, Encaminhado).
-- Elogios/Sugestões: 0 registos com este assunto nos 7 ficheiros — sem measurement.
INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, value, is_provisional, source_file)
VALUES
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'09808270-02b0-4979-b299-9ac1ffe5b6f7'::uuid,2025,3,1,TRUE,'reclamacoes_dashboard_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'09808270-02b0-4979-b299-9ac1ffe5b6f7'::uuid,2025,5,1,TRUE,'reclamacoes_dashboard_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'09808270-02b0-4979-b299-9ac1ffe5b6f7'::uuid,2025,NULL,1,TRUE,'reclamacoes_dashboard_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'4f0340ca-1fa9-486a-8076-aa7c9f31a8df'::uuid,2025,3,1,TRUE,'reclamacoes_dashboard_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'4f0340ca-1fa9-486a-8076-aa7c9f31a8df'::uuid,2025,NULL,1,TRUE,'reclamacoes_dashboard_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'fe0b8381-d85b-43a8-a491-9ea3519b8ca7'::uuid,2025,5,1,TRUE,'reclamacoes_dashboard_2025_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'fe0b8381-d85b-43a8-a491-9ea3519b8ca7'::uuid,2025,NULL,1,TRUE,'reclamacoes_dashboard_2025_2026');
