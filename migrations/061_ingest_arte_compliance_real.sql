-- 061_ingest_arte_compliance_real.sql
--
-- Caso "5. ARTE" do processo de verificação caso-a-caso (ver memória
-- cml-data-gap-reconciliation). Fonte: "ARTE and LCC - Matriz_ Questionário de
-- avaliação da conformidade do serviço.xlsx" (Microsoft Forms) — mesma família e
-- mesmo layout exato de colunas do ficheiro da ISS (migration 060): texto quase
-- exato das 43 perguntas oficiais (truncado a 199 carateres), mesmas 2 exceções de
-- redação/pontuação já confirmadas na migration 060 (mesmo conceito).
--
-- Já existia `migrations/020_ingest_compliance_arte.sql`, com o mesmo problema já
-- visto em ADC/ISS: só 9 das 43 perguntas oficiais mapeadas (ficheiro escrito quando
-- o catálogo ainda tinha um subconjunto menor de indicadores). Não tocada.
--
-- Respostas: 6 linhas no ficheiro. 1 é "CM Lisboa" / "Pedido de Certificado de
-- Registo de Cidadão da União Europeia" (fora de âmbito, mesma decisão já tomada na
-- migration 020) — excluída. As outras 5 são os mesmos 5 serviços ARTE já cobertos
-- pela migration 020 (Alteração de PIN CMD, Ativação CMD, Cancelamento CMD,
-- Desbloqueio CMD, Pedido de alteração de morada).
--
-- Achado: ao contrário da ISS (só 1 pergunta em branco), este ficheiro tem 7 perguntas
-- em branco em TODOS os 5 serviços — as 5 perguntas "São recolhidos dados sobre a
-- origem/objeto/tempos de resposta/tempos de resolução/resultado dos pedidos?" (só a
-- pergunta "número de pedidos" do mesmo grupo foi respondida) e "Se sim, os dados são
-- exportáveis?", mais a pergunta condicional "Se não, existe plano..." (não se aplica,
-- "página atualizada" foi respondida "Sim" nos 5). "Cancelamento CMD" tem mais 1 gap
-- próprio ("Possui os canais de acesso ao serviço?"). Gap real da ARTE, não de
-- ingestão — não inseridos.
--
-- Das 43 perguntas: 9 já estavam corretamente na BD (migration 020, não tocadas);
-- 134 novas medições inseridas por esta migration (27 indicadores para 4
-- serviços + 26 para "Cancelamento CMD", que tem 1 gap a mais).
--
-- Convenção de valor igual às migrations 020/037/057/059/060: Sim→100
-- ({"Sim":1,"Não":0}), Não→0 ({"Sim":0,"Não":1}), Não Aplicável→NULL
-- ({"Sim":0,"Não":0,"Não aplicável":1}). is_provisional=FALSE (resposta direta por
-- serviço, mesmo critério da migration 020). year=2026, month=NULL.

