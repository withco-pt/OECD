-- ux_expectations tinha "Likert 1-5" genérico, sem rótulos 1=.../5=..., ao
-- contrário de todos os outros indicadores Likert 1-5. Rótulos alinhados com
-- os já usados nos scripts de ingestão (EXPECTATIVAS: 1=Não correspondeu
-- nada às expectativas, 5=Superou as expectativas).
UPDATE public.indicators
SET escala_descricao = 'Likert 1-5 (1=Não correspondeu nada às expectativas → 5=Superou as expectativas)'
WHERE id = 'ca65798d-6236-414d-b183-df0a4eb995d3' AND escala_descricao = 'Likert 1-5';
