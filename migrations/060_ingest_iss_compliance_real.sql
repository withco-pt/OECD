-- 060_ingest_iss_compliance_real.sql
--
-- Caso "4. ISS" do processo de verificação caso-a-caso (ver memória
-- cml-data-gap-reconciliation). Fonte: "LCC and ISS - Matriz_ Questionário de
-- avaliação da conformidade do serviço (17-21).xlsx" (Microsoft Forms), mesma sheet
-- já usada na migration 037 — mas aquela só tinha mapeado 10 das 43 perguntas
-- oficiais de compliance (ficheiro escrito quando o catálogo ainda só tinha um
-- subconjunto menor de indicadores). Ao contrário do ficheiro da ADC (caso 3,
-- migration 059), este ficheiro usa o texto quase exato das 43 perguntas oficiais
-- (só truncado a 199 carateres, mesmo padrão dos ficheiros CML/ARTE) — permitiu
-- reaproveitar a mesma técnica de matching por prefixo normalizado da migration 057,
-- com 2 exceções confirmadas manualmente (colunas com pontuação/redação levemente
-- diferente da oficial, mesmo conceito).
--
-- Respostas: 5 linhas no ficheiro (IDs 17-21). ID 17 é "CM Lisboa" (dado de teste,
-- Pedido de Recolha de Monstros) — excluído, mesma decisão da migration 037. IDs 18-21
-- são 4 serviços reais da ISS: "Abono de Família para Crianças e Jovens" (= "Abono de
-- Família para Crianças e Jovens - Majorações" no catálogo), "Subsídio Parental
-- Inicial" (= "Abono parental inicial"), "Pensão de velhice", "Pensão de invalidez" —
-- mesmo mapeamento de serviço já confirmado com a cliente na migration 037.
--
-- Das 43 perguntas, 42 têm resposta no ficheiro (10 já estavam corretamente na BD,
-- da migration 037 — não tocadas; 32 novos indicadores inseridos por esta migration,
-- iguais para os 4 serviços = 128 medições). A pergunta "Se não, existe plano ou
-- calendarização para essa atualização?" ficou em branco nos 4 serviços (segue a
-- pergunta condicional "Existe ficha/página informativa atualizada?", respondida
-- "Sim" pelos 4 — o "se não" não se aplica) — não inserida, não é uma medição real.
--
-- Isto cobre pela primeira vez, com dados reais, TODAS as 7 dimensões da matriz para
-- a ISS (incluindo Segurança da Informação e Dados Abertos, Envolvimento dos
-- Utilizadores e o checklist "Possui os/as..." de Simplicidade, que no caso da ADC
-- tinham ficado sem resposta no ficheiro).
--
-- Convenção de valor (igual à já usada na migration 037/057/059): Sim→100
-- ({"Sim":1,"Não":0}), Não→0 ({"Sim":0,"Não":1}), Não Aplicável→NULL
-- ({"Sim":0,"Não":0,"Não aplicável":1}). is_provisional=FALSE (1 resposta direta por
-- serviço, mesmo critério já usado na migration 037). year=2026, month=NULL.