INSERT INTO org_ec.measurements (service_id, indicator_id, year, month, value, category_counts, is_provisional, source_file)
SELECT v.service_id, v.indicator_id, 2026, NULL, v.value, v.cc, FALSE, 'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx'
FROM (VALUES
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '3cff80fe-2adf-4a63-b36c-8b19da1c1913'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '5633f2a4-f244-447a-8193-0e49bab0d905'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '8ed08107-2be8-4d37-af61-1d1d518d5557'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, 'f832fd85-da3e-4b35-b098-af6fbbf195ab'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '6101ab5e-37e3-4b1e-a7da-57223610e633'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, 'd3d26f6f-dbc5-4e25-b591-f7a0413bce0a'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, 'd45d5384-da6c-4ff7-8e48-c47ad2c92b38'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '70e4b11e-a870-4242-95a5-f8dbde345d76'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '869cd058-45f4-4648-9561-4761408c4c6c'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '8ad8832a-ceeb-461e-b7c7-81d45b9304b3'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, 'c4af2b0d-dd33-4c27-8086-096d689599f6'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, 'b31909cf-0f8b-4779-bed1-4b88c50fd48c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '2386581e-a53f-4846-a57d-0dfee18f72fd'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, 'b24a5be7-f471-4d49-8182-36f965a965a1'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '0f87ba00-ea5c-414e-a8a4-baca169d8f89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, 'a747c612-ab93-4d76-b0d0-a3548517f6a0'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, 'eb89f49b-8f5d-4560-b291-712189086e89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, 'bec84499-616d-4d62-9a79-1932ef8023d8'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '0dcd4e39-92fb-4b6f-8a09-be252a4ed472'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, 'e2d83821-3251-4f13-bafb-9f9a8a78d59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '4fa71b6a-226f-4820-a56d-42046c2bd59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '267312f7-4c2b-4d9e-9589-1697288ff8a0'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, '367ed3d0-5bd7-44a0-89c6-37ac0ed00e8c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('a7eac0db-831c-4743-9a37-f6bae3104bc7'::uuid, 'c24dae6e-29c8-4c1d-8ace-92d2b1bda61e'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '3cff80fe-2adf-4a63-b36c-8b19da1c1913'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '5633f2a4-f244-447a-8193-0e49bab0d905'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '8ed08107-2be8-4d37-af61-1d1d518d5557'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, 'f832fd85-da3e-4b35-b098-af6fbbf195ab'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '6101ab5e-37e3-4b1e-a7da-57223610e633'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, 'd3d26f6f-dbc5-4e25-b591-f7a0413bce0a'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, 'd45d5384-da6c-4ff7-8e48-c47ad2c92b38'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '70e4b11e-a870-4242-95a5-f8dbde345d76'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '869cd058-45f4-4648-9561-4761408c4c6c'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '8ad8832a-ceeb-461e-b7c7-81d45b9304b3'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, 'c4af2b0d-dd33-4c27-8086-096d689599f6'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, 'b31909cf-0f8b-4779-bed1-4b88c50fd48c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '2386581e-a53f-4846-a57d-0dfee18f72fd'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, 'b24a5be7-f471-4d49-8182-36f965a965a1'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '0f87ba00-ea5c-414e-a8a4-baca169d8f89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, 'a747c612-ab93-4d76-b0d0-a3548517f6a0'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, 'eb89f49b-8f5d-4560-b291-712189086e89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, 'bec84499-616d-4d62-9a79-1932ef8023d8'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '0dcd4e39-92fb-4b6f-8a09-be252a4ed472'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, 'e2d83821-3251-4f13-bafb-9f9a8a78d59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '4fa71b6a-226f-4820-a56d-42046c2bd59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '267312f7-4c2b-4d9e-9589-1697288ff8a0'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, '367ed3d0-5bd7-44a0-89c6-37ac0ed00e8c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('33e1e112-62a4-4e65-b838-a4f3dd0b4868'::uuid, 'c24dae6e-29c8-4c1d-8ace-92d2b1bda61e'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '3cff80fe-2adf-4a63-b36c-8b19da1c1913'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '5633f2a4-f244-447a-8193-0e49bab0d905'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '8ed08107-2be8-4d37-af61-1d1d518d5557'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, 'f832fd85-da3e-4b35-b098-af6fbbf195ab'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '6101ab5e-37e3-4b1e-a7da-57223610e633'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, 'd3d26f6f-dbc5-4e25-b591-f7a0413bce0a'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, 'd45d5384-da6c-4ff7-8e48-c47ad2c92b38'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '70e4b11e-a870-4242-95a5-f8dbde345d76'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '869cd058-45f4-4648-9561-4761408c4c6c'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '8ad8832a-ceeb-461e-b7c7-81d45b9304b3'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, 'c4af2b0d-dd33-4c27-8086-096d689599f6'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, 'b31909cf-0f8b-4779-bed1-4b88c50fd48c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '2386581e-a53f-4846-a57d-0dfee18f72fd'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, 'b24a5be7-f471-4d49-8182-36f965a965a1'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '0f87ba00-ea5c-414e-a8a4-baca169d8f89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, 'a747c612-ab93-4d76-b0d0-a3548517f6a0'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, 'eb89f49b-8f5d-4560-b291-712189086e89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, 'bec84499-616d-4d62-9a79-1932ef8023d8'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '0dcd4e39-92fb-4b6f-8a09-be252a4ed472'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, 'e2d83821-3251-4f13-bafb-9f9a8a78d59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '4fa71b6a-226f-4820-a56d-42046c2bd59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '267312f7-4c2b-4d9e-9589-1697288ff8a0'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, '367ed3d0-5bd7-44a0-89c6-37ac0ed00e8c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3b0dbe5f-7d84-46ad-a17a-2af43e7a4d53'::uuid, 'c24dae6e-29c8-4c1d-8ace-92d2b1bda61e'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, '3cff80fe-2adf-4a63-b36c-8b19da1c1913'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, '5633f2a4-f244-447a-8193-0e49bab0d905'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, '44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, '8ed08107-2be8-4d37-af61-1d1d518d5557'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, 'f832fd85-da3e-4b35-b098-af6fbbf195ab'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, '6101ab5e-37e3-4b1e-a7da-57223610e633'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, 'd3d26f6f-dbc5-4e25-b591-f7a0413bce0a'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, 'd45d5384-da6c-4ff7-8e48-c47ad2c92b38'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, '70e4b11e-a870-4242-95a5-f8dbde345d76'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, '869cd058-45f4-4648-9561-4761408c4c6c'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, 'c4af2b0d-dd33-4c27-8086-096d689599f6'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, 'b31909cf-0f8b-4779-bed1-4b88c50fd48c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, '2386581e-a53f-4846-a57d-0dfee18f72fd'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, '1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, 'b24a5be7-f471-4d49-8182-36f965a965a1'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, '0f87ba00-ea5c-414e-a8a4-baca169d8f89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, 'a747c612-ab93-4d76-b0d0-a3548517f6a0'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, 'eb89f49b-8f5d-4560-b291-712189086e89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, 'bec84499-616d-4d62-9a79-1932ef8023d8'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, '0dcd4e39-92fb-4b6f-8a09-be252a4ed472'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, 'e2d83821-3251-4f13-bafb-9f9a8a78d59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, '4fa71b6a-226f-4820-a56d-42046c2bd59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, '267312f7-4c2b-4d9e-9589-1697288ff8a0'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, '367ed3d0-5bd7-44a0-89c6-37ac0ed00e8c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('3f488ec0-c71c-43ac-a2a1-8695d1b681ab'::uuid, 'c24dae6e-29c8-4c1d-8ace-92d2b1bda61e'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '3cff80fe-2adf-4a63-b36c-8b19da1c1913'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '5633f2a4-f244-447a-8193-0e49bab0d905'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '8ed08107-2be8-4d37-af61-1d1d518d5557'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, 'f832fd85-da3e-4b35-b098-af6fbbf195ab'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '6101ab5e-37e3-4b1e-a7da-57223610e633'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, 'd3d26f6f-dbc5-4e25-b591-f7a0413bce0a'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, 'd45d5384-da6c-4ff7-8e48-c47ad2c92b38'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '70e4b11e-a870-4242-95a5-f8dbde345d76'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '869cd058-45f4-4648-9561-4761408c4c6c'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '8ad8832a-ceeb-461e-b7c7-81d45b9304b3'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, 'c4af2b0d-dd33-4c27-8086-096d689599f6'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, 'b31909cf-0f8b-4779-bed1-4b88c50fd48c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '2386581e-a53f-4846-a57d-0dfee18f72fd'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, 'b24a5be7-f471-4d49-8182-36f965a965a1'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '0f87ba00-ea5c-414e-a8a4-baca169d8f89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, 'a747c612-ab93-4d76-b0d0-a3548517f6a0'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, 'eb89f49b-8f5d-4560-b291-712189086e89'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, 'bec84499-616d-4d62-9a79-1932ef8023d8'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '0dcd4e39-92fb-4b6f-8a09-be252a4ed472'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, 'e2d83821-3251-4f13-bafb-9f9a8a78d59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '4fa71b6a-226f-4820-a56d-42046c2bd59b'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '267312f7-4c2b-4d9e-9589-1697288ff8a0'::uuid, 0.0, '{"Sim": 0, "Não": 1}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, '367ed3d0-5bd7-44a0-89c6-37ac0ed00e8c'::uuid, 100.0, '{"Sim": 1, "Não": 0}'::jsonb),
('9e2cdf56-9650-45d5-8ed8-5d34cdba958d'::uuid, 'c24dae6e-29c8-4c1d-8ace-92d2b1bda61e'::uuid, NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'::jsonb)
) AS v(service_id, indicator_id, value, cc);
