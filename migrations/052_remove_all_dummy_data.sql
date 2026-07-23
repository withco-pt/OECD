-- 052_remove_all_dummy_data.sql
-- A pedido do David: remover toda a dummy data identificada na auditoria de
-- proveniência de dados (ver memo "Data Provenance Audit"). Não toca em nenhuma
-- linha real ou provisória-mas-real (ADC self-assessment, inquéritos com amostra
-- pequena) — só nas linhas fabricadas/sem fonte listadas abaixo.
--
-- AT: 2.254 linhas de "Ver por Canal" fictício + 112 de compliance legado
--     (nunca substituído por resposta real, sem source_file nem is_provisional).
-- EC: 1.274 linhas sem source_file — mesmo padrão "por canal" fictício da AT
--     (confirmado: 1.218 distribuídas por 7 canais em 2026-06 + 56 de
--     compliance), resíduo da amostra original anterior à ingestão real.
-- CML: 87 linhas de compliance/operacional fictício (dummy_compliance_cml_2026,
--      dummy_operational_ux_cml_2026) — CML ainda não respondeu a compliance.
-- ISS: 144 linhas de compliance legado para os 18 serviços sem resposta real
--      (os 4 reais, migration 037, não são afetados).
-- ADC: nada a remover (auditoria não encontrou dummy data).

DELETE FROM org_at.measurements WHERE source_file = 'dummy_channel_at_2026';

DELETE FROM org_at.measurements
WHERE source_file IS NULL
  AND indicator_id IN (SELECT id FROM public.indicators WHERE type_of_indicator = 'compliance');

DELETE FROM org_ec.measurements WHERE source_file IS NULL;

DELETE FROM org_cml.measurements
WHERE source_file IN ('dummy_compliance_cml_2026', 'dummy_operational_ux_cml_2026');

DELETE FROM org_iss.measurements
WHERE source_file IS NULL
  AND indicator_id IN (SELECT id FROM public.indicators WHERE type_of_indicator = 'compliance');
