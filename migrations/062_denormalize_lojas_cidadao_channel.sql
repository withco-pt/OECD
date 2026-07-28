-- 062_denormalize_lojas_cidadao_channel.sql
--
-- Correção estrutural pedida por David (2026-07-27): os dados de Procura,
-- Desistências, Taxa de Desistências, TMA, TME e Avaliação do atendimento em
-- loja (migration 058, aprovada por David em 2026-07-24) foram ligados a um
-- serviço "Atendimento em Loja de Cidadão" inventado em cada schema (org_ec/
-- org_at/org_iss), só porque measurements.service_id era obrigatório e estes
-- dados são agregados por entidade+loja, cruzando TODOS os serviços — não
-- pertencem a nenhum serviço real do catálogo.
--
-- Decisão: isto deve ser modelado como CANAL (channel='Loja de Cidadão'), não
-- como um serviço. Passos:
--   1. Tornar service_id opcional nas 3 tabelas afetadas.
--   2. Índice único parcial para manter a proteção contra duplicados quando
--      service_id é NULL (a constraint composta existente trata NULLs como
--      distintos, por isso deixa de proteger este caso específico).
--   3. Re-etiquetar as linhas (service_id=NULL, channel='Loja de Cidadão'),
--      identificadas pelos 7 indicadores da migration 058 E pelo serviço
--      inventado (garante que só toca exatamente nas linhas dessa migration).
--      Contagem exata esperada (contada nos VALUES da migration 058):
--        org_ec  = 268 linhas   (5 indicadores × 52 + 2 × 4)
--        org_at  = 159 linhas   (procura 39 + 4 × 28 + 2 × 4)
--        org_iss = 274 linhas   (5 indicadores × 52 + 2 × 7)
--        TOTAL   = 701 linhas
--      Verificado estaticamente: não há duplicados por (indicador, ano, mês, loja)
--      em nenhum schema, logo o índice único parcial do passo 2 pode ser criado.
--   4. Verificação de segurança + apagar os 3 serviços inventados.
--   5. Atualizar channel_scope destes 7 indicadores para consistência da Ficha
--      Técnica (antes 'Presencial', decisão David 2026-07-27).
--
-- Nenhuma medição é apagada — só re-etiquetada. Ver plano em
-- .claude/plans (jolly-skipping-robin) para o levantamento completo do
-- código dependente (src/lib/strategicData.ts, src/lib/measurements.ts,
-- TrendBlock/DimensionProfile, e as 6 páginas/componentes de listagem de
-- indicadores) — corrigido nesse mesmo commit, antes desta migration correr
-- em produção (ver ordem de deploy no plano: código primeiro, migration depois).

-- ── 1. service_id passa a opcional ──────────────────────────────
ALTER TABLE org_ec.measurements  ALTER COLUMN service_id DROP NOT NULL;
ALTER TABLE org_at.measurements  ALTER COLUMN service_id DROP NOT NULL;
ALTER TABLE org_iss.measurements ALTER COLUMN service_id DROP NOT NULL;

-- ── 2. Índice único parcial para o caso service_id IS NULL ──────
CREATE UNIQUE INDEX IF NOT EXISTS org_ec_measurements_null_service_uniq
  ON org_ec.measurements (indicator_id, year, month, channel, geo_level, geo_name)
  WHERE service_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS org_at_measurements_null_service_uniq
  ON org_at.measurements (indicator_id, year, month, channel, geo_level, geo_name)
  WHERE service_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS org_iss_measurements_null_service_uniq
  ON org_iss.measurements (indicator_id, year, month, channel, geo_level, geo_name)
  WHERE service_id IS NULL;

-- ── 3. Re-etiquetar as linhas da migration 058 ──────────────────
UPDATE org_ec.measurements m
SET service_id = NULL, channel = 'Loja de Cidadão'
WHERE m.indicator_id IN (
  SELECT id FROM indicators WHERE description IN (
    'Número de procura (Lojas de Cidadão)',
    'Número de desistências (Lojas de Cidadão)',
    'Taxa de desistências (Lojas de Cidadão)',
    'Tempo médio de atendimento (Lojas de Cidadão), em segundos',
    'Tempo médio de espera (Lojas de Cidadão), em segundos',
    'Avaliação do atendimento em loja (por entidade)',
    'Avaliação da experiência em loja (por entidade)'
  )
) AND m.service_id = (SELECT id FROM org_ec.services WHERE btrim(name)='Atendimento em Loja de Cidadão');

