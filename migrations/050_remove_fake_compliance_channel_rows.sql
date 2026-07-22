-- Feedback do cliente (2026-07-22): indicadores de compliance são uma resposta
-- Sim/Não única por serviço (não um inquérito), mas alguns mostravam contagens
-- tipo "25 Sim / 18 Não" — impossível para uma resposta única. Causa: dados
-- fictícios por canal (source_file = 'dummy_channel_at_2026') foram inseridos
-- para os 8 indicadores de compliance da AT, 98 linhas por indicador (14
-- serviços x 7 canais), quando compliance nunca deveria ter granularidade por
-- canal. As 14 linhas reais por indicador (channel IS NULL, uma por serviço)
-- mantêm-se intactas.
DELETE FROM org_at.measurements
WHERE source_file = 'dummy_channel_at_2026'
  AND channel IS NOT NULL
  AND indicator_id IN (
    SELECT id FROM public.indicators WHERE type_of_indicator = 'compliance'
  );
