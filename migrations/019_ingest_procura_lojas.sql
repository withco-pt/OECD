-- Ingestão de Procura (nº de atendimentos presenciais) por serviço, das Lojas de Cidadão.
-- Fonte: "LC - ISS, AT and ARTE - 2025_2026.xlsx", folha "Serviços" (SIGA).
-- Valores mensais 2025 (jan–jun) + 2026 (jan–mai), somados nas 4 lojas (Faro, Laranjeiras,
-- Marvila, Porto). Agregado nacional: channel=NULL, geo_level=NULL.
-- Ver docs/data-study-data02.md (estudo e decisões, 2026-07-10).
--
-- Este migration:
--   1. Cria o indicador "Número de atendimentos presenciais por serviço" (não existia).
--   2. Consolida os serviços ISS "Abono de família" -> "Pedido de abono de família".
--   3. Cria o serviço ISS "Abono de Família para Crianças e Jovens - Majorações".
--   4. Injeta 160 medições de procura nos serviços mapeados (docs/data-study-data02.md).
--   TMA/TME/desistências/avaliação NÃO são ingeridos (sem granularidade por serviço).

-- ── 1. Indicador novo ────────────────────────────────────────────
INSERT INTO indicators (description, thematic_priority_id, type_of_indicator, channel_scope,
                        value_type, is_multi_channel, is_mandatory, instrumento_recolha, frequencia_recolha)
SELECT 'Número de atendimentos presenciais por serviço', tp.id, 'operational', 'Presencial', 'integer', false, false, 'SIGA', 'Mensal'
FROM thematic_priorities tp WHERE tp.name_pt = 'Procura'
  AND NOT EXISTS (SELECT 1 FROM indicators WHERE description = 'Número de atendimentos presenciais por serviço');

-- ── 2. Consolidar Abono (manter "Pedido de abono de família" como canónico) ──
DO $$
DECLARE v_keep uuid; v_drop uuid;
BEGIN
  SELECT id INTO v_keep FROM org_iss.services WHERE btrim(name)='Pedido de abono de família';
  SELECT id INTO v_drop FROM org_iss.services WHERE btrim(name)='Abono de família';
  IF v_drop IS NOT NULL AND v_keep IS NOT NULL THEN
    -- migrar medições não-conflituantes
    UPDATE org_iss.measurements m SET service_id = v_keep
     WHERE m.service_id = v_drop
       AND NOT EXISTS (SELECT 1 FROM org_iss.measurements k
                       WHERE k.service_id = v_keep AND k.indicator_id = m.indicator_id
                         AND k.year IS NOT DISTINCT FROM m.year AND k.month IS NOT DISTINCT FROM m.month
                         AND k.channel IS NOT DISTINCT FROM m.channel
                         AND k.geo_level IS NOT DISTINCT FROM m.geo_level
                         AND k.geo_name IS NOT DISTINCT FROM m.geo_name);
    -- eliminar as conflituantes restantes e o serviço redundante
    DELETE FROM org_iss.measurements WHERE service_id = v_drop;
    DELETE FROM org_iss.services WHERE id = v_drop;
  END IF;
END $$;

-- ── 3. Serviço ISS novo (Majorações) ─────────────────────────────
INSERT INTO org_iss.services (name, name_normalized, organization_id, matriz_adotada, active)
SELECT 'Abono de Família para Crianças e Jovens - Majorações', 'abono de familia para criancas e jovens - majoracoes',
       (SELECT id FROM organizations WHERE short_name='iss'), false, true
WHERE NOT EXISTS (SELECT 1 FROM org_iss.services WHERE btrim(name)='Abono de Família para Crianças e Jovens - Majorações');

-- ── 4. Medições de procura ───────────────────────────────────────

