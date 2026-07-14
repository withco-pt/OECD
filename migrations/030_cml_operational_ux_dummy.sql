-- 030_cml_operational_ux_dummy.sql
-- A pedido do David: repor os restantes indicadores fictícios da CML (call center:
-- chamadas/IVR/canal de suporte/TMA genérico/atendimentos presenciais; e 4 indicadores
-- de UX "legado" sem etl_column_key) para permitir os testes de utilizador já planeados.
-- Nenhum destes tem fonte real nos ficheiros recebidos (confirmado na auditoria).
-- Valores idênticos aos que estavam na migration 021 antes de terem sido apagados.
-- Marcado is_provisional=TRUE e source_file explícito, para fácil substituição futura.

INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, value, total_respondentes, is_provisional, source_file)
VALUES
  -- Certidão de Licença de Utilização (atendimentos presenciais já é real, não repetido)
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, 'a081f7cb-43b1-467d-bad2-42a58670d4fd'::uuid, 2026, NULL, 146.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, '3c3f0c46-5fb5-44d6-96ae-fe5893b17e86'::uuid, 2026, NULL, 11.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, 'aa66baf8-b2b1-4943-bda8-99038132e723'::uuid, 2026, NULL, 116.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, '8536bc2a-6c51-44f2-b07e-38f35e97ed2d'::uuid, 2026, NULL, 87.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, '555b3b3b-0c1f-493a-a4d6-332ff4564e86'::uuid, 2026, NULL, 0.69, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, '710b9c42-85c0-4137-bc45-3d2faf720189'::uuid, 2026, NULL, 341.4, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, '5e3efc99-134c-4c04-a314-b82c5e74fd28'::uuid, 2026, NULL, 4.13, 49, TRUE, 'dummy_operational_ux_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, 'e9361303-b1f4-4294-a310-a7fcb6918d8c'::uuid, 2026, NULL, 4.46, 29, TRUE, 'dummy_operational_ux_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, '197f10a6-35b0-4e21-a317-6d423c9c411b'::uuid, 2026, NULL, 92.9, 42, TRUE, 'dummy_operational_ux_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, 'a561671e-06dd-4362-b34e-0238999a9889'::uuid, 2026, NULL, 100.0, 13, TRUE, 'dummy_operational_ux_cml_2026'),

  -- Pedido de Certificado de Registo de Cidadão da União Europeia
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, '0b30f2bd-643e-409a-861b-61ad13913702'::uuid, 2026, NULL, 162.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, 'a081f7cb-43b1-467d-bad2-42a58670d4fd'::uuid, 2026, NULL, 20.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, '3c3f0c46-5fb5-44d6-96ae-fe5893b17e86'::uuid, 2026, NULL, 177.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, 'aa66baf8-b2b1-4943-bda8-99038132e723'::uuid, 2026, NULL, 172.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, '8536bc2a-6c51-44f2-b07e-38f35e97ed2d'::uuid, 2026, NULL, 174.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, '555b3b3b-0c1f-493a-a4d6-332ff4564e86'::uuid, 2026, NULL, 1.63, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, '710b9c42-85c0-4137-bc45-3d2faf720189'::uuid, 2026, NULL, 423.4, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, '5e3efc99-134c-4c04-a314-b82c5e74fd28'::uuid, 2026, NULL, 4.59, 35, TRUE, 'dummy_operational_ux_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, 'e9361303-b1f4-4294-a310-a7fcb6918d8c'::uuid, 2026, NULL, 4.56, 36, TRUE, 'dummy_operational_ux_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, '197f10a6-35b0-4e21-a317-6d423c9c411b'::uuid, 2026, NULL, 93.5, 31, TRUE, 'dummy_operational_ux_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, 'a561671e-06dd-4362-b34e-0238999a9889'::uuid, 2026, NULL, 84.4, 45, TRUE, 'dummy_operational_ux_cml_2026'),

  -- Pedido de Recolha de Monstros (sem "linguagem combinada" no conjunto original)
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, '0b30f2bd-643e-409a-861b-61ad13913702'::uuid, 2026, NULL, 106.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, 'a081f7cb-43b1-467d-bad2-42a58670d4fd'::uuid, 2026, NULL, 103.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, '3c3f0c46-5fb5-44d6-96ae-fe5893b17e86'::uuid, 2026, NULL, 172.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, 'aa66baf8-b2b1-4943-bda8-99038132e723'::uuid, 2026, NULL, 82.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, '8536bc2a-6c51-44f2-b07e-38f35e97ed2d'::uuid, 2026, NULL, 168.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, '555b3b3b-0c1f-493a-a4d6-332ff4564e86'::uuid, 2026, NULL, 0.41, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, '710b9c42-85c0-4137-bc45-3d2faf720189'::uuid, 2026, NULL, 157.9, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, 'e9361303-b1f4-4294-a310-a7fcb6918d8c'::uuid, 2026, NULL, 3.8, 22, TRUE, 'dummy_operational_ux_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, '197f10a6-35b0-4e21-a317-6d423c9c411b'::uuid, 2026, NULL, 70.6, 17, TRUE, 'dummy_operational_ux_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, 'a561671e-06dd-4362-b34e-0238999a9889'::uuid, 2026, NULL, 64.7, 17, TRUE, 'dummy_operational_ux_cml_2026'),

  -- Serviço de Recolha de Monstros (sem "linguagem combinada" no conjunto original)
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, '0b30f2bd-643e-409a-861b-61ad13913702'::uuid, 2026, NULL, 124.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, 'a081f7cb-43b1-467d-bad2-42a58670d4fd'::uuid, 2026, NULL, 86.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, '3c3f0c46-5fb5-44d6-96ae-fe5893b17e86'::uuid, 2026, NULL, 57.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, 'aa66baf8-b2b1-4943-bda8-99038132e723'::uuid, 2026, NULL, 111.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, '8536bc2a-6c51-44f2-b07e-38f35e97ed2d'::uuid, 2026, NULL, 113.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, '555b3b3b-0c1f-493a-a4d6-332ff4564e86'::uuid, 2026, NULL, 1.03, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, '710b9c42-85c0-4137-bc45-3d2faf720189'::uuid, 2026, NULL, 319.9, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, 'e9361303-b1f4-4294-a310-a7fcb6918d8c'::uuid, 2026, NULL, 4.55, 34, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, '197f10a6-35b0-4e21-a317-6d423c9c411b'::uuid, 2026, NULL, 95.5, 44, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, 'a561671e-06dd-4362-b34e-0238999a9889'::uuid, 2026, NULL, 76.5, 34, TRUE, 'dummy_operational_ux_cml_2026'),

  -- Solicitação de Lugar em Feira (licenças ocasionais já é real, não repetido)
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, '0b30f2bd-643e-409a-861b-61ad13913702'::uuid, 2026, NULL, 177.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, 'a081f7cb-43b1-467d-bad2-42a58670d4fd'::uuid, 2026, NULL, 117.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, '3c3f0c46-5fb5-44d6-96ae-fe5893b17e86'::uuid, 2026, NULL, 18.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, 'aa66baf8-b2b1-4943-bda8-99038132e723'::uuid, 2026, NULL, 57.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, '8536bc2a-6c51-44f2-b07e-38f35e97ed2d'::uuid, 2026, NULL, 16.0, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, '555b3b3b-0c1f-493a-a4d6-332ff4564e86'::uuid, 2026, NULL, 1.62, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, '710b9c42-85c0-4137-bc45-3d2faf720189'::uuid, 2026, NULL, 346.6, NULL, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, '5e3efc99-134c-4c04-a314-b82c5e74fd28'::uuid, 2026, NULL, 4.08, 32, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, 'e9361303-b1f4-4294-a310-a7fcb6918d8c'::uuid, 2026, NULL, 4.28, 43, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, '197f10a6-35b0-4e21-a317-6d423c9c411b'::uuid, 2026, NULL, 97.6, 42, TRUE, 'dummy_operational_ux_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, 'a561671e-06dd-4362-b34e-0238999a9889'::uuid, 2026, NULL, 92.0, 25, TRUE, 'dummy_operational_ux_cml_2026');
