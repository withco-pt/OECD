-- 056_add_cml_monstros_gopi_indicators.sql
--
-- Quarto caso da verificação caso-a-caso pedida pela cliente (ver memória
-- cml-data-gap-reconciliation) para "D. Recolha de Monstros" (2 serviços: "Pedido de
-- Recolha de Monstros" e "Serviço de Recolha de Monstros").
--
-- Fonte: Pedido_Recolha_Remocao_Monstros_GOPI - 01062025 a 30062026.xlsx
--   - LxM_Entradas (2.777 registos, dtRegisto 10-29 jun/2026): "meio" (canal) e
--     "freguesia" → "Número de pedidos por canal" / "Número de pedidos por freguesia".
--   - LxM_Resolvidas (2.571 registos, dtResolucao 11-29 jun/2026): mesmas colunas →
--     "Número de pedidos resolvidos por canal" / "Número de pedidos resolvidos por
--     freguesia". Bucketing por dtResolucao (não dtRegisto), mais fiel ao conceito de
--     "resolvido" do que a convenção usada nos outros serviços CML, porque aqui existe
--     mesmo uma data de resolução separada no ficheiro.
--   - Ambas as sheets caem inteiramente em jun/2026 pela data relevante — só 1 mês de
--     dados.
--
-- Ambiguidade conhecida (já documentada em scripts/ingest_cml_operational.py e
-- scripts/ingest_cml_ux.py): NADA no ficheiro distingue "Pedido de Recolha de Monstros"
-- de "Serviço de Recolha de Monstros" — tipologia é sempre "Remoção-Monstros-Pedido de
-- recolha" nas duas sheets. Aprovado por David (2026-07-24) duplicar os mesmos dados
-- pelos 2 serviços, is_provisional=TRUE, mesma convenção já usada para os dados UX destes
-- 2 serviços (scripts/ingest_cml_ux.py / migration 027) — os totais NÃO devem ser somados
-- entre os 2 serviços (dupla contagem), só usados isoladamente até a CML esclarecer a
-- distinção.
--
-- NOTA: os 3 questionários UX mencionados pela cliente para este caso ("Presencial",
-- "Online", "Recolha de Monstros") já estavam integralmente aplicados na plataforma
-- (source_file='cml_ux_questionarios_2026', 274 medições, confirmado por comparação
-- linha-a-linha com scripts/ingest_cml_ux.py) — não é um gap, nada foi alterado aqui.

-- ── 1) Catálogo: 4 novos indicadores ────────────────────────────────────────
INSERT INTO public.indicators (id, description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, channel_scope, entity_specific)
VALUES
  ('db08e75f-6d8b-450a-a752-abea015aaee4'::uuid, 'Número de pedidos por canal', '69234517-f6a5-4890-b801-5e8de0167e74'::uuid, 'operational', 'decimal', false, 'Presencial', 'cml'),
  ('94582d39-a496-43ff-86cf-64722e46a739'::uuid, 'Número de pedidos por freguesia', '69234517-f6a5-4890-b801-5e8de0167e74'::uuid, 'operational', 'decimal', false, 'Presencial', 'cml'),
  ('0e867a2c-1dbd-44ae-8f25-1dd07c215b47'::uuid, 'Número de pedidos resolvidos por canal', '69234517-f6a5-4890-b801-5e8de0167e74'::uuid, 'operational', 'decimal', false, 'Presencial', 'cml'),
  ('c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid, 'Número de pedidos resolvidos por freguesia', '69234517-f6a5-4890-b801-5e8de0167e74'::uuid, 'operational', 'decimal', false, 'Presencial', 'cml');

-- ── 2) Número de pedidos por canal (duplicado pelos 2 serviços) ─────────────
INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, value, is_provisional, source_file, category_counts)
VALUES
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'db08e75f-6d8b-450a-a752-abea015aaee4'::uuid,2026,6,2777.0,TRUE,'gopi_monstros_2026','{"Assistente Virtual de Voz": 1423, "Divisão Atendimento)": 668, "Web/App Na Minha Rua Lx": 686}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'db08e75f-6d8b-450a-a752-abea015aaee4'::uuid,2026,NULL,2777.0,TRUE,'gopi_monstros_2026','{"Assistente Virtual de Voz": 1423, "Divisão Atendimento)": 668, "Web/App Na Minha Rua Lx": 686}'::jsonb),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'db08e75f-6d8b-450a-a752-abea015aaee4'::uuid,2026,6,2777.0,TRUE,'gopi_monstros_2026','{"Assistente Virtual de Voz": 1423, "Divisão Atendimento)": 668, "Web/App Na Minha Rua Lx": 686}'::jsonb),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'db08e75f-6d8b-450a-a752-abea015aaee4'::uuid,2026,NULL,2777.0,TRUE,'gopi_monstros_2026','{"Assistente Virtual de Voz": 1423, "Divisão Atendimento)": 668, "Web/App Na Minha Rua Lx": 686}'::jsonb);

