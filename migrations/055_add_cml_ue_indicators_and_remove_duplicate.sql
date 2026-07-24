-- 055_add_cml_ue_indicators_and_remove_duplicate.sql
--
-- Terceiro caso da verificação caso-a-caso pedida pela cliente (ver memória
-- cml-data-gap-reconciliation) para o serviço "Pedido de Certificado de Registo de
-- Cidadão da União Europeia".
--
-- Pedido da cliente: "Number of requests by nationality" (CertificadosRegistoUE),
-- "Procura por serviço" / "subcategoria" (CML-Atendimentos), e os mesmos 7 indicadores de
-- satisfação/reclamações dos casos anteriores (Reclamacoes_Dashboard).
--
-- 1) Nacionalidade (CertificadosRegistoCidadaoUE_062025_062026.xlsx): 4.440 certificados
--    únicos (48 duplicados exatos removidos, mesma dedup da migration 026), 31
--    nacionalidades. Totais mensais batem exatamente com o indicador já existente
--    "Número de Certificado de Registo de Cidadão da União Europeia emitidos por período
--    de tempo" (465031c9): 759/883/785/695/687/631. Novo indicador com category_counts por
--    mês. NOTA de qualidade de dados: pelo menos 2 valores de nacionalidade parecem
--    truncados na fonte ("PAÍSES" — provavelmente Países Baixos; "REPÚBLICA" —
--    provavelmente República Checa). Mantidos tal como estão no ficheiro, sem adivinhar o
--    nome completo. is_provisional=TRUE por causa disto.
--
-- 2) Subcategoria (CML-Atendimentos-Caraterização-*, filtrando CATEGORIA = "Registo
--    Cidadão da União Europeia – certificado", mesmo filtro da migration 026): 6
--    subcategorias, contagem por ID_ATENDIMENTO distinto (mesma metodologia do indicador
--    "Número de atendimentos..." já existente, a4705399). NOTA: ~400 atendimentos ao longo
--    do período têm mais do que 1 subcategoria registada, por isso a soma das
--    subcategorias por mês fica ligeiramente acima do total mensal do indicador
--    a4705399 (ex.: Jan 1256 vs 1205) — reflexo real dos dados, não erro de cálculo.
--    is_provisional=TRUE.
--
-- 3) Reclamações (Reclamacoes_Dashboard_*.xlsx, os mesmos 7 ficheiros): filtro por
--    "Assunto (Novo)" = "Registo de  cidadão da União Europeia - emissão de certificado"
--    (mesmo filtro exato da migration 026) — 4 registos em 5.428, todos Reclamação +
--    Resolvido (0 encaminhadas, 0 elogios, 0 sugestões). Reutiliza os indicadores standard
--    de satisfação criados na migration 053 (recebidas/resolvidas — mesmos 4 pontos, dado
--    que não há nenhuma encaminhada). "Reclamações por assunto" não é aplicável (só 1
--    categoria, mesmo caso da Certidão) — sem measurement.
--
-- 4) Remove o indicador f25b4776 ("Nº de Reclamações relativas ao atendimento de pedidos
--    de Certificados da União Europeia", migration 021/026): tornou-se duplicado dos
--    indicadores standard acima (mesmos 4 pontos, mesmo conceito). Confirmado sem outras
--    referências (nenhum parent_indicator_id, nenhuma measurement noutra entidade) antes de
--    remover. Aprovado por David em 2026-07-24.

-- ── 1) Novo indicador: certificados emitidos por nacionalidade ──────────────
INSERT INTO public.indicators (id, description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, channel_scope, entity_specific)
VALUES
  ('d6bce9ee-eaab-40f8-9619-f851c0116114'::uuid, 'Número de Certificado de Registo de Cidadão da União Europeia emitidos por nacionalidade', '69234517-f6a5-4890-b801-5e8de0167e74'::uuid, 'operational', 'decimal', false, 'Presencial', 'cml');

INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, value, is_provisional, source_file, category_counts)
VALUES
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'d6bce9ee-eaab-40f8-9619-f851c0116114'::uuid,2026,1,759.0,TRUE,'certificados_registo_cidadao_ue_2026','{"ALBÂNIA": 1, "ALEMANHA": 122, "BULGÁRIA": 4, "BÉLGICA": 19, "CHIPRE": 4, "CROÁCIA": 2, "DINAMARCA": 9, "ESLOVÉNIA": 1, "ESPANHA": 82, "ESTÓNIA": 2, "FINLÂNDIA": 3, "FRANÇA": 142, "GRÉCIA": 7, "HUNGRIA": 13, "IRLANDA": 26, "ITÁLIA": 163, "LETÓNIA": 1, "LITUANIA": 5, "LUXEMBURGO": 3, "NORUEGA": 10, "PAÍSES": 45, "POLÓNIA": 27, "REPÚBLICA": 3, "ROMÉNIA": 27, "SUÉCIA": 20, "SUÍÇA": 4, "ÁUSTRIA": 14}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'d6bce9ee-eaab-40f8-9619-f851c0116114'::uuid,2026,2,883.0,TRUE,'certificados_registo_cidadao_ue_2026','{"ALEMANHA": 136, "BULGÁRIA": 6, "BÉLGICA": 38, "CHIPRE": 7, "CROÁCIA": 4, "DINAMARCA": 7, "ESLOVÉNIA": 6, "ESPANHA": 71, "ESTÓNIA": 2, "FINLÂNDIA": 5, "FRANÇA": 179, "GRÉCIA": 16, "HUNGRIA": 24, "IRLANDA": 28, "ITÁLIA": 190, "LETÓNIA": 3, "LITUANIA": 6, "LUXEMBURGO": 2, "MALTA": 1, "NORUEGA": 17, "PAÍSES": 44, "POLÓNIA": 23, "REPÚBLICA": 17, "ROMÉNIA": 20, "SUÉCIA": 15, "SUÍÇA": 5, "ÁUSTRIA": 11}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'d6bce9ee-eaab-40f8-9619-f851c0116114'::uuid,2026,3,785.0,TRUE,'certificados_registo_cidadao_ue_2026','{"ALEMANHA": 123, "BULGÁRIA": 3, "BÉLGICA": 20, "CROÁCIA": 3, "DINAMARCA": 9, "ESLOVÉNIA": 2, "ESPANHA": 82, "ESTÓNIA": 1, "FINLÂNDIA": 6, "FRANÇA": 137, "GRÉCIA": 6, "HUNGRIA": 14, "IRLANDA": 26, "ITÁLIA": 189, "LITUANIA": 5, "LUXEMBURGO": 5, "NORUEGA": 9, "PAÍSES": 51, "POLÓNIA": 24, "REPÚBLICA": 9, "ROMÉNIA": 24, "SUÉCIA": 20, "SUÍÇA": 9, "ÁUSTRIA": 8}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'d6bce9ee-eaab-40f8-9619-f851c0116114'::uuid,2026,4,695.0,TRUE,'certificados_registo_cidadao_ue_2026','{"ALEMANHA": 88, "ANDORRA": 1, "BULGÁRIA": 1, "BÉLGICA": 18, "CHIPRE": 1, "CROÁCIA": 4, "DINAMARCA": 8, "ESLOVÉNIA": 4, "ESPANHA": 75, "ESTÓNIA": 3, "FINLÂNDIA": 2, "FRANÇA": 115, "GRÉCIA": 3, "HUNGRIA": 16, "IRLANDA": 15, "ITÁLIA": 193, "LETÓNIA": 5, "LIECHTENSTEIN": 1, "LITUANIA": 5, "LUXEMBURGO": 1, "MALTA": 1, "NORUEGA": 5, "PAÍSES": 32, "POLÓNIA": 19, "REPÚBLICA": 10, "ROMÉNIA": 21, "SUÉCIA": 23, "SUÍÇA": 18, "ÁUSTRIA": 7}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'d6bce9ee-eaab-40f8-9619-f851c0116114'::uuid,2026,5,687.0,TRUE,'certificados_registo_cidadao_ue_2026','{"ALEMANHA": 109, "BULGÁRIA": 6, "BÉLGICA": 24, "CANADÁ": 1, "CHIPRE": 2, "CROÁCIA": 5, "DINAMARCA": 2, "ESLOVÉNIA": 2, "ESPANHA": 74, "ESTÓNIA": 2, "FINLÂNDIA": 3, "FRANÇA": 149, "GRÉCIA": 7, "HUNGRIA": 15, "IRLANDA": 13, "ITÁLIA": 146, "LETÓNIA": 6, "LIECHTENSTEIN": 1, "LITUANIA": 5, "LUXEMBURGO": 2, "NORUEGA": 8, "PAÍSES": 37, "POLÓNIA": 24, "REPÚBLICA": 7, "ROMÉNIA": 10, "SUÉCIA": 15, "SUÍÇA": 5, "ÁUSTRIA": 7}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'d6bce9ee-eaab-40f8-9619-f851c0116114'::uuid,2026,6,631.0,TRUE,'certificados_registo_cidadao_ue_2026','{"ALEMANHA": 82, "BULGÁRIA": 3, "BÉLGICA": 29, "DINAMARCA": 5, "ESPANHA": 68, "ESTÓNIA": 1, "FINLÂNDIA": 4, "FRANÇA": 130, "GRÉCIA": 3, "HUNGRIA": 11, "IRLANDA": 21, "ITÁLIA": 159, "LETÓNIA": 3, "LITUANIA": 4, "LUXEMBURGO": 2, "MALTA": 1, "NORUEGA": 4, "PAÍSES": 36, "POLÓNIA": 10, "REPÚBLICA": 8, "ROMÉNIA": 20, "SUÉCIA": 10, "SUÍÇA": 9, "ÁUSTRIA": 8}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'d6bce9ee-eaab-40f8-9619-f851c0116114'::uuid,2026,NULL,631.0,TRUE,'certificados_registo_cidadao_ue_2026','{"ALEMANHA": 82, "BULGÁRIA": 3, "BÉLGICA": 29, "DINAMARCA": 5, "ESPANHA": 68, "ESTÓNIA": 1, "FINLÂNDIA": 4, "FRANÇA": 130, "GRÉCIA": 3, "HUNGRIA": 11, "IRLANDA": 21, "ITÁLIA": 159, "LETÓNIA": 3, "LITUANIA": 4, "LUXEMBURGO": 2, "MALTA": 1, "NORUEGA": 4, "PAÍSES": 36, "POLÓNIA": 10, "REPÚBLICA": 8, "ROMÉNIA": 20, "SUÉCIA": 10, "SUÍÇA": 9, "ÁUSTRIA": 8}'::jsonb);

