-- Corrige a metadata de escala do indicador NPS.
-- O indicador (value_type='nps') tinha value_scale_min/max = 1/10 e
-- escala_descricao = "Escala 1-10", herdados por engano do template do
-- indicador scale_1_10 (CSAT). Isto fazia o texto "Métrica: Escala 1-10"
-- aparecer nos cards e no cabeçalho de detalhe do indicador NPS, mesmo o
-- gauge já estando correto (-100 a +100) — feedback do cliente (2026-07-16):
-- "o gráfico do NPS está a ser apresentado numa escala de 1 a 10, quando o
-- NPS Score é normalmente representado numa escala de -100 a 100".
--
-- A pergunta de origem no inquérito ("probabilidade de recomendar", 0-10)
-- mantém-se; o que estava errado era descrever o SCORE resultante (NPS,
-- calculado como (Promotores-Detratores)/Total*100) com a escala da
-- pergunta em vez da escala do próprio score.
update public.indicators
set value_scale_min = -100,
    value_scale_max = 100,
    escala_descricao = 'NPS (-100 a +100)'
where value_type = 'nps';