-- ── 3) Número de pedidos por freguesia (24 freguesias + total, x2 serviços) ──
INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, is_provisional, source_file)
VALUES
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,NULL,NULL,2777.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,NULL,NULL,NULL,2777.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Ajuda',76.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Alcântara',79.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Alvalade',196.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Areeiro',124.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Arroios',232.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Avenidas Novas',176.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Beato',32.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Belém',141.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Benfica',173.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Campo de Ourique',144.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Campolide',70.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Carnide',42.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Estrela',112.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Lumiar',222.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Marvila',47.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Misericórdia',67.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Olivais',150.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Parque das Nações',95.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Penha de França',131.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Santa Clara',47.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Santa Maria Maior',83.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Santo António',98.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','São Domingos de Benfica',150.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','São Vicente',90.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,NULL,NULL,2777.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,NULL,NULL,NULL,2777.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Ajuda',76.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Alcântara',79.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Alvalade',196.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Areeiro',124.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Arroios',232.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Avenidas Novas',176.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Beato',32.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Belém',141.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Benfica',173.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Campo de Ourique',144.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Campolide',70.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Carnide',42.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Estrela',112.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Lumiar',222.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Marvila',47.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Misericórdia',67.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Olivais',150.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Parque das Nações',95.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Penha de França',131.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Santa Clara',47.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Santa Maria Maior',83.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','Santo António',98.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','São Domingos de Benfica',150.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'94582d39-a496-43ff-86cf-64722e46a739'::uuid,2026,6,'freguesia','São Vicente',90.0,TRUE,'gopi_monstros_2026');

-- ── 4) Número de pedidos resolvidos por canal (duplicado pelos 2 serviços) ──
INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, value, is_provisional, source_file, category_counts)
VALUES
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'0e867a2c-1dbd-44ae-8f25-1dd07c215b47'::uuid,2026,6,2571.0,TRUE,'gopi_monstros_2026','{"Assistente Virtual de Voz": 1375, "Divisão Atendimento)": 598, "Web/App Na Minha Rua Lx": 598}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'0e867a2c-1dbd-44ae-8f25-1dd07c215b47'::uuid,2026,NULL,2571.0,TRUE,'gopi_monstros_2026','{"Assistente Virtual de Voz": 1375, "Divisão Atendimento)": 598, "Web/App Na Minha Rua Lx": 598}'::jsonb),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'0e867a2c-1dbd-44ae-8f25-1dd07c215b47'::uuid,2026,6,2571.0,TRUE,'gopi_monstros_2026','{"Assistente Virtual de Voz": 1375, "Divisão Atendimento)": 598, "Web/App Na Minha Rua Lx": 598}'::jsonb),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'0e867a2c-1dbd-44ae-8f25-1dd07c215b47'::uuid,2026,NULL,2571.0,TRUE,'gopi_monstros_2026','{"Assistente Virtual de Voz": 1375, "Divisão Atendimento)": 598, "Web/App Na Minha Rua Lx": 598}'::jsonb);

-- ── 5) Número de pedidos resolvidos por freguesia (24 freguesias + total, x2 serviços) ──
INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, geo_level, geo_name, value, is_provisional, source_file)
VALUES
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,NULL,NULL,2571.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,NULL,NULL,NULL,2571.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Ajuda',81.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Alcântara',70.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Alvalade',159.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Areeiro',104.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Arroios',186.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Avenidas Novas',156.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Beato',29.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Belém',139.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Benfica',157.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Campo de Ourique',143.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Campolide',49.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Carnide',39.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Estrela',126.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Lumiar',200.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Marvila',44.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Misericórdia',65.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Olivais',133.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Parque das Nações',87.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Penha de França',143.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Santa Clara',35.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Santa Maria Maior',88.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Santo António',79.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','São Domingos de Benfica',159.0,TRUE,'gopi_monstros_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','São Vicente',100.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,NULL,NULL,2571.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,NULL,NULL,NULL,2571.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Ajuda',81.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Alcântara',70.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Alvalade',159.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Areeiro',104.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Arroios',186.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Avenidas Novas',156.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Beato',29.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Belém',139.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Benfica',157.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Campo de Ourique',143.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Campolide',49.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Carnide',39.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Estrela',126.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Lumiar',200.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Marvila',44.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Misericórdia',65.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Olivais',133.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Parque das Nações',87.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Penha de França',143.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Santa Clara',35.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Santa Maria Maior',88.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','Santo António',79.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','São Domingos de Benfica',159.0,TRUE,'gopi_monstros_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid,'c64a419e-3beb-49cb-a0e9-9d4b145c7e42'::uuid,2026,6,'freguesia','São Vicente',100.0,TRUE,'gopi_monstros_2026');
