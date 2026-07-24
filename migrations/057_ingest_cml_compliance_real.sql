-- 057_ingest_cml_compliance_real.sql
--
-- Quinto caso da verificação caso-a-caso pedida pela cliente (ver memória
-- cml-data-gap-reconciliation) — "E. LCC Compliance Data". Este caso é maior que os
-- anteriores: cobre 4 entidades (LCC=CML, ARTE, ISS, ADC). A pedido do David, começamos
-- pela CML; ARTE/ISS/ADC ficam para casos seguintes.
--
-- Achado: o catálogo `public.indicators` já tinha os 43 indicadores de compliance
-- corretos (confirmado: 11 Satisfaction/Simplicity, 6 Accessibility, 5 Interoperability,
-- 5 Information Security and Open Data, 4 User Engagement, 1 Responsiveness — soma 43).
-- Não é um gap de catálogo — é puramente um gap de dados: a CML tinha 0 de 43 indicadores
-- com measurements, apesar de 4 dos seus 5 serviços terem respostas reais e completas nos
-- ficheiros de compliance já submetidos.
--
-- Fontes (docs/CML/LCC Compliance Data/, 3 ficheiros, mesmo layout de colunas nos 3 —
-- 1 linha por serviço/entidade respondente, colunas 8-50 = as 43 perguntas de compliance):
--   - "LCC - Matriz_...xlsx": Solicitação de Lugar em Feira + Certidão de Licença de
--     Utilização (+ linhas de teste da ISS: "gdgdgdrg"/"Teste"/"kk", ignoradas).
--   - "ARTE and LCC - Matriz_...xlsx": Pedido de Certificado de Registo de Cidadão da UE
--     (as 5 linhas de ARTE ficam para o caso seguinte).
--   - "LCC and ISS - Matriz_...xlsx" (idêntico a docs/Data/, confirmado por hash):
--     Pedido de Recolha de Monstros (as 4 linhas de ISS ficam para o caso seguinte).
--   Falta resposta para "Serviço de Recolha de Monstros" (o 5º serviço da CML) — não
--   está em nenhum dos 3 ficheiros.
--
-- Mapeamento de colunas → indicador: os cabeçalhos de coluna destes ficheiros estão
-- truncados a 199 carateres (com "..." literal no fim) face ao texto completo do
-- indicador no catálogo — mesmo tipo de truncagem já visto no ficheiro de nacionalidades
-- (migration 055). Mapeados por prefixo normalizado; 2 perguntas usam texto ligeiramente
-- parafraseado face à BD mas inequivocamente a mesma pergunta (confirmado manualmente):
--   - "...sem depender exclusivamente de at[endimento presencial]" (ficheiro) ==
--     "...sem depender de outros canais?" (BD, indicador c24dae6e)
--   - "...Ágora Design System/Mosaico." (ficheiro, termina em ponto) ==
--     "...Ágora Design System/Mosaico?" (BD, indicador 37732d56)
--
-- Convenção de valor (igual à já usada para compliance ARTE/ISS/ADC): 'Sim' → value=100,
-- category_counts={"Sim":1,"Não":0}; 'Não' → value=0, category_counts={"Sim":0,"Não":1}.
-- 'Não Aplicável' e células em branco (perguntas condicionais "Se sim/Se não" cujo pai
-- não se aplica) NÃO geram measurement — mesma convenção usada em toda a plataforma para
-- não-aplicável. year=2026, month=7 (mês real de "Completion time" das 4 respostas, todas
-- em julho de 2026). is_provisional=FALSE (respostas diretas e inequívocas, sem inferência).
--
-- Totais por serviço (de 43 possíveis): Feira 16 Sim/20 Não/4 NA/3 branco; Certidão 15
-- Sim/23 Não/1 NA/4 branco; Certificado UE 17 Sim/18 Não/4 NA/4 branco; Recolha de
-- Monstros (Pedido) 17 Sim/19 Não/3 NA/4 branco. Total: 145 linhas de measurement.

