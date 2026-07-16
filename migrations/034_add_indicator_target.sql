-- Adiciona meta/threshold opcional por indicador, para permitir classificar indicadores
-- operacionais e de UX como "underperforming" (mau desempenho) quando o valor mais recente
-- fica do lado errado da meta. Sem meta definida (NULL), o indicador não conta como mau
-- desempenho — não se inventa nenhum corte por defeito.
--
-- target_direction = 'above'  → bom desempenho é value >= target_value (ex.: satisfação, CSAT)
-- target_direction = 'below'  → bom desempenho é value <= target_value (ex.: tempo de espera)

ALTER TABLE indicators
  ADD COLUMN IF NOT EXISTS target_value numeric,
  ADD COLUMN IF NOT EXISTS target_direction text CHECK (target_direction IN ('above', 'below'));

COMMENT ON COLUMN indicators.target_value IS 'Meta/threshold de desempenho do indicador (escala do próprio indicador). NULL = sem meta definida.';
COMMENT ON COLUMN indicators.target_direction IS 'above: bom desempenho é value >= target_value. below: bom desempenho é value <= target_value.';
