-- 058_add_lojas_cidadao_indicators.sql
--
-- Terceiro conjunto do processo de verificação caso-a-caso (ver memória
-- cml-data-gap-reconciliation): caso "ARTE, ISS and AT – Citizen Shops Data".
-- Fonte única: "LC - ISS, AT and ARTE - 2025_2026.xlsx" (SIGA/PowerBI export),
-- folhas P_D_TD, TMA, TME, Aval Atendimento. A folha "Serviços" já tinha sido
-- ingerida na migration 019 (Número de atendimentos presenciais por serviço).
--
-- Aprovado por David em 2026-07-24 (2 decisões estruturais confirmadas em chat):
--   1. Os indicadores "Avaliação do atendimento/experiência em loja" SEM quebra de
--      entidade (folha Aval Atendimento, bloco esquerdo) somam TODAS as entidades
--      da loja, incluindo parceiras que não são desta plataforma (AIMA, CM, EDP,
--      FAGAR, GALP, IMPIC, REGISTOS, VIA VERDE, etc.). Não têm dono claro em nenhum
--      schema de entidade e NÃO são inseridos — só as versões "por entidade"
--      (bloco direito da mesma folha) o são.
--   2. Procura/Desistências/Taxa de Desistências/TMA/TME/Avaliação são agregados por
--      entidade+loja, cruzando TODOS os serviços dessa entidade — não pertencem a
--      nenhum serviço específico já existente no catálogo (ex.: "Renovação de carta
--      de condução"). Como measurements.service_id é obrigatório, foi criado 1 novo
--      serviço "Atendimento em Loja de Cidadão" em cada schema (org_ec/org_at/org_iss)
--      para servir de âncora a estes indicadores, com quebra geo_level='loja'.
--
-- Notas sobre os dados:
--   - Nomes de entidade nesta folha: "EC (ARTE)"→ARTE (org_ec), "AT - Finanças"→AT,
--     "ISS"→ISS. Na folha Aval Atendimento os nomes completos "Agência para a
--     Modernização Administrativa"/"Autoridade Tributária e Aduaneira"/"Instituto da
--     Segurança Social" são usados — mesma correspondência, consistente com a
--     migration 016 (rename_ec_to_arte) e com a própria folha P_D_TD/TMA/TME.
--   - O cabeçalho do ficheiro diz "Intervalo Temporal: 1 a 30 de Junho 2025 + 1 de
--     Janeiro de 2026 a 30 Junho de 2026", mas os dados reais têm Jan-Jun 2025
--     completo preenchido também. Usados os dados reais, não o texto do cabeçalho.
--   - AT não tem loja em Faro (sem linha nessa loja, em nenhuma das folhas).
--   - AT em Marvila teve Procura=0 (sem Desistências/TMA/TME) em 11 dos 12 meses —
--     só há atividade real a partir de Jun/2026 (Procura=2539). Os 11 meses com
--     Procura=0 e sem qualquer outro dado não foram inseridos (não representam uma
--     medição real, ver convenção "não fabricar zeros" das migrations anteriores).
--   - Taxa de Desistências (TD%) vem no ficheiro como fração (0-1); convertida para
--     escala 0-100 para consistência com os restantes indicadores percentuais da
--     plataforma (ex.: os categorical_sim_nao, que guardam 100/0).
--   - TMA/TME vêm no ficheiro como durações (datetime.time); convertidos para
--     segundos totais (arredondados ao segundo).
--   - Avaliação do atendimento/experiência em loja (por entidade) só tem granularidade
--     anual (2025, 2026) na folha, sem quebra mensal — guardado com month=NULL por
--     ano. A coluna "Total" (soma 2025+2026) não foi inserida (redundante, mesma
--     convenção do "Total P/D/TD%" da folha P_D_TD que também não é inserido).
--   - Todos os indicadores são medições diretas do export SIGA/PowerBI (mesma
--     natureza dos dados já ingeridos na migration 019) — is_provisional = FALSE.
--   - Convenção "linha snapshot": além do histórico mensal, é inserida 1 linha extra
--     com month=NULL igual ao valor do mês mais recente disponível, por
--     (serviço, indicador, geo_level, geo_name) — usada pelo cartão do dashboard.

-- ── 1) Serviço agregado "Atendimento em Loja de Cidadão" por entidade ──────────

INSERT INTO org_ec.services (name, name_normalized, organization_id, matriz_adotada, active)
SELECT 'Atendimento em Loja de Cidadão', 'atendimento em loja de cidadao',
       (SELECT id FROM organizations WHERE short_name='ec'), false, true
WHERE NOT EXISTS (SELECT 1 FROM org_ec.services WHERE btrim(name)='Atendimento em Loja de Cidadão');

INSERT INTO org_at.services (name, name_normalized, organization_id, matriz_adotada, active)
SELECT 'Atendimento em Loja de Cidadão', 'atendimento em loja de cidadao',
       (SELECT id FROM organizations WHERE short_name='at'), false, true
WHERE NOT EXISTS (SELECT 1 FROM org_at.services WHERE btrim(name)='Atendimento em Loja de Cidadão');

INSERT INTO org_iss.services (name, name_normalized, organization_id, matriz_adotada, active)
SELECT 'Atendimento em Loja de Cidadão', 'atendimento em loja de cidadao',
       (SELECT id FROM organizations WHERE short_name='iss'), false, true
WHERE NOT EXISTS (SELECT 1 FROM org_iss.services WHERE btrim(name)='Atendimento em Loja de Cidadão');

-- ── 2) Indicadores novos (partilhados, entity_specific=NULL) ───────────────────

INSERT INTO indicators (description, thematic_priority_id, type_of_indicator, channel_scope, value_type, is_multi_channel, is_mandatory, instrumento_recolha, frequencia_recolha)
SELECT 'Número de procura (Lojas de Cidadão)', tp.id, 'operational', 'Presencial', 'integer', false, false, 'SIGA', 'Mensal'
FROM thematic_priorities tp WHERE tp.name_pt = 'Procura'
  AND NOT EXISTS (SELECT 1 FROM indicators WHERE description = 'Número de procura (Lojas de Cidadão)');

INSERT INTO indicators (description, thematic_priority_id, type_of_indicator, channel_scope, value_type, is_multi_channel, is_mandatory, instrumento_recolha, frequencia_recolha)
SELECT 'Número de desistências (Lojas de Cidadão)', tp.id, 'operational', 'Presencial', 'integer', false, false, 'SIGA', 'Mensal'
FROM thematic_priorities tp WHERE tp.name_pt = 'Capacidade de Resposta e Eficiência'
  AND NOT EXISTS (SELECT 1 FROM indicators WHERE description = 'Número de desistências (Lojas de Cidadão)');