-- org_ec
INSERT INTO org_ec.measurements (service_id, indicator_id, year, month, channel, geo_level, geo_name, value, is_provisional, source_file)
SELECT s.id, i.id, v.year, v.month, NULL, NULL, NULL, v.value, false, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (VALUES
  ('Cancelamento da Chave Móvel Digital', 2025, 1, 177),
  ('Cancelamento da Chave Móvel Digital', 2025, 2, 188),
  ('Cancelamento da Chave Móvel Digital', 2025, 3, 203),
  ('Cancelamento da Chave Móvel Digital', 2025, 4, 223),
  ('Cancelamento da Chave Móvel Digital', 2025, 5, 286),
  ('Cancelamento da Chave Móvel Digital', 2025, 6, 248),
  ('Cancelamento da Chave Móvel Digital', 2026, 1, 346),
  ('Cancelamento da Chave Móvel Digital', 2026, 2, 257),
  ('Cancelamento da Chave Móvel Digital', 2026, 3, 339),
  ('Cancelamento da Chave Móvel Digital', 2026, 4, 374),
  ('Cancelamento da Chave Móvel Digital', 2026, 5, 299),
  ('Pedido de alteração de morada', 2025, 1, 1284),
  ('Pedido de alteração de morada', 2025, 2, 1144),
  ('Pedido de alteração de morada', 2025, 3, 1030),
  ('Pedido de alteração de morada', 2025, 4, 792),
  ('Pedido de alteração de morada', 2025, 5, 853),
  ('Pedido de alteração de morada', 2025, 6, 755),
  ('Pedido de alteração de morada', 2026, 1, 820),
  ('Pedido de alteração de morada', 2026, 2, 588),
  ('Pedido de alteração de morada', 2026, 3, 678),
  ('Pedido de alteração de morada', 2026, 4, 614),
  ('Pedido de alteração de morada', 2026, 5, 609),
  ('Desbloqueio da Chave Móvel Digital', 2025, 1, 552),
  ('Desbloqueio da Chave Móvel Digital', 2025, 2, 539),
  ('Desbloqueio da Chave Móvel Digital', 2025, 3, 568),
  ('Desbloqueio da Chave Móvel Digital', 2025, 4, 634),
  ('Desbloqueio da Chave Móvel Digital', 2025, 5, 658),
  ('Desbloqueio da Chave Móvel Digital', 2025, 6, 685),
  ('Desbloqueio da Chave Móvel Digital', 2026, 1, 604),
  ('Desbloqueio da Chave Móvel Digital', 2026, 2, 553),
  ('Desbloqueio da Chave Móvel Digital', 2026, 3, 623),
  ('Desbloqueio da Chave Móvel Digital', 2026, 4, 569),
  ('Desbloqueio da Chave Móvel Digital', 2026, 5, 514),
  ('Ativação da Chave Móvel Digital', 2025, 1, 5113),
  ('Ativação da Chave Móvel Digital', 2025, 2, 4226),
  ('Ativação da Chave Móvel Digital', 2025, 3, 4212),
  ('Ativação da Chave Móvel Digital', 2025, 4, 3823),
  ('Ativação da Chave Móvel Digital', 2025, 5, 4578),
  ('Ativação da Chave Móvel Digital', 2025, 6, 4084),
  ('Ativação da Chave Móvel Digital', 2026, 1, 5935),
  ('Ativação da Chave Móvel Digital', 2026, 2, 5427),
  ('Ativação da Chave Móvel Digital', 2026, 3, 6512),
  ('Ativação da Chave Móvel Digital', 2026, 4, 6596),
  ('Ativação da Chave Móvel Digital', 2026, 5, 6815),
  ('Alteração de PIN da Chave Móvel Digital', 2025, 1, 401),
  ('Alteração de PIN da Chave Móvel Digital', 2025, 2, 359),
  ('Alteração de PIN da Chave Móvel Digital', 2025, 3, 74),
  ('Alteração de PIN da Chave Móvel Digital', 2025, 4, 73),
  ('Alteração de PIN da Chave Móvel Digital', 2025, 5, 98),
  ('Alteração de PIN da Chave Móvel Digital', 2025, 6, 122),
  ('Alteração de PIN da Chave Móvel Digital', 2026, 1, 78),
  ('Alteração de PIN da Chave Móvel Digital', 2026, 2, 140),
  ('Alteração de PIN da Chave Móvel Digital', 2026, 3, 191),
  ('Alteração de PIN da Chave Móvel Digital', 2026, 4, 132),
  ('Alteração de PIN da Chave Móvel Digital', 2026, 5, 129)
) AS v(sname, year, month, value)
JOIN org_ec.services s ON btrim(s.name) = v.sname
JOIN indicators i ON i.description = 'Número de atendimentos presenciais por serviço';

