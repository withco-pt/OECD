-- Alguns indicadores operacionais só fazem sentido para uma entidade específica
-- (ex.: "Número de licenças ocasionais atribuídas por feira e período" só existe
-- na CML). Até agora apareciam misturados no catálogo de todas as entidades.
-- Lista fornecida pelo cliente (2026-07-22): 12 indicadores exclusivos.

ALTER TABLE public.indicators
  ADD COLUMN entity_specific text REFERENCES public.organizations(short_name);

COMMENT ON COLUMN public.indicators.entity_specific IS
  'Quando preenchido, o indicador só se aplica a esta entidade (short_name) — não deve aparecer no catálogo/matriz das restantes.';

-- ADC
UPDATE public.indicators SET entity_specific = 'adc' WHERE id IN (
  'a081f7cb-43b1-467d-bad2-42a58670d4fd', -- Número de chamadas atendidas
  '3c3f0c46-5fb5-44d6-96ae-fe5893b17e86', -- Número de chamadas resolvidas em IVR
  '8536bc2a-6c51-44f2-b07e-38f35e97ed2d', -- Número de pedidos de apoio para o Canal de Suporte recebidos
  'aa66baf8-b2b1-4943-bda8-99038132e723', -- Número de pedidos de apoio para o Canal de Suporte encerrados
  '555b3b3b-0c1f-493a-a4d6-332ff4564e86'  -- Rácio chamadas / tickets
);

-- CML (LCC)
UPDATE public.indicators SET entity_specific = 'cml' WHERE id IN (
  '853081cf-47f8-4d67-94d3-b600a302f3c3', -- Número de licenças ocasionais atribuídas por feira e período
  '465031c9-0f52-4dc0-90dc-6dcd93b0660f', -- Número de Certificado de Registo de Cidadão da União Europeia emitidos por período de tempo
  'a4705399-bc3e-4b48-9796-45a52aaccb4f', -- Número de atendimentos de Pedidos de Certificado de Registo de Cidadão da União Europeia
  '2df322e5-bcca-4c13-872c-33cd3f95a52c', -- Tempo médio de atendimento dos pedidos de Certificado de Registo de Cidadão da União Europeia
  'c264285f-4076-4a35-9467-82642e2735b9', -- Tempo médio de espera para o atendimento dos pedidos de Certificado de Registo de Cidadão da União Europeia
  'f25b4776-1701-479a-a50b-90e9cf30a0b0'  -- Nº de Reclamações relativas ao atendimento de pedidos de Certificados da União Europeia
);

-- ISS
UPDATE public.indicators SET entity_specific = 'iss' WHERE id IN (
  '710b9c42-85c0-4137-bc45-3d2faf720189'  -- Tempo médio de atendimento (TMA), em segundos
);
