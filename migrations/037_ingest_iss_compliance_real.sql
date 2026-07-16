-- Ingestão de compliance REAL para 4 serviços da ISS (primeira vez que a ISS
-- recebe dados reais de compliance — os restantes 18 serviços da ISS mantêm-se
-- com o valor fictício/placeholder já existente, sem qualquer alteração).
-- Fonte: "LCC and ISS - Matriz_ Questionário de avaliação da conformidade do
-- serviço (17-21).xlsx" (Microsoft Forms), respostas com ID 18-21.
-- ID 17 (CM Lisboa, "Pedido de Recolha de Monstros") é dado de teste — não ingerido.
--
-- Mapeamento de serviço confirmado com o cliente:
--   "Abono de Família para Crianças e Jovens" (ficheiro) = "Abono de Família
--   para Crianças e Jovens - Majorações" (catálogo)
--   "Subsídio Parental Inicial" (ficheiro) = "Abono parental inicial" (catálogo)
--
-- O indicador composto (periodicidade + exportável + documentação) é derivado
-- com E lógico das 3 perguntas equivalentes do ficheiro (aqui já separadas em
-- colunas distintas, ao contrário do ficheiro anterior da ARTE).
--
-- 1 resposta por serviço -> is_provisional = false (mesmo critério da ARTE).

DELETE FROM org_iss.measurements m
USING (VALUES
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'37732d56-b185-47ca-a827-71a327d524cd'::uuid),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'4850d9fb-1934-4759-b084-27523d453856'::uuid),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'88467533-a43c-4e47-8293-62320cf47b2d'::uuid),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'37732d56-b185-47ca-a827-71a327d524cd'::uuid),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'4850d9fb-1934-4759-b084-27523d453856'::uuid),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'88467533-a43c-4e47-8293-62320cf47b2d'::uuid),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'37732d56-b185-47ca-a827-71a327d524cd'::uuid),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'4850d9fb-1934-4759-b084-27523d453856'::uuid),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'88467533-a43c-4e47-8293-62320cf47b2d'::uuid),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'37732d56-b185-47ca-a827-71a327d524cd'::uuid),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'4850d9fb-1934-4759-b084-27523d453856'::uuid),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'88467533-a43c-4e47-8293-62320cf47b2d'::uuid),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid)
) AS v(service_id, indicator_id)
WHERE m.service_id = v.service_id AND m.indicator_id = v.indicator_id AND m.year = 2026
  AND m.month IS NULL AND m.channel IS NULL AND m.geo_level IS NULL AND m.geo_name IS NULL;

INSERT INTO org_iss.measurements (service_id, indicator_id, year, month, value, category_counts, is_provisional, source_file)
VALUES
  -- Abono de Família para Crianças e Jovens - Majorações (ID 18 do ficheiro) — todas Sim
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'37732d56-b185-47ca-a827-71a327d524cd'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'4850d9fb-1934-4759-b084-27523d453856'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'88467533-a43c-4e47-8293-62320cf47b2d'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid,'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  -- Abono parental inicial / "Subsídio Parental Inicial" no ficheiro (ID 19)
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid,2026,NULL,0.0,'{"Sim": 0, "Não": 1}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'37732d56-b185-47ca-a827-71a327d524cd'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'4850d9fb-1934-4759-b084-27523d453856'::uuid,2026,NULL,0.0,'{"Sim": 0, "Não": 1}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'88467533-a43c-4e47-8293-62320cf47b2d'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid,'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  -- Pensão de velhice (ID 20)
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid,2026,NULL,0.0,'{"Sim": 0, "Não": 1}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'37732d56-b185-47ca-a827-71a327d524cd'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'4850d9fb-1934-4759-b084-27523d453856'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'88467533-a43c-4e47-8293-62320cf47b2d'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid,'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  -- Pensão de invalidez (ID 21)
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'0e8c5ac1-9e2e-48de-852f-92a5636a1549'::uuid,2026,NULL,0.0,'{"Sim": 0, "Não": 1}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'37732d56-b185-47ca-a827-71a327d524cd'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'4850d9fb-1934-4759-b084-27523d453856'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'88467533-a43c-4e47-8293-62320cf47b2d'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'),
  ('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid,'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid,2026,NULL,100.0,'{"Sim": 1, "Não": 0}',false,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx');
