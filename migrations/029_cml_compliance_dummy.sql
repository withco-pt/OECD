-- 029_cml_compliance_dummy.sql
-- A pedido do David: repor dados fictícios de compliance para a CML (5 serviços × 8
-- perguntas), para permitir os testes de utilizador já planeados enquanto não há
-- resposta real da CML/ARTE a estas perguntas. Mesmo padrão de migrations
-- 024_iss_compliance_dummy.sql / 025_at_compliance_dummy.sql, mas marcado
-- is_provisional=TRUE e com source_file explícito para ser fácil de identificar e
-- substituir mais tarde por dados reais (ao contrário de 024/025, que não marcam).
-- Valores idênticos aos que estavam na migration 021 antes de terem sido apagados.

INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, value, category_counts, is_provisional, source_file)
VALUES
  -- Certidão de Licença de Utilização
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, '37732d56-b185-47ca-a827-71a327d524cd'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, '79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, '88467533-a43c-4e47-8293-62320cf47b2d'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, '4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, 'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, '4850d9fb-1934-4759-b084-27523d453856'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, '0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid, '0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),

  -- Pedido de Certificado de Registo de Cidadão da União Europeia
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, '37732d56-b185-47ca-a827-71a327d524cd'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, '79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, '88467533-a43c-4e47-8293-62320cf47b2d'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, '4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, 'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, '4850d9fb-1934-4759-b084-27523d453856'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, '0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid, '0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),

  -- Pedido de Recolha de Monstros
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, '37732d56-b185-47ca-a827-71a327d524cd'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, '79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, '88467533-a43c-4e47-8293-62320cf47b2d'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, '4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, 'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, '4850d9fb-1934-4759-b084-27523d453856'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, '0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid, '0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),

  -- Serviço de Recolha de Monstros
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, '37732d56-b185-47ca-a827-71a327d524cd'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, '79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, '88467533-a43c-4e47-8293-62320cf47b2d'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, '4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, 'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, '4850d9fb-1934-4759-b084-27523d453856'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, '0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a'::uuid, '0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),

  -- Solicitação de Lugar em Feira
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, '37732d56-b185-47ca-a827-71a327d524cd'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, '79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, '88467533-a43c-4e47-8293-62320cf47b2d'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, '4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, 'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, '4850d9fb-1934-4759-b084-27523d453856'::uuid, 2026, NULL, 100.0, '{"Sim": 1, "Não": 0}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, '0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026'),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid, '0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid, 2026, NULL, 0.0, '{"Sim": 0, "Não": 1}'::jsonb, TRUE, 'dummy_compliance_cml_2026');