INSERT INTO org_iss.measurements (service_id, indicator_id, year, month, value, category_counts, is_provisional, source_file)
SELECT v.service_id, v.indicator_id, 2026, NULL, v.value, v.cc, FALSE, 'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx'
FROM (VALUES
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '3cff80fe-2adf-4a63-b36c-8b19da1c1913'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '5633f2a4-f244-447a-8193-0e49bab0d905'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '8ed08107-2be8-4d37-af61-1d1d518d5557'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '3fbf29de-24a9-4899-ab6b-3a03836a9a02'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '3d94dc8b-5c53-4250-9d64-228548b6cc3c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '25cfb297-fad4-4eae-b071-92c65a87e14a'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, 'c3ff442d-34b2-499c-ac90-3e36ed13a19b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, 'c6c98ea4-955b-4974-afc1-85e74333bfc8'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, 'f832fd85-da3e-4b35-b098-af6fbbf195ab'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '6101ab5e-37e3-4b1e-a7da-57223610e633'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, 'd3d26f6f-dbc5-4e25-b591-f7a0413bce0a'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, 'd45d5384-da6c-4ff7-8e48-c47ad2c92b38'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '70e4b11e-a870-4242-95a5-f8dbde345d76'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '869cd058-45f4-4648-9561-4761408c4c6c'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '8ad8832a-ceeb-461e-b7c7-81d45b9304b3'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, 'c4af2b0d-dd33-4c27-8086-096d689599f6'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, 'b31909cf-0f8b-4779-bed1-4b88c50fd48c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '2386581e-a53f-4846-a57d-0dfee18f72fd'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, 'b24a5be7-f471-4d49-8182-36f965a965a1'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '0f87ba00-ea5c-414e-a8a4-baca169d8f89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, 'a747c612-ab93-4d76-b0d0-a3548517f6a0'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, 'eb89f49b-8f5d-4560-b291-712189086e89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, 'bec84499-616d-4d62-9a79-1932ef8023d8'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '0dcd4e39-92fb-4b6f-8a09-be252a4ed472'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, 'e2d83821-3251-4f13-bafb-9f9a8a78d59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '4fa71b6a-226f-4820-a56d-42046c2bd59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '267312f7-4c2b-4d9e-9589-1697288ff8a0'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, '367ed3d0-5bd7-44a0-89c6-37ac0ed00e8c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('bcafb8a1-a3db-48c1-a6bb-e48ad6375b81'::uuid, 'c24dae6e-29c8-4c1d-8ace-92d2b1bda61e'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '3cff80fe-2adf-4a63-b36c-8b19da1c1913'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '5633f2a4-f244-447a-8193-0e49bab0d905'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '8ed08107-2be8-4d37-af61-1d1d518d5557'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '3fbf29de-24a9-4899-ab6b-3a03836a9a02'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '3d94dc8b-5c53-4250-9d64-228548b6cc3c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '25cfb297-fad4-4eae-b071-92c65a87e14a'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, 'c3ff442d-34b2-499c-ac90-3e36ed13a19b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, 'c6c98ea4-955b-4974-afc1-85e74333bfc8'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, 'f832fd85-da3e-4b35-b098-af6fbbf195ab'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '6101ab5e-37e3-4b1e-a7da-57223610e633'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, 'd3d26f6f-dbc5-4e25-b591-f7a0413bce0a'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, 'd45d5384-da6c-4ff7-8e48-c47ad2c92b38'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '70e4b11e-a870-4242-95a5-f8dbde345d76'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '869cd058-45f4-4648-9561-4761408c4c6c'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '8ad8832a-ceeb-461e-b7c7-81d45b9304b3'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, 'c4af2b0d-dd33-4c27-8086-096d689599f6'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, 'b31909cf-0f8b-4779-bed1-4b88c50fd48c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '2386581e-a53f-4846-a57d-0dfee18f72fd'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, 'b24a5be7-f471-4d49-8182-36f965a965a1'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '0f87ba00-ea5c-414e-a8a4-baca169d8f89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, 'a747c612-ab93-4d76-b0d0-a3548517f6a0'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, 'eb89f49b-8f5d-4560-b291-712189086e89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, 'bec84499-616d-4d62-9a79-1932ef8023d8'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '0dcd4e39-92fb-4b6f-8a09-be252a4ed472'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, 'e2d83821-3251-4f13-bafb-9f9a8a78d59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '4fa71b6a-226f-4820-a56d-42046c2bd59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '267312f7-4c2b-4d9e-9589-1697288ff8a0'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, '367ed3d0-5bd7-44a0-89c6-37ac0ed00e8c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cc964c9c-47ff-4b17-867e-4fb09448c741'::uuid, 'c24dae6e-29c8-4c1d-8ace-92d2b1bda61e'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '3cff80fe-2adf-4a63-b36c-8b19da1c1913'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '5633f2a4-f244-447a-8193-0e49bab0d905'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '8ed08107-2be8-4d37-af61-1d1d518d5557'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '3fbf29de-24a9-4899-ab6b-3a03836a9a02'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '3d94dc8b-5c53-4250-9d64-228548b6cc3c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '25cfb297-fad4-4eae-b071-92c65a87e14a'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, 'c3ff442d-34b2-499c-ac90-3e36ed13a19b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, 'c6c98ea4-955b-4974-afc1-85e74333bfc8'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, 'f832fd85-da3e-4b35-b098-af6fbbf195ab'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '6101ab5e-37e3-4b1e-a7da-57223610e633'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, 'd3d26f6f-dbc5-4e25-b591-f7a0413bce0a'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, 'd45d5384-da6c-4ff7-8e48-c47ad2c92b38'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '70e4b11e-a870-4242-95a5-f8dbde345d76'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '869cd058-45f4-4648-9561-4761408c4c6c'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '8ad8832a-ceeb-461e-b7c7-81d45b9304b3'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, 'c4af2b0d-dd33-4c27-8086-096d689599f6'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, 'b31909cf-0f8b-4779-bed1-4b88c50fd48c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '2386581e-a53f-4846-a57d-0dfee18f72fd'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, 'b24a5be7-f471-4d49-8182-36f965a965a1'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '0f87ba00-ea5c-414e-a8a4-baca169d8f89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, 'a747c612-ab93-4d76-b0d0-a3548517f6a0'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, 'eb89f49b-8f5d-4560-b291-712189086e89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, 'bec84499-616d-4d62-9a79-1932ef8023d8'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '0dcd4e39-92fb-4b6f-8a09-be252a4ed472'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, 'e2d83821-3251-4f13-bafb-9f9a8a78d59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '4fa71b6a-226f-4820-a56d-42046c2bd59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '267312f7-4c2b-4d9e-9589-1697288ff8a0'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, '367ed3d0-5bd7-44a0-89c6-37ac0ed00e8c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('cf1becbf-0157-497e-bda8-62fce6645f9e'::uuid, 'c24dae6e-29c8-4c1d-8ace-92d2b1bda61e'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '3cff80fe-2adf-4a63-b36c-8b19da1c1913'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '5633f2a4-f244-447a-8193-0e49bab0d905'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '8ed08107-2be8-4d37-af61-1d1d518d5557'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '3fbf29de-24a9-4899-ab6b-3a03836a9a02'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '3d94dc8b-5c53-4250-9d64-228548b6cc3c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '25cfb297-fad4-4eae-b071-92c65a87e14a'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, 'c3ff442d-34b2-499c-ac90-3e36ed13a19b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, 'c6c98ea4-955b-4974-afc1-85e74333bfc8'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, 'f832fd85-da3e-4b35-b098-af6fbbf195ab'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '6101ab5e-37e3-4b1e-a7da-57223610e633'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, 'd3d26f6f-dbc5-4e25-b591-f7a0413bce0a'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, 'd45d5384-da6c-4ff7-8e48-c47ad2c92b38'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '70e4b11e-a870-4242-95a5-f8dbde345d76'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '869cd058-45f4-4648-9561-4761408c4c6c'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '8ad8832a-ceeb-461e-b7c7-81d45b9304b3'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, 'c4af2b0d-dd33-4c27-8086-096d689599f6'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, 'b31909cf-0f8b-4779-bed1-4b88c50fd48c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '2386581e-a53f-4846-a57d-0dfee18f72fd'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, 'b24a5be7-f471-4d49-8182-36f965a965a1'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '0f87ba00-ea5c-414e-a8a4-baca169d8f89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, 'a747c612-ab93-4d76-b0d0-a3548517f6a0'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, 'eb89f49b-8f5d-4560-b291-712189086e89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, 'bec84499-616d-4d62-9a79-1932ef8023d8'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '0dcd4e39-92fb-4b6f-8a09-be252a4ed472'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, 'e2d83821-3251-4f13-bafb-9f9a8a78d59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '4fa71b6a-226f-4820-a56d-42046c2bd59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '267312f7-4c2b-4d9e-9589-1697288ff8a0'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, '367ed3d0-5bd7-44a0-89c6-37ac0ed00e8c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('e5ff21c8-4f06-4eab-9b81-489139026e13'::uuid, 'c24dae6e-29c8-4c1d-8ace-92d2b1bda61e'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb)
) AS v(service_id, indicator_id, value, cc);