INSERT INTO indicators (description, thematic_priority_id, type_of_indicator, channel_scope, value_type, is_multi_channel, is_mandatory, instrumento_recolha, frequencia_recolha)
SELECT 'Taxa de desistências (Lojas de Cidadão)', tp.id, 'operational', 'Presencial', 'decimal', false, false, 'SIGA', 'Mensal'
FROM thematic_priorities tp WHERE tp.name_pt = 'Capacidade de Resposta e Eficiência'
  AND NOT EXISTS (SELECT 1 FROM indicators WHERE description = 'Taxa de desistências (Lojas de Cidadão)');

INSERT INTO indicators (description, thematic_priority_id, type_of_indicator, channel_scope, value_type, is_multi_channel, is_mandatory, instrumento_recolha, frequencia_recolha)
SELECT 'Tempo médio de atendimento (Lojas de Cidadão), em segundos', tp.id, 'operational', 'Presencial', 'decimal', false, false, 'SIGA', 'Mensal'
FROM thematic_priorities tp WHERE tp.name_pt = 'Capacidade de Resposta e Eficiência'
  AND NOT EXISTS (SELECT 1 FROM indicators WHERE description = 'Tempo médio de atendimento (Lojas de Cidadão), em segundos');

INSERT INTO indicators (description, thematic_priority_id, type_of_indicator, channel_scope, value_type, is_multi_channel, is_mandatory, instrumento_recolha, frequencia_recolha)
SELECT 'Tempo médio de espera (Lojas de Cidadão), em segundos', tp.id, 'operational', 'Presencial', 'decimal', false, false, 'SIGA', 'Mensal'
FROM thematic_priorities tp WHERE tp.name_pt = 'Capacidade de Resposta e Eficiência'
  AND NOT EXISTS (SELECT 1 FROM indicators WHERE description = 'Tempo médio de espera (Lojas de Cidadão), em segundos');

INSERT INTO indicators (description, thematic_priority_id, type_of_indicator, channel_scope, value_type, is_multi_channel, is_mandatory, instrumento_recolha, frequencia_recolha)
SELECT 'Avaliação do atendimento em loja (por entidade)', tp.id, 'user_experience', 'Presencial', 'likert_1_5', false, false, 'SIGA', 'Anual'
FROM thematic_priorities tp WHERE tp.name_pt = 'Satisfação e Impacto'
  AND NOT EXISTS (SELECT 1 FROM indicators WHERE description = 'Avaliação do atendimento em loja (por entidade)');

INSERT INTO indicators (description, thematic_priority_id, type_of_indicator, channel_scope, value_type, is_multi_channel, is_mandatory, instrumento_recolha, frequencia_recolha)
SELECT 'Avaliação da experiência em loja (por entidade)', tp.id, 'user_experience', 'Presencial', 'likert_1_5', false, false, 'SIGA', 'Anual'
FROM thematic_priorities tp WHERE tp.name_pt = 'Satisfação e Impacto'
  AND NOT EXISTS (SELECT 1 FROM indicators WHERE description = 'Avaliação da experiência em loja (por entidade)');

-- ── 3) Medições ─────────────────────────────────────────────────────────────

-- org_ec: procura
INSERT INTO org_ec.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_ec.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Número de procura (Lojas de Cidadão)') ind,
     (VALUES
(2025, 1, 'Faro', 4078, NULL),
(2025, 2, 'Faro', 3245, NULL),
(2025, 3, 'Faro', 3272, NULL),
(2025, 4, 'Faro', 3025, NULL),
(2025, 5, 'Faro', 3527, NULL),
(2025, 6, 'Faro', 3322, NULL),
(2026, 1, 'Faro', 4254, NULL),
(2026, 2, 'Faro', 3027, NULL),
(2026, 3, 'Faro', 3287, NULL),
(2026, 4, 'Faro', 2907, NULL),
(2026, 5, 'Faro', 2940, NULL),
(2026, 6, 'Faro', 2938, NULL),
(2026, NULL, 'Faro', 2938, NULL),
(2025, 1, 'Laranjeiras', 13190, NULL),
(2025, 2, 'Laranjeiras', 11211, NULL),
(2025, 3, 'Laranjeiras', 11505, NULL),
(2025, 4, 'Laranjeiras', 9268, NULL),
(2025, 5, 'Laranjeiras', 9736, NULL),
(2025, 6, 'Laranjeiras', 8105, NULL),
(2026, 1, 'Laranjeiras', 11461, NULL),
(2026, 2, 'Laranjeiras', 8872, NULL),
(2026, 3, 'Laranjeiras', 11470, NULL),
(2026, 4, 'Laranjeiras', 10680, NULL),
(2026, 5, 'Laranjeiras', 10157, NULL),
(2026, 6, 'Laranjeiras', 10282, NULL),
(2026, NULL, 'Laranjeiras', 10282, NULL),
(2025, 1, 'Marvila', 3185, NULL),
(2025, 2, 'Marvila', 2659, NULL),
(2025, 3, 'Marvila', 2592, NULL),
(2025, 4, 'Marvila', 2704, NULL),
(2025, 5, 'Marvila', 3191, NULL),
(2025, 6, 'Marvila', 2894, NULL),
(2026, 1, 'Marvila', 3896, NULL),
(2026, 2, 'Marvila', 3155, NULL),
(2026, 3, 'Marvila', 3288, NULL),
(2026, 4, 'Marvila', 2982, NULL),
(2026, 5, 'Marvila', 3128, NULL),
(2026, 6, 'Marvila', 2916, NULL),
(2026, NULL, 'Marvila', 2916, NULL),
(2025, 1, 'Porto', 5752, NULL),
(2025, 2, 'Porto', 4856, NULL),
(2025, 3, 'Porto', 4810, NULL),
(2025, 4, 'Porto', 4394, NULL),
(2025, 5, 'Porto', 5556, NULL),
(2025, 6, 'Porto', 5308, NULL),
(2026, 1, 'Porto', 5821, NULL),
(2026, 2, 'Porto', 4538, NULL),
(2026, 3, 'Porto', 4933, NULL),
(2026, 4, 'Porto', 4900, NULL),
(2026, 5, 'Porto', 4873, NULL),
(2026, 6, 'Porto', 4538, NULL),
(2026, NULL, 'Porto', 4538, NULL)
     ) AS v(year, month, store, value, total_respondentes);

