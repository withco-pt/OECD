-- 028_remove_cml_remaining_mock.sql
-- A pedido do David: remover toda a data sintética que restava da migration 021 para a CML.
-- Depois de 026/027 substituírem os indicadores com dados reais disponíveis, os restantes
-- 94 valores mock (compliance nunca respondido, chamadas/IVR/canal de suporte sem fonte,
-- e todo o operacional/parte do UX de Monstros) ficam agora vazios em vez de fictícios.
DELETE FROM org_cml.measurements WHERE source_file IS NULL;