-- org_iss
INSERT INTO org_iss.measurements (service_id, indicator_id, year, month, channel, geo_level, geo_name, value, is_provisional, source_file)
SELECT s.id, i.id, v.year, v.month, NULL, NULL, NULL, v.value, false, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (VALUES
  ('Pedido de abono de família', 2025, 1, 2067),
  ('Pedido de abono de família', 2025, 2, 1932),
  ('Pedido de abono de família', 2025, 3, 1653),
  ('Pedido de abono de família', 2025, 4, 1703),
  ('Pedido de abono de família', 2025, 5, 2311),
  ('Pedido de abono de família', 2025, 6, 2045),
  ('Pedido de abono de família', 2026, 1, 2494),
  ('Pedido de abono de família', 2026, 2, 2097),
  ('Pedido de abono de família', 2026, 3, 2323),
  ('Pedido de abono de família', 2026, 4, 2049),
  ('Pedido de abono de família', 2026, 5, 2880),
  ('Abono de Família para Crianças e Jovens - Majorações', 2025, 1, 15),
  ('Abono de Família para Crianças e Jovens - Majorações', 2025, 2, 17),
  ('Abono de Família para Crianças e Jovens - Majorações', 2025, 3, 10),
  ('Abono de Família para Crianças e Jovens - Majorações', 2025, 4, 9),
  ('Abono de Família para Crianças e Jovens - Majorações', 2025, 5, 14),
  ('Abono de Família para Crianças e Jovens - Majorações', 2025, 6, 8),
  ('Abono de Família para Crianças e Jovens - Majorações', 2026, 1, 24),
  ('Abono de Família para Crianças e Jovens - Majorações', 2026, 2, 13),
  ('Abono de Família para Crianças e Jovens - Majorações', 2026, 3, 17),
  ('Abono de Família para Crianças e Jovens - Majorações', 2026, 4, 6),
  ('Abono de Família para Crianças e Jovens - Majorações', 2026, 5, 9),
  ('Pensão de invalidez', 2025, 1, 213),
  ('Pensão de invalidez', 2025, 2, 203),
  ('Pensão de invalidez', 2025, 3, 215),
  ('Pensão de invalidez', 2025, 4, 171),
  ('Pensão de invalidez', 2025, 5, 220),
  ('Pensão de invalidez', 2025, 6, 172),
  ('Pensão de invalidez', 2026, 1, 226),
  ('Pensão de invalidez', 2026, 2, 202),
  ('Pensão de invalidez', 2026, 3, 268),
  ('Pensão de invalidez', 2026, 4, 234),
  ('Pensão de invalidez', 2026, 5, 208),
  ('Pensão de velhice', 2025, 1, 946),
  ('Pensão de velhice', 2025, 2, 942),
  ('Pensão de velhice', 2025, 3, 773),
  ('Pensão de velhice', 2025, 4, 660),
  ('Pensão de velhice', 2025, 5, 855),
  ('Pensão de velhice', 2025, 6, 745),
  ('Pensão de velhice', 2026, 1, 938),
  ('Pensão de velhice', 2026, 2, 952),
  ('Pensão de velhice', 2026, 3, 1072),
  ('Pensão de velhice', 2026, 4, 843),
  ('Pensão de velhice', 2026, 5, 845),
  ('Abono parental inicial', 2025, 6, 405),
  ('Abono parental inicial', 2026, 1, 510),
  ('Abono parental inicial', 2026, 2, 429),
  ('Abono parental inicial', 2026, 3, 490),
  ('Abono parental inicial', 2026, 4, 447),
  ('Abono parental inicial', 2026, 5, 379)
) AS v(sname, year, month, value)
JOIN org_iss.services s ON btrim(s.name) = v.sname
JOIN indicators i ON i.description = 'Número de atendimentos presenciais por serviço';

