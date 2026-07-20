-- O indicador de interoperabilidade tem a resposta "boa" invertida: o comportamento
-- desejado é o serviço NÃO exigir ao cidadão documentos já disponíveis noutros
-- organismos (resposta "Não" = bom desempenho), ao contrário dos restantes indicadores
-- de compliance, em que "Sim" é sempre a resposta desejada.
--
-- Reutiliza as colunas target_value/target_direction (migration 034, hoje só usadas
-- para operational/UX) para marcar esta polaridade invertida também em indicadores de
-- compliance: target_direction='below' passa a significar, neste contexto, que o bom
-- desempenho é value <= target_value (0=todos "Não" = bom; 100=todos "Sim" = mau).

UPDATE indicators
SET target_value = 50, target_direction = 'below'
WHERE id = '4850d9fb-1934-4759-b084-27523d453856';