-- org_ec: desistencias
INSERT INTO org_ec.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_ec.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Número de desistências (Lojas de Cidadão)') ind,
     (VALUES
(2025, 1, 'Faro', 793, NULL),
(2025, 2, 'Faro', 543, NULL),
(2025, 3, 'Faro', 470, NULL),
(2025, 4, 'Faro', 416, NULL),
(2025, 5, 'Faro', 496, NULL),
(2025, 6, 'Faro', 461, NULL),
(2026, 1, 'Faro', 512, NULL),
(2026, 2, 'Faro', 303, NULL),
(2026, 3, 'Faro', 273, NULL),
(2026, 4, 'Faro', 333, NULL),
(2026, 5, 'Faro', 384, NULL),
(2026, 6, 'Faro', 358, NULL),
(2026, NULL, 'Faro', 358, NULL),
(2025, 1, 'Laranjeiras', 6760, NULL),
(2025, 2, 'Laranjeiras', 5162, NULL),
(2025, 3, 'Laranjeiras', 5196, NULL),
(2025, 4, 'Laranjeiras', 3482, NULL),
(2025, 5, 'Laranjeiras', 3220, NULL),
(2025, 6, 'Laranjeiras', 3039, NULL),
(2026, 1, 'Laranjeiras', 4433, NULL),
(2026, 2, 'Laranjeiras', 3413, NULL),
(2026, 3, 'Laranjeiras', 3992, NULL),
(2026, 4, 'Laranjeiras', 4020, NULL),
(2026, 5, 'Laranjeiras', 3529, NULL),
(2026, 6, 'Laranjeiras', 3772, NULL),
(2026, NULL, 'Laranjeiras', 3772, NULL),
(2025, 1, 'Marvila', 1065, NULL),
(2025, 2, 'Marvila', 939, NULL),
(2025, 3, 'Marvila', 893, NULL),
(2025, 4, 'Marvila', 933, NULL),
(2025, 5, 'Marvila', 1019, NULL),
(2025, 6, 'Marvila', 923, NULL),
(2026, 1, 'Marvila', 1276, NULL),
(2026, 2, 'Marvila', 515, NULL),
(2026, 3, 'Marvila', 760, NULL),
(2026, 4, 'Marvila', 661, NULL),
(2026, 5, 'Marvila', 857, NULL),
(2026, 6, 'Marvila', 1113, NULL),
(2026, NULL, 'Marvila', 1113, NULL),
(2025, 1, 'Porto', 703, NULL),
(2025, 2, 'Porto', 541, NULL),
(2025, 3, 'Porto', 586, NULL),
(2025, 4, 'Porto', 402, NULL),
(2025, 5, 'Porto', 520, NULL),
(2025, 6, 'Porto', 607, NULL),
(2026, 1, 'Porto', 598, NULL),
(2026, 2, 'Porto', 474, NULL),
(2026, 3, 'Porto', 439, NULL),
(2026, 4, 'Porto', 413, NULL),
(2026, 5, 'Porto', 477, NULL),
(2026, 6, 'Porto', 469, NULL),
(2026, NULL, 'Porto', 469, NULL)
     ) AS v(year, month, store, value, total_respondentes);

-- org_ec: taxa
INSERT INTO org_ec.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_ec.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Taxa de desistências (Lojas de Cidadão)') ind,
     (VALUES
(2025, 1, 'Faro', 24.14, NULL),
(2025, 2, 'Faro', 20.1, NULL),
(2025, 3, 'Faro', 16.77, NULL),
(2025, 4, 'Faro', 15.94, NULL),
(2025, 5, 'Faro', 16.36, NULL),
(2025, 6, 'Faro', 16.11, NULL),
(2026, 1, 'Faro', 13.68, NULL),
(2026, 2, 'Faro', 11.12, NULL),
(2026, 3, 'Faro', 9.06, NULL),
(2026, 4, 'Faro', 12.94, NULL),
(2026, 5, 'Faro', 15.02, NULL),
(2026, 6, 'Faro', 13.88, NULL),
(2026, NULL, 'Faro', 13.88, NULL),
(2025, 1, 'Laranjeiras', 105.13, NULL),
(2025, 2, 'Laranjeiras', 85.34, NULL),
(2025, 3, 'Laranjeiras', 82.36, NULL),
(2025, 4, 'Laranjeiras', 60.18, NULL),
(2025, 5, 'Laranjeiras', 49.42, NULL),
(2025, 6, 'Laranjeiras', 59.99, NULL),
(2026, 1, 'Laranjeiras', 63.08, NULL),
(2026, 2, 'Laranjeiras', 62.52, NULL),
(2026, 3, 'Laranjeiras', 53.38, NULL),
(2026, 4, 'Laranjeiras', 60.36, NULL),
(2026, 5, 'Laranjeiras', 53.24, NULL),
(2026, 6, 'Laranjeiras', 57.94, NULL),
(2026, NULL, 'Laranjeiras', 57.94, NULL),
(2025, 1, 'Marvila', 50.24, NULL),
(2025, 2, 'Marvila', 54.59, NULL),
(2025, 3, 'Marvila', 52.56, NULL),
(2025, 4, 'Marvila', 52.68, NULL),
(2025, 5, 'Marvila', 46.92, NULL),
(2025, 6, 'Marvila', 46.83, NULL),
(2026, 1, 'Marvila', 48.7, NULL),
(2026, 2, 'Marvila', 19.51, NULL),
(2026, 3, 'Marvila', 30.06, NULL),
(2026, 4, 'Marvila', 28.48, NULL),
(2026, 5, 'Marvila', 37.74, NULL),
(2026, 6, 'Marvila', 61.73, NULL),
(2026, NULL, 'Marvila', 61.73, NULL),
(2025, 1, 'Porto', 13.92, NULL),
(2025, 2, 'Porto', 12.54, NULL),
(2025, 3, 'Porto', 13.87, NULL),
(2025, 4, 'Porto', 10.07, NULL),
(2025, 5, 'Porto', 10.33, NULL),
(2025, 6, 'Porto', 12.91, NULL),
(2026, 1, 'Porto', 11.45, NULL),
(2026, 2, 'Porto', 11.66, NULL),
(2026, 3, 'Porto', 9.77, NULL),
(2026, 4, 'Porto', 9.2, NULL),
(2026, 5, 'Porto', 10.85, NULL),
(2026, 6, 'Porto', 11.53, NULL),
(2026, NULL, 'Porto', 11.53, NULL)
     ) AS v(year, month, store, value, total_respondentes);

