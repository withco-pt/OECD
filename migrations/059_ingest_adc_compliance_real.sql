-- 059_ingest_adc_compliance_real.sql
--
-- Caso "3. ADC" do processo de verificação caso-a-caso (ver memória
-- cml-data-gap-reconciliation). Fonte: docs/ADC/Recolha_Dados_Compliance_Matriz_ADC.xlsx,
-- sheet "2. Indicadores Compliance" (43 linhas, 1 resposta por pergunta para a entidade
-- toda — não distingue os 2 serviços da ADC).
--
-- Achado: ao contrário dos ficheiros CML/ARTE/ISS (que usam o texto exato das 43
-- perguntas oficiais, só truncado a 199 carateres), o ficheiro da ADC usa uma redação
-- própria e mais antiga das perguntas — não bate por texto exato com o catálogo. Foi
-- feito mapeamento semântico linha a linha (43 perguntas do ficheiro vs. 43 indicadores
-- oficiais de compliance), aprovado por David em 2026-07-24:
--
--   27 de 43 perguntas têm correspondência clara no ficheiro:
--     7 já estavam corretamente na BD (fonte 'adc_compliance_autoavaliacao_2026',
--     origem não rastreável — não está em nenhuma migration do repositório, mas os
--     valores conferem com o ficheiro, por isso não foram tocados).
--     20 indicadores novos, inseridos por esta migration (linha do ficheiro → indicador):
--       row 2  "Formulário pré-preenchido"                    → 79d2668b (JÁ EXISTIA)
--       row 3  "Exige documentos já disponíveis"               → 4850d9fb (JÁ EXISTIA)
--       row 4  "Omnicanal"                                     → f6662b5a (JÁ EXISTIA)
--       row 5  "Autenticação federada (SSO)"                   → 3cff80fe (NOVO)
--       row 6  "Redirect automático Gov.pt"                    → 5633f2a4 (NOVO)
--       row 13 "Satisfação qualidade do serviço"                → 0951ab7e (JÁ EXISTIA)
--       row 15 "Satisfação serviços de assistência"             → 44ca5aed (NOVO)
--       row 21 "Nº/origem/objeto dos pedidos" (1 resposta p/ 3 indicadores) → 8ed08107, 3fbf29de, 3d94dc8b (NOVOS)
--       row 22 "Dados analíticos visitas à ficha gov.pt"        → 2386581e (NOVO)
--       row 28 "Acompanhar estado do pedido digitalmente"       → c24dae6e (NOVO)
--       row 29 "Página informativa atualizada" (1 resposta p/ 2 indicadores) → c204cb96, f832fd85 (NOVOS)
--       row 31 "Disponível na LC/Espaço Cidadão"                → 88467533 (JÁ EXISTIA)
--       row 32 "Disponível em inglês"                           → 4c03f8e5 (JÁ EXISTIA)
--       row 33 "Ágora Design System"                            → 37732d56 (JÁ EXISTIA)
--       row 35 "Pontos de contacto visíveis"                    → 1bbdedcd (NOVO)
--       row 36 "Info antes da recolha de dados pessoais"        → 0f87ba00 (NOVO)
--       row 37 "Dados partilhados no dados.gov.pt"              → a747c612 (NOVO)
--       row 38 "Práticas de desenvolvimento seguro"             → eb89f49b (NOVO)
--       row 39 "Mecanismo para retirar consentimento"           → bec84499 (NOVO)
--       row 40 "Canal para pedidos sobre dados pessoais"        → 0dcd4e39 (NOVO)
--       row 41 "Livro Amarelo visível"                          → e2d83821 (NOVO)
--       row 42 "Info sobre desempenho do serviço"                → 4fa71b6a (NOVO — nota: o
--         próprio ficheiro da ADC classifica esta pergunta como "Não-compliance", mas o
--         conteúdo bate exatamente com um indicador oficial de compliance. É exatamente
--         este tipo de discrepância de classificação interna que explica a reclamação da
--         cliente sobre indicadores "em falta".)
--       row 43 "Participação de utilizadores no desenho do serviço" → 267312f7 (NOVO,
--         mesma nota acima — ficheiro classifica como "Não-compliance")
--       row 44 "Procedimentos de reclamação para estrangeiros"   → 367ed3d0 (NOVO)
--
--   16 de 43 perguntas NÃO têm equivalente no ficheiro (não inseridas, gap real da ADC,
--   não de ingestão):
--     - 8 perguntas "Possui os/as..." (entidade responsável, formas de acompanhamento,
--       canais de acesso, custos, documentos necessários, meios de contacto oficiais,
--       prazos expectáveis, requisitos) — checklist da ficha de serviço, sem pergunta
--       correspondente no ficheiro de autoavaliação da ADC.
--     - 3 perguntas sobre dados de resultado/tempos de resolução/tempos de resposta dos
--       pedidos (só "número/origem/objeto" foi perguntado, não "resultado" nem "tempos").
--     - 4 perguntas condicionais "Se sim/não, ..." (periodicidade definida, dados
--       exportáveis, documentação de uso dos dados, plano de atualização, horário de
--       resposta) — sem resposta explícita no ficheiro.
--
-- Achado à parte, corrigido nesta migration: existia 1 medição órfã ("Se sim, tem
-- periodicidade definida?", source_file NULL, sem correspondência em nenhuma pergunta
-- deste ficheiro) com valores CONTRADITÓRIOS entre os 2 serviços da ADC (Apoio=Não,
-- Registo=Sim) — sem origem rastreável em nenhuma migration do repositório. Removida
-- por decisão de David (2026-07-24), por não ter suporte no ficheiro de origem atual.
--
-- Convenção de valor: Sim→100 (category_counts {"Sim":1,"Não":0}), Não→0
-- ({"Sim":0,"Não":1}), Não Aplicável→NULL ({"Sim":0,"Não":0,"Não aplicável":1}) — mesma
-- convenção já usada nas 7 medições existentes desta mesma entidade.
-- O ficheiro é 1 resposta única para toda a "Balcão dos Fundos" (não distingue os 2
-- serviços) — aplicado a ambos, is_provisional=TRUE, year=2026, month=NULL, mesma
-- convenção já usada nas 7 medições existentes.