-- org_at
INSERT INTO org_at.measurements (service_id, indicator_id, year, month, channel, geo_level, geo_name, value, is_provisional, source_file)
SELECT s.id, i.id, v.year, v.month, NULL, NULL, NULL, v.value, false, 'LC - ISS, AT and ARTE - 2025_2026.xlsx'
FROM (VALUES
  ('Atividade', 2025, 1, 393),
  ('Atividade', 2025, 2, 400),
  ('Atividade', 2025, 3, 421),
  ('Atividade', 2025, 4, 381),
  ('Atividade', 2025, 5, 341),
  ('Atividade', 2025, 6, 271),
  ('Atividade', 2026, 1, 1090),
  ('Atividade', 2026, 2, 1100),
  ('Atividade', 2026, 3, 1004),
  ('Atividade', 2026, 4, 962),
  ('Atividade', 2026, 5, 1024),
  ('Declaração/Liquidação Modelo Anexo 3', 2025, 1, 90),
  ('Declaração/Liquidação Modelo Anexo 3', 2025, 2, 104),
  ('Declaração/Liquidação Modelo Anexo 3', 2025, 3, 112),
  ('Declaração/Liquidação Modelo Anexo 3', 2025, 4, 551),
  ('Declaração/Liquidação Modelo Anexo 3', 2025, 5, 585),
  ('Declaração/Liquidação Modelo Anexo 3', 2025, 6, 562),
  ('Declaração/Liquidação Modelo Anexo 3', 2026, 1, 212),
  ('Declaração/Liquidação Modelo Anexo 3', 2026, 2, 323),
  ('Declaração/Liquidação Modelo Anexo 3', 2026, 3, 492),
  ('Declaração/Liquidação Modelo Anexo 3', 2026, 4, 1401),
  ('Declaração/Liquidação Modelo Anexo 3', 2026, 5, 1652),
  ('Emissão de DUC', 2025, 1, 246),
  ('Emissão de DUC', 2025, 2, 144),
  ('Emissão de DUC', 2025, 3, 250),
  ('Emissão de DUC', 2025, 4, 120),
  ('Emissão de DUC', 2025, 5, 210),
  ('Emissão de DUC', 2025, 6, 231),
  ('Emissão de DUC', 2026, 1, 465),
  ('Emissão de DUC', 2026, 2, 431),
  ('Emissão de DUC', 2026, 3, 309),
  ('Emissão de DUC', 2026, 4, 282),
  ('Emissão de DUC', 2026, 5, 68),
  ('Identificação (NIF)', 2025, 1, 3859),
  ('Identificação (NIF)', 2025, 2, 3674),
  ('Identificação (NIF)', 2025, 3, 3855),
  ('Identificação (NIF)', 2025, 4, 2825),
  ('Identificação (NIF)', 2025, 5, 3500),
  ('Identificação (NIF)', 2025, 6, 2574),
  ('Identificação (NIF)', 2026, 1, 2479),
  ('Identificação (NIF)', 2026, 2, 4546),
  ('Identificação (NIF)', 2026, 3, 5106),
  ('Identificação (NIF)', 2026, 4, 3913),
  ('Identificação (NIF)', 2026, 5, 3925),
  ('Pagamentos', 2025, 1, 37),
  ('Pagamentos', 2025, 2, 24),
  ('Pagamentos', 2025, 3, 30),
  ('Pagamentos', 2025, 4, 31),
  ('Pagamentos', 2025, 5, 51),
  ('Pagamentos', 2025, 6, 60),
  ('Pagamentos', 2026, 1, 129),
  ('Pagamentos', 2026, 2, 201),
  ('Pagamentos', 2026, 3, 151),
  ('Pagamentos', 2026, 4, 86),
  ('Pagamentos', 2026, 5, 180)
) AS v(sname, year, month, value)
JOIN org_at.services s ON btrim(s.name) = v.sname
JOIN indicators i ON i.description = 'Número de atendimentos presenciais por serviço';