-- org_ec: tma
INSERT INTO org_ec.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_ec.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Tempo médio de atendimento (Lojas de Cidadão), em segundos') ind,
     (VALUES
(2025, 1, 'Faro', 438, NULL),
(2025, 2, 'Faro', 457, NULL),
(2025, 3, 'Faro', 441, NULL),
(2025, 4, 'Faro', 426, NULL),
(2025, 5, 'Faro', 394, NULL),
(2025, 6, 'Faro', 422, NULL),
(2026, 1, 'Faro', 290, NULL),
(2026, 2, 'Faro', 376, NULL),
(2026, 3, 'Faro', 338, NULL),
(2026, 4, 'Faro', 620, NULL),
(2026, 5, 'Faro', 676, NULL),
(2026, 6, 'Faro', 604, NULL),
(2026, NULL, 'Faro', 604, NULL),
(2025, 1, 'Laranjeiras', 528, NULL),
(2025, 2, 'Laranjeiras', 500, NULL),
(2025, 3, 'Laranjeiras', 550, NULL),
(2025, 4, 'Laranjeiras', 372, NULL),
(2025, 5, 'Laranjeiras', 423, NULL),
(2025, 6, 'Laranjeiras', 337, NULL),
(2026, 1, 'Laranjeiras', 606, NULL),
(2026, 2, 'Laranjeiras', 574, NULL),
(2026, 3, 'Laranjeiras', 699, NULL),
(2026, 4, 'Laranjeiras', 552, NULL),
(2026, 5, 'Laranjeiras', 574, NULL),
(2026, 6, 'Laranjeiras', 571, NULL),
(2026, NULL, 'Laranjeiras', 571, NULL),
(2025, 1, 'Marvila', 622, NULL),
(2025, 2, 'Marvila', 622, NULL),
(2025, 3, 'Marvila', 376, NULL),
(2025, 4, 'Marvila', 598, NULL),
(2025, 5, 'Marvila', 604, NULL),
(2025, 6, 'Marvila', 562, NULL),
(2026, 1, 'Marvila', 508, NULL),
(2026, 2, 'Marvila', 435, NULL),
(2026, 3, 'Marvila', 556, NULL),
(2026, 4, 'Marvila', 521, NULL),
(2026, 5, 'Marvila', 548, NULL),
(2026, 6, 'Marvila', 480, NULL),
(2026, NULL, 'Marvila', 480, NULL),
(2025, 1, 'Porto', 201, NULL),
(2025, 2, 'Porto', 178, NULL),
(2025, 3, 'Porto', 694, NULL),
(2025, 4, 'Porto', 220, NULL),
(2025, 5, 'Porto', 237, NULL),
(2025, 6, 'Porto', 417, NULL),
(2026, 1, 'Porto', 303, NULL),
(2026, 2, 'Porto', 274, NULL),
(2026, 3, 'Porto', 282, NULL),
(2026, 4, 'Porto', 307, NULL),
(2026, 5, 'Porto', 291, NULL),
(2026, 6, 'Porto', 260, NULL),
(2026, NULL, 'Porto', 260, NULL)
     ) AS v(year, month, store, value, total_respondentes);

-- org_ec: tme
INSERT INTO org_ec.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_ec.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Tempo médio de espera (Lojas de Cidadão), em segundos') ind,
     (VALUES
(2025, 1, 'Faro', 388, NULL),
(2025, 2, 'Faro', 380, NULL),
(2025, 3, 'Faro', 460, NULL),
(2025, 4, 'Faro', 328, NULL),
(2025, 5, 'Faro', 320, NULL),
(2025, 6, 'Faro', 340, NULL),
(2026, 1, 'Faro', 330, NULL),
(2026, 2, 'Faro', 404, NULL),
(2026, 3, 'Faro', 540, NULL),
(2026, 4, 'Faro', 498, NULL),
(2026, 5, 'Faro', 392, NULL),
(2026, 6, 'Faro', 664, NULL),
(2026, NULL, 'Faro', 664, NULL),
(2025, 1, 'Laranjeiras', 1984, NULL),
(2025, 2, 'Laranjeiras', 2039, NULL),
(2025, 3, 'Laranjeiras', 3351, NULL),
(2025, 4, 'Laranjeiras', 3776, NULL),
(2025, 5, 'Laranjeiras', 4631, NULL),
(2025, 6, 'Laranjeiras', 4728, NULL),
(2026, 1, 'Laranjeiras', 3102, NULL),
(2026, 2, 'Laranjeiras', 3742, NULL),
(2026, 3, 'Laranjeiras', 2104, NULL),
(2026, 4, 'Laranjeiras', 2406, NULL),
(2026, 5, 'Laranjeiras', 2562, NULL),
(2026, 6, 'Laranjeiras', 2273, NULL),
(2026, NULL, 'Laranjeiras', 2273, NULL),
(2025, 1, 'Marvila', 2164, NULL),
(2025, 2, 'Marvila', 1983, NULL),
(2025, 3, 'Marvila', 1644, NULL),
(2025, 4, 'Marvila', 2281, NULL),
(2025, 5, 'Marvila', 2000, NULL),
(2025, 6, 'Marvila', 2512, NULL),
(2026, 1, 'Marvila', 2038, NULL),
(2026, 2, 'Marvila', 2020, NULL),
(2026, 3, 'Marvila', 2796, NULL),
(2026, 4, 'Marvila', 2350, NULL),
(2026, 5, 'Marvila', 3796, NULL),
(2026, 6, 'Marvila', 5309, NULL),
(2026, NULL, 'Marvila', 5309, NULL),
(2025, 1, 'Porto', 2191, NULL),
(2025, 2, 'Porto', 1269, NULL),
(2025, 3, 'Porto', 1771, NULL),
(2025, 4, 'Porto', 2007, NULL),
(2025, 5, 'Porto', 1722, NULL),
(2025, 6, 'Porto', 2096, NULL),
(2026, 1, 'Porto', 2337, NULL),
(2026, 2, 'Porto', 1486, NULL),
(2026, 3, 'Porto', 1951, NULL),
(2026, 4, 'Porto', 1636, NULL),
(2026, 5, 'Porto', 2116, NULL),
(2026, 6, 'Porto', 2556, NULL),
(2026, NULL, 'Porto', 2556, NULL)
     ) AS v(year, month, store, value, total_respondentes);

-- org_ec: aval_atend
INSERT INTO org_ec.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_ec.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Avaliação do atendimento em loja (por entidade)') ind,
     (VALUES
(2025, NULL, 'Laranjeiras', 2.6, 10),
(2025, NULL, 'Faro', 1.6, 5),
(2025, NULL, 'Marvila', 3.814814814814815, 27),
(2025, NULL, 'Porto', 2.2083333333333335, 24)
     ) AS v(year, month, store, value, total_respondentes);

-- org_ec: aval_exp
INSERT INTO org_ec.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_ec.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Avaliação da experiência em loja (por entidade)') ind,
     (VALUES
(2025, NULL, 'Laranjeiras', 2.5, 10),
(2025, NULL, 'Faro', 2.8, 5),
(2025, NULL, 'Marvila', 3.8518518518518516, 27),
(2025, NULL, 'Porto', 3.0416666666666665, 24)
     ) AS v(year, month, store, value, total_respondentes);

