-- Liga a pergunta de seguimento "Se sim, 1. tem periodicidade definida?..." ao seu
-- indicador pai "São recolhidos dados sobre a satisfação do utilizador...?", usando a
-- coluna parent_indicator_id já existente (migration 003, documentada em
-- docs/data-schema.md) e já usada noutros 4 grupos de perguntas condicionais — este
-- par tinha ficado por ligar.

UPDATE indicators
SET parent_indicator_id = '0951ab7e-d684-4cf6-be6a-48599556fa79'
WHERE id = '0e8c5ac1-9e2e-48de-852f-92a5636a1549';