INSERT INTO org_cml.measurements (service_id, indicator_id, year, month, value, is_provisional, source_file, category_counts)
VALUES
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'4850d9fb-1934-4759-b084-27523d453856'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'3cff80fe-2adf-4a63-b36c-8b19da1c1913'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'44ca5aed-a702-447f-aa94-ad149a717f25'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'8ed08107-2be8-4d37-af61-1d1d518d5557'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'3fbf29de-24a9-4899-ab6b-3a03836a9a02'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'3d94dc8b-5c53-4250-9d64-228548b6cc3c'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'25cfb297-fad4-4eae-b071-92c65a87e14a'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c3ff442d-34b2-499c-ac90-3e36ed13a19b'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c6c98ea4-955b-4974-afc1-85e74333bfc8'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'f832fd85-da3e-4b35-b098-af6fbbf195ab'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'6101ab5e-37e3-4b1e-a7da-57223610e633'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'d3d26f6f-dbc5-4e25-b591-f7a0413bce0a'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'869cd058-45f4-4648-9561-4761408c4c6c'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'8ad8832a-ceeb-461e-b7c7-81d45b9304b3'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c4af2b0d-dd33-4c27-8086-096d689599f6'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'b31909cf-0f8b-4779-bed1-4b88c50fd48c'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'2386581e-a53f-4846-a57d-0dfee18f72fd'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'88467533-a43c-4e47-8293-62320cf47b2d'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'1a20bc5a-bcdd-4e46-98a6-3780ca5c4ea8'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'0f87ba00-ea5c-414e-a8a4-baca169d8f89'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'a747c612-ab93-4d76-b0d0-a3548517f6a0'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'eb89f49b-8f5d-4560-b291-712189086e89'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'bec84499-616d-4d62-9a79-1932ef8023d8'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'0dcd4e39-92fb-4b6f-8a09-be252a4ed472'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'e2d83821-3251-4f13-bafb-9f9a8a78d59b'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'4fa71b6a-226f-4820-a56d-42046c2bd59b'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'267312f7-4c2b-4d9e-9589-1697288ff8a0'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'367ed3d0-5bd7-44a0-89c6-37ac0ed00e8c'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'c24dae6e-29c8-4c1d-8ace-92d2b1bda61e'::uuid,2026,7,100,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5'::uuid,'37732d56-b185-47ca-a827-71a327d524cd'::uuid,2026,7,0,FALSE,'LCC and ISS - Matriz_ Questionário de avaliação da conformidade do serviço (17-21).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'4850d9fb-1934-4759-b084-27523d453856'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'44ca5aed-a702-447f-aa94-ad149a717f25'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'8ed08107-2be8-4d37-af61-1d1d518d5557'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'3fbf29de-24a9-4899-ab6b-3a03836a9a02'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'3d94dc8b-5c53-4250-9d64-228548b6cc3c'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'25cfb297-fad4-4eae-b071-92c65a87e14a'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'c3ff442d-34b2-499c-ac90-3e36ed13a19b'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'c6c98ea4-955b-4974-afc1-85e74333bfc8'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'f832fd85-da3e-4b35-b098-af6fbbf195ab'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'6101ab5e-37e3-4b1e-a7da-57223610e633'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'d3d26f6f-dbc5-4e25-b591-f7a0413bce0a'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'d45d5384-da6c-4ff7-8e48-c47ad2c92b38'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'70e4b11e-a870-4242-95a5-f8dbde345d76'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'869cd058-45f4-4648-9561-4761408c4c6c'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'8ad8832a-ceeb-461e-b7c7-81d45b9304b3'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'c4af2b0d-dd33-4c27-8086-096d689599f6'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'b31909cf-0f8b-4779-bed1-4b88c50fd48c'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'2386581e-a53f-4846-a57d-0dfee18f72fd'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'88467533-a43c-4e47-8293-62320cf47b2d'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'1a20bc5a-bcdd-4e46-98a6-3780ca5c4ea8'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'0f87ba00-ea5c-414e-a8a4-baca169d8f89'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'a747c612-ab93-4d76-b0d0-a3548517f6a0'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'bec84499-616d-4d62-9a79-1932ef8023d8'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'0dcd4e39-92fb-4b6f-8a09-be252a4ed472'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'e2d83821-3251-4f13-bafb-9f9a8a78d59b'::uuid,2026,7,100,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'4fa71b6a-226f-4820-a56d-42046c2bd59b'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'267312f7-4c2b-4d9e-9589-1697288ff8a0'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'367ed3d0-5bd7-44a0-89c6-37ac0ed00e8c'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'c24dae6e-29c8-4c1d-8ace-92d2b1bda61e'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('fd42da38-0851-46d4-8afc-4c96cabbf7cb'::uuid,'37732d56-b185-47ca-a827-71a327d524cd'::uuid,2026,7,0,FALSE,'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'4850d9fb-1934-4759-b084-27523d453856'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'44ca5aed-a702-447f-aa94-ad149a717f25'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'8ed08107-2be8-4d37-af61-1d1d518d5557'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'3fbf29de-24a9-4899-ab6b-3a03836a9a02'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'3d94dc8b-5c53-4250-9d64-228548b6cc3c'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'25cfb297-fad4-4eae-b071-92c65a87e14a'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'c3ff442d-34b2-499c-ac90-3e36ed13a19b'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'c6c98ea4-955b-4974-afc1-85e74333bfc8'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'f832fd85-da3e-4b35-b098-af6fbbf195ab'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'6101ab5e-37e3-4b1e-a7da-57223610e633'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'d3d26f6f-dbc5-4e25-b591-f7a0413bce0a'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'d45d5384-da6c-4ff7-8e48-c47ad2c92b38'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'70e4b11e-a870-4242-95a5-f8dbde345d76'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'869cd058-45f4-4648-9561-4761408c4c6c'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'8ad8832a-ceeb-461e-b7c7-81d45b9304b3'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'b31909cf-0f8b-4779-bed1-4b88c50fd48c'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'2386581e-a53f-4846-a57d-0dfee18f72fd'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'88467533-a43c-4e47-8293-62320cf47b2d'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'1a20bc5a-bcdd-4e46-98a6-3780ca5c4ea8'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'b24a5be7-f471-4d49-8182-36f965a965a1'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'0f87ba00-ea5c-414e-a8a4-baca169d8f89'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'a747c612-ab93-4d76-b0d0-a3548517f6a0'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'eb89f49b-8f5d-4560-b291-712189086e89'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'bec84499-616d-4d62-9a79-1932ef8023d8'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'0dcd4e39-92fb-4b6f-8a09-be252a4ed472'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'e2d83821-3251-4f13-bafb-9f9a8a78d59b'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'4fa71b6a-226f-4820-a56d-42046c2bd59b'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'267312f7-4c2b-4d9e-9589-1697288ff8a0'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'367ed3d0-5bd7-44a0-89c6-37ac0ed00e8c'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'c24dae6e-29c8-4c1d-8ace-92d2b1bda61e'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09'::uuid,'37732d56-b185-47ca-a827-71a327d524cd'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'4850d9fb-1934-4759-b084-27523d453856'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'79d2668b-dde1-496b-a6c7-b9db32ce0f0c'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'f6662b5a-3efe-4027-9d0b-d9516bddbf1d'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3cff80fe-2adf-4a63-b36c-8b19da1c1913'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'0951ab7e-d684-4cf6-be6a-48599556fa79'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'44ca5aed-a702-447f-aa94-ad149a717f25'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'8ed08107-2be8-4d37-af61-1d1d518d5557'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3fbf29de-24a9-4899-ab6b-3a03836a9a02'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'3d94dc8b-5c53-4250-9d64-228548b6cc3c'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'25cfb297-fad4-4eae-b071-92c65a87e14a'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'c3ff442d-34b2-499c-ac90-3e36ed13a19b'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'c6c98ea4-955b-4974-afc1-85e74333bfc8'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'f832fd85-da3e-4b35-b098-af6fbbf195ab'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'6101ab5e-37e3-4b1e-a7da-57223610e633'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'d3d26f6f-dbc5-4e25-b591-f7a0413bce0a'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'d45d5384-da6c-4ff7-8e48-c47ad2c92b38'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'70e4b11e-a870-4242-95a5-f8dbde345d76'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'869cd058-45f4-4648-9561-4761408c4c6c'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'8ad8832a-ceeb-461e-b7c7-81d45b9304b3'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'c4af2b0d-dd33-4c27-8086-096d689599f6'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'b31909cf-0f8b-4779-bed1-4b88c50fd48c'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'2386581e-a53f-4846-a57d-0dfee18f72fd'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'88467533-a43c-4e47-8293-62320cf47b2d'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'4c03f8e5-bbf4-4b3e-969d-155f3905ac0d'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'1a20bc5a-bcdd-4e46-98a6-3780ca5c4ea8'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'0f87ba00-ea5c-414e-a8a4-baca169d8f89'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'a747c612-ab93-4d76-b0d0-a3548517f6a0'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'eb89f49b-8f5d-4560-b291-712189086e89'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'bec84499-616d-4d62-9a79-1932ef8023d8'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'0dcd4e39-92fb-4b6f-8a09-be252a4ed472'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'e2d83821-3251-4f13-bafb-9f9a8a78d59b'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'4fa71b6a-226f-4820-a56d-42046c2bd59b'::uuid,2026,7,100,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 1, "Não": 0}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'267312f7-4c2b-4d9e-9589-1697288ff8a0'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'367ed3d0-5bd7-44a0-89c6-37ac0ed00e8c'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'c24dae6e-29c8-4c1d-8ace-92d2b1bda61e'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb),
  ('160b52e3-02ab-45d9-8564-24892cd71124'::uuid,'37732d56-b185-47ca-a827-71a327d524cd'::uuid,2026,7,0,FALSE,'LCC - Matriz_ Questionário de avaliação da conformidade do serviço (compliance).xlsx','{"Sim": 0, "Não": 1}'::jsonb);