-- org_at: procura
INSERT INTO org_at.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_at.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Número de procura (Lojas de Cidadão)') ind,
     (VALUES
(2025, 1, 'Laranjeiras', 2355, NULL),
(2025, 2, 'Laranjeiras', 2221, NULL),
(2025, 3, 'Laranjeiras', 2465, NULL),
(2025, 4, 'Laranjeiras', 2129, NULL),
(2025, 5, 'Laranjeiras', 2531, NULL),
(2025, 6, 'Laranjeiras', 2065, NULL),
(2026, 1, 'Laranjeiras', 2125, NULL),
(2026, 2, 'Laranjeiras', 6128, NULL),
(2026, 3, 'Laranjeiras', 6444, NULL),
(2026, 4, 'Laranjeiras', 4898, NULL),
(2026, 5, 'Laranjeiras', 5456, NULL),
(2026, 6, 'Laranjeiras', 4649, NULL),
(2026, NULL, 'Laranjeiras', 4649, NULL),
(2025, 1, 'Marvila', 0, NULL),
(2025, 2, 'Marvila', 0, NULL),
(2025, 3, 'Marvila', 0, NULL),
(2025, 4, 'Marvila', 0, NULL),
(2025, 5, 'Marvila', 0, NULL),
(2025, 6, 'Marvila', 0, NULL),
(2026, 1, 'Marvila', 0, NULL),
(2026, 2, 'Marvila', 0, NULL),
(2026, 3, 'Marvila', 0, NULL),
(2026, 4, 'Marvila', 0, NULL),
(2026, 5, 'Marvila', 0, NULL),
(2026, 6, 'Marvila', 2539, NULL),
(2026, NULL, 'Marvila', 2539, NULL),
(2025, 1, 'Porto', 3273, NULL),
(2025, 2, 'Porto', 2765, NULL),
(2025, 3, 'Porto', 2989, NULL),
(2025, 4, 'Porto', 2395, NULL),
(2025, 5, 'Porto', 2949, NULL),
(2025, 6, 'Porto', 2270, NULL),
(2026, 1, 'Porto', 3815, NULL),
(2026, 2, 'Porto', 5493, NULL),
(2026, 3, 'Porto', 5456, NULL),
(2026, 4, 'Porto', 5070, NULL),
(2026, 5, 'Porto', 5508, NULL),
(2026, 6, 'Porto', 4749, NULL),
(2026, NULL, 'Porto', 4749, NULL)
     ) AS v(year, month, store, value, total_respondentes);

-- org_at: desistencias
INSERT INTO org_at.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_at.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Número de desistências (Lojas de Cidadão)') ind,
     (VALUES
(2025, 1, 'Laranjeiras', 286, NULL),
(2025, 2, 'Laranjeiras', 240, NULL),
(2025, 3, 'Laranjeiras', 297, NULL),
(2025, 4, 'Laranjeiras', 353, NULL),
(2025, 5, 'Laranjeiras', 392, NULL),
(2025, 6, 'Laranjeiras', 334, NULL),
(2026, 1, 'Laranjeiras', 233, NULL),
(2026, 2, 'Laranjeiras', 1141, NULL),
(2026, 3, 'Laranjeiras', 1163, NULL),
(2026, 4, 'Laranjeiras', 798, NULL),
(2026, 5, 'Laranjeiras', 1010, NULL),
(2026, 6, 'Laranjeiras', 731, NULL),
(2026, NULL, 'Laranjeiras', 731, NULL),
(2026, 6, 'Marvila', 271, NULL),
(2026, NULL, 'Marvila', 271, NULL),
(2025, 1, 'Porto', 273, NULL),
(2025, 2, 'Porto', 167, NULL),
(2025, 3, 'Porto', 124, NULL),
(2025, 4, 'Porto', 88, NULL),
(2025, 5, 'Porto', 84, NULL),
(2025, 6, 'Porto', 87, NULL),
(2026, 1, 'Porto', 103, NULL),
(2026, 2, 'Porto', 1020, NULL),
(2026, 3, 'Porto', 952, NULL),
(2026, 4, 'Porto', 246, NULL),
(2026, 5, 'Porto', 193, NULL),
(2026, 6, 'Porto', 73, NULL),
(2026, NULL, 'Porto', 73, NULL)
     ) AS v(year, month, store, value, total_respondentes);

-- org_at: taxa
INSERT INTO org_at.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_at.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Taxa de desistências (Lojas de Cidadão)') ind,
     (VALUES
(2025, 1, 'Laranjeiras', 13.82, NULL),
(2025, 2, 'Laranjeiras', 12.12, NULL),
(2025, 3, 'Laranjeiras', 13.7, NULL),
(2025, 4, 'Laranjeiras', 19.88, NULL),
(2025, 5, 'Laranjeiras', 18.33, NULL),
(2025, 6, 'Laranjeiras', 19.3, NULL),
(2026, 1, 'Laranjeiras', 12.32, NULL),
(2026, 2, 'Laranjeiras', 22.88, NULL),
(2026, 3, 'Laranjeiras', 22.02, NULL),
(2026, 4, 'Laranjeiras', 19.46, NULL),
(2026, 5, 'Laranjeiras', 22.72, NULL),
(2026, 6, 'Laranjeiras', 18.66, NULL),
(2026, NULL, 'Laranjeiras', 18.66, NULL),
(2026, 6, 'Marvila', 11.95, NULL),
(2026, NULL, 'Marvila', 11.95, NULL),
(2025, 1, 'Porto', 9.1, NULL),
(2025, 2, 'Porto', 6.43, NULL),
(2025, 3, 'Porto', 4.33, NULL),
(2025, 4, 'Porto', 3.81, NULL),
(2025, 5, 'Porto', 2.93, NULL),
(2025, 6, 'Porto', 3.99, NULL),
(2026, 1, 'Porto', 2.77, NULL),
(2026, 2, 'Porto', 22.8, NULL),
(2026, 3, 'Porto', 21.14, NULL),
(2026, 4, 'Porto', 5.1, NULL),
(2026, 5, 'Porto', 3.63, NULL),
(2026, 6, 'Porto', 1.56, NULL),
(2026, NULL, 'Porto', 1.56, NULL)
     ) AS v(year, month, store, value, total_respondentes);

-- org_at: tma
INSERT INTO org_at.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_at.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Tempo médio de atendimento (Lojas de Cidadão), em segundos') ind,
     (VALUES
(2025, 1, 'Laranjeiras', 495, NULL),
(2025, 2, 'Laranjeiras', 632, NULL),
(2025, 3, 'Laranjeiras', 589, NULL),
(2025, 4, 'Laranjeiras', 656, NULL),
(2025, 5, 'Laranjeiras', 650, NULL),
(2025, 6, 'Laranjeiras', 641, NULL),
(2026, 1, 'Laranjeiras', 519, NULL),
(2026, 2, 'Laranjeiras', 352, NULL),
(2026, 3, 'Laranjeiras', 1062, NULL),
(2026, 4, 'Laranjeiras', 519, NULL),
(2026, 5, 'Laranjeiras', 277, NULL),
(2026, 6, 'Laranjeiras', 559, NULL),
(2026, NULL, 'Laranjeiras', 559, NULL),
(2026, 6, 'Marvila', 542, NULL),
(2026, NULL, 'Marvila', 542, NULL),
(2025, 1, 'Porto', 776, NULL),
(2025, 2, 'Porto', 776, NULL),
(2025, 3, 'Porto', 760, NULL),
(2025, 4, 'Porto', 551, NULL),
(2025, 5, 'Porto', 717, NULL),
(2025, 6, 'Porto', 831, NULL),
(2026, 1, 'Porto', 669, NULL),
(2026, 2, 'Porto', 474, NULL),
(2026, 3, 'Porto', 574, NULL),
(2026, 4, 'Porto', 539, NULL),
(2026, 5, 'Porto', 625, NULL),
(2026, 6, 'Porto', 492, NULL),
(2026, NULL, 'Porto', 492, NULL)
     ) AS v(year, month, store, value, total_respondentes);

