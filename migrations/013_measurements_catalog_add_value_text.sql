-- Expõe value_text (já existente em measurements, ver docs/data-schema.md) através
-- da view measurements_catalog, para os indicadores value_type='text' ("Resposta aberta").
-- Alteração aditiva: coluna nova no fim do SELECT, mantém todas as colunas/ordem existentes.

CREATE OR REPLACE VIEW measurements_catalog AS
 SELECT 'at'::text AS entity_short,
    m.service_id,
    m.indicator_id,
    m.year,
    m.month,
    m.channel,
    m.value,
    m.total_respondentes,
    m.total_inquiridos,
    m.category_counts,
    m.value_text
   FROM org_at.measurements m
UNION ALL
 SELECT 'iss'::text AS entity_short,
    m.service_id,
    m.indicator_id,
    m.year,
    m.month,
    m.channel,
    m.value,
    m.total_respondentes,
    m.total_inquiridos,
    m.category_counts,
    m.value_text
   FROM org_iss.measurements m
UNION ALL
 SELECT 'ec'::text AS entity_short,
    m.service_id,
    m.indicator_id,
    m.year,
    m.month,
    m.channel,
    m.value,
    m.total_respondentes,
    m.total_inquiridos,
    m.category_counts,
    m.value_text
   FROM org_ec.measurements m;