UPDATE org_at.measurements m
SET service_id = NULL, channel = 'Loja de Cidadão'
WHERE m.indicator_id IN (
  SELECT id FROM indicators WHERE description IN (
    'Número de procura (Lojas de Cidadão)',
    'Número de desistências (Lojas de Cidadão)',
    'Taxa de desistências (Lojas de Cidadão)',
    'Tempo médio de atendimento (Lojas de Cidadão), em segundos',
    'Tempo médio de espera (Lojas de Cidadão), em segundos',
    'Avaliação do atendimento em loja (por entidade)',
    'Avaliação da experiência em loja (por entidade)'
  )
) AND m.service_id = (SELECT id FROM org_at.services WHERE btrim(name)='Atendimento em Loja de Cidadão');

UPDATE org_iss.measurements m
SET service_id = NULL, channel = 'Loja de Cidadão'
WHERE m.indicator_id IN (
  SELECT id FROM indicators WHERE description IN (
    'Número de procura (Lojas de Cidadão)',
    'Número de desistências (Lojas de Cidadão)',
    'Taxa de desistências (Lojas de Cidadão)',
    'Tempo médio de atendimento (Lojas de Cidadão), em segundos',
    'Tempo médio de espera (Lojas de Cidadão), em segundos',
    'Avaliação do atendimento em loja (por entidade)',
    'Avaliação da experiência em loja (por entidade)'
  )
) AND m.service_id = (SELECT id FROM org_iss.services WHERE btrim(name)='Atendimento em Loja de Cidadão');

-- ── 4. Verificação de segurança + apagar os serviços inventados ─
DO $$
DECLARE remaining int;
BEGIN
  SELECT count(*) INTO remaining FROM org_ec.measurements
    WHERE service_id = (SELECT id FROM org_ec.services WHERE btrim(name)='Atendimento em Loja de Cidadão');
  IF remaining > 0 THEN
    RAISE EXCEPTION 'org_ec: % measurements ainda referenciam o serviço inventado, a abortar', remaining;
  END IF;

  SELECT count(*) INTO remaining FROM org_at.measurements
    WHERE service_id = (SELECT id FROM org_at.services WHERE btrim(name)='Atendimento em Loja de Cidadão');
  IF remaining > 0 THEN
    RAISE EXCEPTION 'org_at: % measurements ainda referenciam o serviço inventado, a abortar', remaining;
  END IF;

  SELECT count(*) INTO remaining FROM org_iss.measurements
    WHERE service_id = (SELECT id FROM org_iss.services WHERE btrim(name)='Atendimento em Loja de Cidadão');
  IF remaining > 0 THEN
    RAISE EXCEPTION 'org_iss: % measurements ainda referenciam o serviço inventado, a abortar', remaining;
  END IF;
END $$;

DELETE FROM org_ec.services  WHERE btrim(name) = 'Atendimento em Loja de Cidadão';
DELETE FROM org_at.services  WHERE btrim(name) = 'Atendimento em Loja de Cidadão';
DELETE FROM org_iss.services WHERE btrim(name) = 'Atendimento em Loja de Cidadão';

-- ── 5. channel_scope dos 7 indicadores, para consistência da Ficha Técnica ──
UPDATE indicators SET channel_scope = 'Loja de Cidadão'
WHERE description IN (
  'Número de procura (Lojas de Cidadão)',
  'Número de desistências (Lojas de Cidadão)',
  'Taxa de desistências (Lojas de Cidadão)',
  'Tempo médio de atendimento (Lojas de Cidadão), em segundos',
  'Tempo médio de espera (Lojas de Cidadão), em segundos',
  'Avaliação do atendimento em loja (por entidade)',
  'Avaliação da experiência em loja (por entidade)'
);