-- org_at: tme
INSERT INTO org_at.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_at.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Tempo médio de espera (Lojas de Cidadão), em segundos') ind,
     (VALUES
(2025, 1, 'Laranjeiras', 10119, NULL),
(2025, 2, 'Laranjeiras', 12128, NULL),
(2025, 3, 'Laranjeiras', 11541, NULL),
(2025, 4, 'Laranjeiras', 15396, NULL),
(2025, 5, 'Laranjeiras', 16417, NULL),
(2025, 6, 'Laranjeiras', 17556, NULL),
(2026, 1, 'Laranjeiras', 10872, NULL),
(2026, 2, 'Laranjeiras', 3856, NULL),
(2026, 3, 'Laranjeiras', 2348, NULL),
(2026, 4, 'Laranjeiras', 12254, NULL),
(2026, 5, 'Laranjeiras', 5886, NULL),
(2026, 6, 'Laranjeiras', 12830, NULL),
(2026, NULL, 'Laranjeiras', 12830, NULL),
(2026, 6, 'Marvila', 6846, NULL),
(2026, NULL, 'Marvila', 6846, NULL),
(2025, 1, 'Porto', 6543, NULL),
(2025, 2, 'Porto', 6084, NULL),
(2025, 3, 'Porto', 5215, NULL),
(2025, 4, 'Porto', 5826, NULL),
(2025, 5, 'Porto', 6285, NULL),
(2025, 6, 'Porto', 6454, NULL),
(2026, 1, 'Porto', 2389, NULL),
(2026, 2, 'Porto', 1582, NULL),
(2026, 3, 'Porto', 1779, NULL),
(2026, 4, 'Porto', 4533, NULL),
(2026, 5, 'Porto', 2255, NULL),
(2026, 6, 'Porto', 4795, NULL),
(2026, NULL, 'Porto', 4795, NULL)
     ) AS v(year, month, store, value, total_respondentes);

-- org_at: aval_atend
INSERT INTO org_at.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_at.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Avaliação do atendimento em loja (por entidade)') ind,
     (VALUES
(2025, NULL, 'Laranjeiras', 1.5555555555555556, 27),
(2026, NULL, 'Laranjeiras', 1, 6),
(2025, NULL, 'Porto', 2.4210526315789473, 19),
(2026, NULL, 'Porto', 4.111111111111111, 9)
     ) AS v(year, month, store, value, total_respondentes);

-- org_at: aval_exp
INSERT INTO org_at.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_at.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Avaliação da experiência em loja (por entidade)') ind,
     (VALUES
(2025, NULL, 'Laranjeiras', 2.074074074074074, 27),
(2026, NULL, 'Laranjeiras', 2, 6),
(2025, NULL, 'Porto', 3.526315789473684, 19),
(2026, NULL, 'Porto', 4.555555555555555, 9)
     ) AS v(year, month, store, value, total_respondentes);

-- org_iss: procura
INSERT INTO org_iss.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_iss.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Número de procura (Lojas de Cidadão)') ind,
     (VALUES
(2025, 1, 'Faro', 5200, NULL),
(2025, 2, 'Faro', 3870, NULL),
(2025, 3, 'Faro', 3423, NULL),
(2025, 4, 'Faro', 3284, NULL),
(2025, 5, 'Faro', 3599, NULL),
(2025, 6, 'Faro', 3113, NULL),
(2026, 1, 'Faro', 4031, NULL),
(2026, 2, 'Faro', 3282, NULL),
(2026, 3, 'Faro', 3277, NULL),
(2026, 4, 'Faro', 2998, NULL),
(2026, 5, 'Faro', 3291, NULL),
(2026, 6, 'Faro', 2874, NULL),
(2026, NULL, 'Faro', 2874, NULL),
(2025, 1, 'Laranjeiras', 9546, NULL),
(2025, 2, 'Laranjeiras', 8784, NULL),
(2025, 3, 'Laranjeiras', 8148, NULL),
(2025, 4, 'Laranjeiras', 8198, NULL),
(2025, 5, 'Laranjeiras', 8850, NULL),
(2025, 6, 'Laranjeiras', 7067, NULL),
(2026, 1, 'Laranjeiras', 7263, NULL),
(2026, 2, 'Laranjeiras', 6496, NULL),
(2026, 3, 'Laranjeiras', 8100, NULL),
(2026, 4, 'Laranjeiras', 6451, NULL),
(2026, 5, 'Laranjeiras', 6731, NULL),
(2026, 6, 'Laranjeiras', 5708, NULL),
(2026, NULL, 'Laranjeiras', 5708, NULL),
(2025, 1, 'Marvila', 5164, NULL),
(2025, 2, 'Marvila', 4202, NULL),
(2025, 3, 'Marvila', 4715, NULL),
(2025, 4, 'Marvila', 4276, NULL),
(2025, 5, 'Marvila', 5280, NULL),
(2025, 6, 'Marvila', 3706, NULL),
(2026, 1, 'Marvila', 4596, NULL),
(2026, 2, 'Marvila', 4424, NULL),
(2026, 3, 'Marvila', 4955, NULL),
(2026, 4, 'Marvila', 3739, NULL),
(2026, 5, 'Marvila', 3860, NULL),
(2026, 6, 'Marvila', 3438, NULL),
(2026, NULL, 'Marvila', 3438, NULL),
(2025, 1, 'Porto', 13825, NULL),
(2025, 2, 'Porto', 11355, NULL),
(2025, 3, 'Porto', 10315, NULL),
(2025, 4, 'Porto', 9485, NULL),
(2025, 5, 'Porto', 11246, NULL),
(2025, 6, 'Porto', 9194, NULL),
(2026, 1, 'Porto', 11103, NULL),
(2026, 2, 'Porto', 10313, NULL),
(2026, 3, 'Porto', 11175, NULL),
(2026, 4, 'Porto', 8501, NULL),
(2026, 5, 'Porto', 8866, NULL),
(2026, 6, 'Porto', 7607, NULL),
(2026, NULL, 'Porto', 7607, NULL)
     ) AS v(year, month, store, value, total_respondentes);