-- ── 2) Novo indicador: atendimentos UE por subcategoria (Procura por serviço) ──
INSERT INTO public.indicators (id, description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, channel_scope, entity_specific)
VALUES
  ('7a937645-ab60-4270-8de1-8f2434cd0745'::uuid, 'Número de atendimentos de Pedidos de Certificado de Registo de Cidadão da União Europeia por subcategoria', '69234517-f6a5-4890-b801-5e8de0167e74'::uuid, 'operational', 'decimal', false, 'Presencial', 'cml');

INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, value, is_provisional, source_file, category_counts)
VALUES
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'7a937645-ab60-4270-8de1-8f2434cd0745'::uuid,2026,1,1256.0,TRUE,'cml_atendimentos_caraterizacao_2026','{"Certificado de cidadão da União Europeia - Empresas": 87, "Certificado de cidadão da União Europeia - alteração de dados (nome e/ou morada)": 33, "Emissão / alteração / 2ª via": 254, "Emissão de certificado de cidadão da União Europeia": 694, "Emissão de certificado de cidadão da União Europeia - 2ª via por extravio ou roubo": 8, "Pedido de Informação": 180}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'7a937645-ab60-4270-8de1-8f2434cd0745'::uuid,2026,2,1391.0,TRUE,'cml_atendimentos_caraterizacao_2026','{"Certificado de cidadão da União Europeia - Empresas": 114, "Certificado de cidadão da União Europeia - alteração de dados (nome e/ou morada)": 18, "Emissão / alteração / 2ª via": 222, "Emissão de certificado de cidadão da União Europeia": 857, "Emissão de certificado de cidadão da União Europeia - 2ª via por extravio ou roubo": 4, "Pedido de Informação": 176}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'7a937645-ab60-4270-8de1-8f2434cd0745'::uuid,2026,3,1242.0,TRUE,'cml_atendimentos_caraterizacao_2026','{"Certificado de cidadão da União Europeia - Empresas": 95, "Certificado de cidadão da União Europeia - alteração de dados (nome e/ou morada)": 21, "Emissão / alteração / 2ª via": 272, "Emissão de certificado de cidadão da União Europeia": 697, "Emissão de certificado de cidadão da União Europeia - 2ª via por extravio ou roubo": 11, "Pedido de Informação": 146}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'7a937645-ab60-4270-8de1-8f2434cd0745'::uuid,2026,4,1148.0,TRUE,'cml_atendimentos_caraterizacao_2026','{"Certificado de cidadão da União Europeia - Empresas": 85, "Certificado de cidadão da União Europeia - alteração de dados (nome e/ou morada)": 19, "Emissão / alteração / 2ª via": 252, "Emissão de certificado de cidadão da União Europeia": 632, "Emissão de certificado de cidadão da União Europeia - 2ª via por extravio ou roubo": 7, "Pedido de Informação": 153}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'7a937645-ab60-4270-8de1-8f2434cd0745'::uuid,2026,5,1102.0,TRUE,'cml_atendimentos_caraterizacao_2026','{"Certificado de cidadão da União Europeia - Empresas": 105, "Certificado de cidadão da União Europeia - alteração de dados (nome e/ou morada)": 11, "Emissão / alteração / 2ª via": 243, "Emissão de certificado de cidadão da União Europeia": 586, "Emissão de certificado de cidadão da União Europeia - 2ª via por extravio ou roubo": 1, "Pedido de Informação": 156}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'7a937645-ab60-4270-8de1-8f2434cd0745'::uuid,2026,6,1051.0,TRUE,'cml_atendimentos_caraterizacao_2026','{"Certificado de cidadão da União Europeia - Empresas": 88, "Certificado de cidadão da União Europeia - alteração de dados (nome e/ou morada)": 32, "Emissão / alteração / 2ª via": 216, "Emissão de certificado de cidadão da União Europeia": 578, "Emissão de certificado de cidadão da União Europeia - 2ª via por extravio ou roubo": 6, "Pedido de Informação": 131}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'7a937645-ab60-4270-8de1-8f2434cd0745'::uuid,2026,NULL,1051.0,TRUE,'cml_atendimentos_caraterizacao_2026','{"Certificado de cidadão da União Europeia - Empresas": 88, "Certificado de cidadão da União Europeia - alteração de dados (nome e/ou morada)": 32, "Emissão / alteração / 2ª via": 216, "Emissão de certificado de cidadão da União Europeia": 578, "Emissão de certificado de cidadão da União Europeia - 2ª via por extravio ou roubo": 6, "Pedido de Informação": 131}'::jsonb);