-- ── 1) Remover medição órfã sem correspondência no ficheiro ────────────────────
DELETE FROM org_adc.measurements
WHERE indicator_id = (SELECT id FROM public.indicators WHERE description = 'Se sim, tem periodicidade definida?')
  AND source_file IS NULL;

-- ── 2) Inserir os 20 indicadores novos, para os 2 serviços ─────────────────────
INSERT INTO org_adc.measurements (service_id, indicator_id, year, month, value, category_counts, is_provisional, source_file)
SELECT s.id, v.indicator_id::uuid, 2026, NULL, v.value::numeric, v.cc::jsonb, TRUE, 'adc_compliance_autoavaliacao_2026'
FROM org_adc.services s
CROSS JOIN (VALUES
  ('3cff80fe-2adf-4a63-b36c-8b19da1c1913', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 5
  ('5633f2a4-f244-447a-8193-0e49bab0d905', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 6
  ('44ca5aed-a702-447f-aa94-ad149a717f25', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 15
  ('8ed08107-2be8-4d37-af61-1d1d518d5557', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 21
  ('3fbf29de-24a9-4899-ab6b-3a03836a9a02', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 21
  ('3d94dc8b-5c53-4250-9d64-228548b6cc3c', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 21
  ('2386581e-a53f-4846-a57d-0dfee18f72fd', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 22
  ('c24dae6e-29c8-4c1d-8ace-92d2b1bda61e', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 28
  ('c204cb96-bfcd-4d32-a18d-6e895d7cc343', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 29
  ('f832fd85-da3e-4b35-b098-af6fbbf195ab', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 29
  ('1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 35
  ('0f87ba00-ea5c-414e-a8a4-baca169d8f89', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 36
  ('a747c612-ab93-4d76-b0d0-a3548517f6a0', 0.0, '{"Sim": 0, "Não": 1}'),                            -- row 37
  ('eb89f49b-8f5d-4560-b291-712189086e89', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 38
  ('bec84499-616d-4d62-9a79-1932ef8023d8', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 39
  ('0dcd4e39-92fb-4b6f-8a09-be252a4ed472', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 40
  ('e2d83821-3251-4f13-bafb-9f9a8a78d59b', NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}'),       -- row 41
  ('4fa71b6a-226f-4820-a56d-42046c2bd59b', 0.0, '{"Sim": 0, "Não": 1}'),                            -- row 42
  ('267312f7-4c2b-4d9e-9589-1697288ff8a0', 100.0, '{"Sim": 1, "Não": 0}'),                          -- row 43
  ('367ed3d0-5bd7-44a0-89c6-37ac0ed00e8c', NULL, '{"Sim": 0, "Não": 0, "Não aplicável": 1}')        -- row 44
) AS v(indicator_id, value, cc);