-- org_iss: desistencias
INSERT INTO org_iss.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_iss.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Número de desistências (Lojas de Cidadão)') ind,
     (VALUES
(2025, 1, 'Faro', 1235, NULL),
(2025, 2, 'Faro', 648, NULL),
(2025, 3, 'Faro', 509, NULL),
(2025, 4, 'Faro', 499, NULL),
(2025, 5, 'Faro', 588, NULL),
(2025, 6, 'Faro', 420, NULL),
(2026, 1, 'Faro', 835, NULL),
(2026, 2, 'Faro', 523, NULL),
(2026, 3, 'Faro', 382, NULL),
(2026, 4, 'Faro', 400, NULL),
(2026, 5, 'Faro', 462, NULL),
(2026, 6, 'Faro', 428, NULL),
(2026, NULL, 'Faro', 428, NULL),
(2025, 1, 'Laranjeiras', 2697, NULL),
(2025, 2, 'Laranjeiras', 2849, NULL),
(2025, 3, 'Laranjeiras', 2580, NULL),
(2025, 4, 'Laranjeiras', 2781, NULL),
(2025, 5, 'Laranjeiras', 3018, NULL),
(2025, 6, 'Laranjeiras', 2554, NULL),
(2026, 1, 'Laranjeiras', 1550, NULL),
(2026, 2, 'Laranjeiras', 1447, NULL),
(2026, 3, 'Laranjeiras', 1972, NULL),
(2026, 4, 'Laranjeiras', 1434, NULL),
(2026, 5, 'Laranjeiras', 1144, NULL),
(2026, 6, 'Laranjeiras', 932, NULL),
(2026, NULL, 'Laranjeiras', 932, NULL),
(2025, 1, 'Marvila', 735, NULL),
(2025, 2, 'Marvila', 591, NULL),
(2025, 3, 'Marvila', 942, NULL),
(2025, 4, 'Marvila', 887, NULL),
(2025, 5, 'Marvila', 1221, NULL),
(2025, 6, 'Marvila', 668, NULL),
(2026, 1, 'Marvila', 687, NULL),
(2026, 2, 'Marvila', 693, NULL),
(2026, 3, 'Marvila', 754, NULL),
(2026, 4, 'Marvila', 528, NULL),
(2026, 5, 'Marvila', 403, NULL),
(2026, 6, 'Marvila', 367, NULL),
(2026, NULL, 'Marvila', 367, NULL),
(2025, 1, 'Porto', 4908, NULL),
(2025, 2, 'Porto', 3828, NULL),
(2025, 3, 'Porto', 3137, NULL),
(2025, 4, 'Porto', 2892, NULL),
(2025, 5, 'Porto', 3513, NULL),
(2025, 6, 'Porto', 2855, NULL),
(2026, 1, 'Porto', 3108, NULL),
(2026, 2, 'Porto', 2911, NULL),
(2026, 3, 'Porto', 2821, NULL),
(2026, 4, 'Porto', 2273, NULL),
(2026, 5, 'Porto', 2264, NULL),
(2026, 6, 'Porto', 1935, NULL),
(2026, NULL, 'Porto', 1935, NULL)
     ) AS v(year, month, store, value, total_respondentes);

-- org_iss: taxa
INSERT INTO org_iss.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_iss.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Taxa de desistências (Lojas de Cidadão)') ind,
     (VALUES
(2025, 1, 'Faro', 31.15, NULL),
(2025, 2, 'Faro', 20.11, NULL),
(2025, 3, 'Faro', 17.47, NULL),
(2025, 4, 'Faro', 17.92, NULL),
(2025, 5, 'Faro', 19.53, NULL),
(2025, 6, 'Faro', 15.6, NULL),
(2026, 1, 'Faro', 26.13, NULL),
(2026, 2, 'Faro', 18.96, NULL),
(2026, 3, 'Faro', 13.2, NULL),
(2026, 4, 'Faro', 15.4, NULL),
(2026, 5, 'Faro', 16.33, NULL),
(2026, 6, 'Faro', 17.5, NULL),
(2026, NULL, 'Faro', 17.5, NULL),
(2025, 1, 'Laranjeiras', 39.38, NULL),
(2025, 2, 'Laranjeiras', 48.0, NULL),
(2025, 3, 'Laranjeiras', 46.34, NULL),
(2025, 4, 'Laranjeiras', 51.34, NULL),
(2025, 5, 'Laranjeiras', 51.75, NULL),
(2025, 6, 'Laranjeiras', 56.59, NULL),
(2026, 1, 'Laranjeiras', 27.13, NULL),
(2026, 2, 'Laranjeiras', 28.66, NULL),
(2026, 3, 'Laranjeiras', 32.18, NULL),
(2026, 4, 'Laranjeiras', 28.58, NULL),
(2026, 5, 'Laranjeiras', 20.48, NULL),
(2026, 6, 'Laranjeiras', 19.51, NULL),
(2026, NULL, 'Laranjeiras', 19.51, NULL),
(2025, 1, 'Marvila', 16.6, NULL),
(2025, 2, 'Marvila', 16.37, NULL),
(2025, 3, 'Marvila', 24.97, NULL),
(2025, 4, 'Marvila', 26.17, NULL),
(2025, 5, 'Marvila', 30.08, NULL),
(2025, 6, 'Marvila', 21.99, NULL),
(2026, 1, 'Marvila', 17.57, NULL),
(2026, 2, 'Marvila', 18.57, NULL),
(2026, 3, 'Marvila', 17.95, NULL),
(2026, 4, 'Marvila', 16.44, NULL),
(2026, 5, 'Marvila', 11.66, NULL),
(2026, 6, 'Marvila', 11.95, NULL),
(2026, NULL, 'Marvila', 11.95, NULL),
(2025, 1, 'Porto', 55.04, NULL),
(2025, 2, 'Porto', 50.86, NULL),
(2025, 3, 'Porto', 43.7, NULL),
(2025, 4, 'Porto', 43.86, NULL),
(2025, 5, 'Porto', 45.43, NULL),
(2025, 6, 'Porto', 45.04, NULL),
(2026, 1, 'Porto', 38.87, NULL),
(2026, 2, 'Porto', 39.33, NULL),
(2026, 3, 'Porto', 33.77, NULL),
(2026, 4, 'Porto', 36.5, NULL),
(2026, 5, 'Porto', 34.29, NULL),
(2026, 6, 'Porto', 34.11, NULL),
(2026, NULL, 'Porto', 34.11, NULL)
     ) AS v(year, month, store, value, total_respondentes);