-- ── 3) Reclamações standard (4 registos reais, mesmo assunto exato da migration 026) ──
-- CML-950926 (2025-03, Resolvido); CML-995161 (2025-11, Resolvido); CML-1012502
-- (2026-03, Resolvido); CML-1028369 (2026-06, Resolvido). 0 encaminhadas, 0
-- elogios/sugestões.
INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, value, is_provisional, source_file)
VALUES
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'09808270-02b0-4979-b299-9ac1ffe5b6f7'::uuid,2025,3,1,TRUE,'reclamacoes_dashboard_2025_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'09808270-02b0-4979-b299-9ac1ffe5b6f7'::uuid,2025,11,1,TRUE,'reclamacoes_dashboard_2025_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'09808270-02b0-4979-b299-9ac1ffe5b6f7'::uuid,2026,3,1,TRUE,'reclamacoes_dashboard_2025_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'09808270-02b0-4979-b299-9ac1ffe5b6f7'::uuid,2026,6,1,TRUE,'reclamacoes_dashboard_2025_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'09808270-02b0-4979-b299-9ac1ffe5b6f7'::uuid,2026,NULL,1,TRUE,'reclamacoes_dashboard_2025_2026'),

  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'4f0340ca-1fa9-486a-8076-aa7c9f31a8df'::uuid,2025,3,1,TRUE,'reclamacoes_dashboard_2025_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'4f0340ca-1fa9-486a-8076-aa7c9f31a8df'::uuid,2025,11,1,TRUE,'reclamacoes_dashboard_2025_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'4f0340ca-1fa9-486a-8076-aa7c9f31a8df'::uuid,2026,3,1,TRUE,'reclamacoes_dashboard_2025_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'4f0340ca-1fa9-486a-8076-aa7c9f31a8df'::uuid,2026,6,1,TRUE,'reclamacoes_dashboard_2025_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'4f0340ca-1fa9-486a-8076-aa7c9f31a8df'::uuid,2026,NULL,1,TRUE,'reclamacoes_dashboard_2025_2026');

-- ── 4) Remove o indicador duplicado f25b4776 ─────────────────────────────────
DELETE FROM org_cml.measurements WHERE indicator_id = 'f25b4776-1701-479a-a50b-90e9cf30a0b0'::uuid;
DELETE FROM public.indicators WHERE id = 'f25b4776-1701-479a-a50b-90e9cf30a0b0'::uuid;
