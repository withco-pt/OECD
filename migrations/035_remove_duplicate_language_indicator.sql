-- Feedback do cliente (OCDE/ARTE): o indicador combinado "Como avalia a linguagem utilizada
-- na informação apresentada pelo serviço? 1. Clareza da linguagem 2. Simplicidade da linguagem"
-- é um duplicado por engano na dimensão Simplicidade — os seus dois aspetos já estão cobertos
-- pelos indicadores próprios "Linguagem clara" e "Linguagem simples" (existentes para todas as
-- entidades, incluindo ARTE). Este indicador era o "pai" da pergunta de origem do questionário,
-- com "Linguagem clara"/"Linguagem simples" como filhos (parent_indicator_id) — desassocia-se os
-- filhos antes de remover o pai. measurements_catalog é uma view (UNION de org_<entidade>.measurements
-- por entidade), pelo que as medições residuais têm de ser apagadas nas tabelas base.

UPDATE indicators
SET parent_indicator_id = NULL
WHERE parent_indicator_id = '5e3efc99-134c-4c04-a314-b82c5e74fd28';

DELETE FROM org_adc.measurements
WHERE indicator_id = '5e3efc99-134c-4c04-a314-b82c5e74fd28';

DELETE FROM org_cml.measurements
WHERE indicator_id = '5e3efc99-134c-4c04-a314-b82c5e74fd28';

DELETE FROM indicators
WHERE id = '5e3efc99-134c-4c04-a314-b82c5e74fd28';