-- org_iss: tma
INSERT INTO org_iss.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_iss.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Tempo médio de atendimento (Lojas de Cidadão), em segundos') ind,
     (VALUES
(2025, 1, 'Faro', 297, NULL),
(2025, 2, 'Faro', 309, NULL),
(2025, 3, 'Faro', 309, NULL),
(2025, 4, 'Faro', 310, NULL),
(2025, 5, 'Faro', 317, NULL),
(2025, 6, 'Faro', 308, NULL),
(2026, 1, 'Faro', 319, NULL),
(2026, 2, 'Faro', 312, NULL),
(2026, 3, 'Faro', 332, NULL),
(2026, 4, 'Faro', 347, NULL),
(2026, 5, 'Faro', 330, NULL),
(2026, 6, 'Faro', 349, NULL),
(2026, NULL, 'Faro', 349, NULL),
(2025, 1, 'Laranjeiras', 400, NULL),
(2025, 2, 'Laranjeiras', 479, NULL),
(2025, 3, 'Laranjeiras', 249, NULL),
(2025, 4, 'Laranjeiras', 472, NULL),
(2025, 5, 'Laranjeiras', 471, NULL),
(2025, 6, 'Laranjeiras', 246, NULL),
(2026, 1, 'Laranjeiras', 266, NULL),
(2026, 2, 'Laranjeiras', 174, NULL),
(2026, 3, 'Laranjeiras', 501, NULL),
(2026, 4, 'Laranjeiras', 606, NULL),
(2026, 5, 'Laranjeiras', 246, NULL),
(2026, 6, 'Laranjeiras', 260, NULL),
(2026, NULL, 'Laranjeiras', 260, NULL),
(2025, 1, 'Marvila', 471, NULL),
(2025, 2, 'Marvila', 472, NULL),
(2025, 3, 'Marvila', 528, NULL),
(2025, 4, 'Marvila', 536, NULL),
(2025, 5, 'Marvila', 528, NULL),
(2025, 6, 'Marvila', 515, NULL),
(2026, 1, 'Marvila', 557, NULL),
(2026, 2, 'Marvila', 536, NULL),
(2026, 3, 'Marvila', 552, NULL),
(2026, 4, 'Marvila', 542, NULL),
(2026, 5, 'Marvila', 521, NULL),
(2026, 6, 'Marvila', 570, NULL),
(2026, NULL, 'Marvila', 570, NULL),
(2025, 1, 'Porto', 499, NULL),
(2025, 2, 'Porto', 556, NULL),
(2025, 3, 'Porto', 553, NULL),
(2025, 4, 'Porto', 560, NULL),
(2025, 5, 'Porto', 538, NULL),
(2025, 6, 'Porto', 510, NULL),
(2026, 1, 'Porto', 528, NULL),
(2026, 2, 'Porto', 522, NULL),
(2026, 3, 'Porto', 555, NULL),
(2026, 4, 'Porto', 567, NULL),
(2026, 5, 'Porto', 576, NULL),
(2026, 6, 'Porto', 568, NULL),
(2026, NULL, 'Porto', 568, NULL)
     ) AS v(year, month, store, value, total_respondentes);

-- org_iss: tme
INSERT INTO org_iss.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_iss.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Tempo médio de espera (Lojas de Cidadão), em segundos') ind,
     (VALUES
(2025, 1, 'Faro', 1960, NULL),
(2025, 2, 'Faro', 804, NULL),
(2025, 3, 'Faro', 631, NULL),
(2025, 4, 'Faro', 775, NULL),
(2025, 5, 'Faro', 889, NULL),
(2025, 6, 'Faro', 552, NULL),
(2026, 1, 'Faro', 1447, NULL),
(2026, 2, 'Faro', 1033, NULL),
(2026, 3, 'Faro', 813, NULL),
(2026, 4, 'Faro', 885, NULL),
(2026, 5, 'Faro', 1022, NULL),
(2026, 6, 'Faro', 995, NULL),
(2026, NULL, 'Faro', 995, NULL),
(2025, 1, 'Laranjeiras', 4930, NULL),
(2025, 2, 'Laranjeiras', 4299, NULL),
(2025, 3, 'Laranjeiras', 2628, NULL),
(2025, 4, 'Laranjeiras', 4143, NULL),
(2025, 5, 'Laranjeiras', 4413, NULL),
(2025, 6, 'Laranjeiras', 2797, NULL),
(2026, 1, 'Laranjeiras', 9045, NULL),
(2026, 2, 'Laranjeiras', 7441, NULL),
(2026, 3, 'Laranjeiras', 2578, NULL),
(2026, 4, 'Laranjeiras', 9346, NULL),
(2026, 5, 'Laranjeiras', 3962, NULL),
(2026, 6, 'Laranjeiras', 4162, NULL),
(2026, NULL, 'Laranjeiras', 4162, NULL),
(2025, 1, 'Marvila', 2868, NULL),
(2025, 2, 'Marvila', 2420, NULL),
(2025, 3, 'Marvila', 2585, NULL),
(2025, 4, 'Marvila', 2904, NULL),
(2025, 5, 'Marvila', 2205, NULL),
(2025, 6, 'Marvila', 2795, NULL),
(2026, 1, 'Marvila', 2734, NULL),
(2026, 2, 'Marvila', 3023, NULL),
(2026, 3, 'Marvila', 2982, NULL),
(2026, 4, 'Marvila', 3450, NULL),
(2026, 5, 'Marvila', 3420, NULL),
(2026, 6, 'Marvila', 3514, NULL),
(2026, NULL, 'Marvila', 3514, NULL),
(2025, 1, 'Porto', 2366, NULL),
(2025, 2, 'Porto', 1788, NULL),
(2025, 3, 'Porto', 2104, NULL),
(2025, 4, 'Porto', 2058, NULL),
(2025, 5, 'Porto', 1928, NULL),
(2025, 6, 'Porto', 1957, NULL),
(2026, 1, 'Porto', 1924, NULL),
(2026, 2, 'Porto', 1901, NULL),
(2026, 3, 'Porto', 1734, NULL),
(2026, 4, 'Porto', 2250, NULL),
(2026, 5, 'Porto', 2427, NULL),
(2026, 6, 'Porto', 2224, NULL),
(2026, NULL, 'Porto', 2224, NULL)
     ) AS v(year, month, store, value, total_respondentes);

-- org_iss: aval_atend
INSERT INTO org_iss.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_iss.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Avaliação do atendimento em loja (por entidade)') ind,
     (VALUES
(2025, NULL, 'Laranjeiras', 2.05, 20),
(2026, NULL, 'Laranjeiras', 3.5, 12),
(2025, NULL, 'Faro', 1, 4),
(2025, NULL, 'Marvila', 2.557377049180328, 61),
(2026, NULL, 'Marvila', 1.1162790697674418, 43),
(2025, NULL, 'Porto', 2.4444444444444446, 36),
(2026, NULL, 'Porto', 2.727272727272727, 22)
     ) AS v(year, month, store, value, total_respondentes);

-- org_iss: aval_exp
INSERT INTO org_iss.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, total_respondentes, is_provisional, source_file)
SELECT svc.id, ind.id, v.year::int, v.month::int, 'loja', v.store::text, v.value::numeric, v.total_respondentes::int, FALSE, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (SELECT id FROM org_iss.services WHERE btrim(name)='Atendimento em Loja de Cidadão') svc,
     (SELECT id FROM indicators WHERE description = 'Avaliação da experiência em loja (por entidade)') ind,
     (VALUES
(2025, NULL, 'Laranjeiras', 2.5, 20),
(2026, NULL, 'Laranjeiras', 3.8333333333333335, 12),
(2025, NULL, 'Faro', 1.25, 4),
(2025, NULL, 'Marvila', 3.262295081967213, 61),
(2026, NULL, 'Marvila', 1.186046511627907, 43),
(2025, NULL, 'Porto', 3.0277777777777777, 36),
(2026, NULL, 'Porto', 3.1818181818181817, 22)
     ) AS v(year, month, store, value, total_respondentes);

