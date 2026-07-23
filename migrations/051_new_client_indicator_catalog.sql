-- 051_new_client_indicator_catalog.sql
-- Novo catálogo de indicadores enviado pela cliente ("UX + compliance indicators
-- x Matrix dimensions.xlsx", separador Metadata, 49 linhas). Cruzado com os 36
-- indicadores compliance/UX já existentes: nada é removido, 19 perguntas novas
-- entram (todas de compliance) e 1 família de UX muda de dimensão.
--
-- Não apaga nada — só adiciona indicadores novos e faz 1 UPDATE de dimensão.
--
-- Onde o ficheiro novo agrupa várias perguntas numa só linha ("Se sim: 1... 2...
-- 3..."), seguimos a convenção já usada no catálogo (ex.: indicador
-- 0951ab7e.../periodicidade/exportável/documentação, migration 049): 1 indicador
-- "pai" (a pergunta-filtro) + 1 indicador "filho" por sub-pergunta. Sempre que a
-- mesma sub-pergunta já existia, com o texto completo, num ficheiro de respostas
-- anterior (LCC/ISS), usámos esse texto literal em vez de parafrasear o resumo
-- numerado do ficheiro novo.
--
-- channel_scope segue a convenção já usada nos 10 indicadores de compliance
-- existentes: 'Portal' só para os que são especificamente sobre o canal
-- digital/ficha online; 'Todos os canais' para os restantes (8 dos 10 atuais).

-- 1) Dois indicadores de Interoperabilidade (SSO federado; redirecionamento Gov.pt)
INSERT INTO public.indicators (description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, channel_scope)
VALUES
  ('O acesso ao serviço permite autenticação federada (Plataforma de Autenticação Única - SSO) através da Autenticação.gov, incluindo Cartão de Cidadão e Chave Móvel Digital?', 'c6254251-a492-4762-a79b-79f6f31a7a3d'::uuid, 'compliance', 'categorical_sim_nao', true, 'Portal'),
  ('Quando o cidadão se autentica através do Gov.pt, é redirigido automaticamente para o site do serviço, sem precisar autenticar-se novamente?', 'c6254251-a492-4762-a79b-79f6f31a7a3d'::uuid, 'compliance', 'categorical_sim_nao', true, 'Portal');

-- 2) Satisfação sobre assistência/resolução de problemas — pai + 6 sub-perguntas
INSERT INTO public.indicators (id, description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, channel_scope)
VALUES
  ('44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 'São recolhidos dados sobre a satisfação do utilizador sobre a qualidade dos serviços de assistência e de resolução de problemas do serviço?', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'compliance', 'categorical_sim_nao', true, 'Todos os canais');

INSERT INTO public.indicators (description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, parent_indicator_id, channel_scope)
VALUES
  ('Relativamente ao serviço de assistência e de resolução de problemas do serviço, são recolhidos dados sobre o número de pedidos?', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'compliance', 'categorical_sim_nao', true, '44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 'Todos os canais'),
  ('São recolhidos dados sobre a origem?', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'compliance', 'categorical_sim_nao', true, '44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 'Todos os canais'),
  ('São recolhidos dados sobre o objeto dos pedidos feitos?', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'compliance', 'categorical_sim_nao', true, '44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 'Todos os canais'),
  ('São recolhidos dados sobre os tempos de resposta?', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'compliance', 'categorical_sim_nao', true, '44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 'Todos os canais'),
  ('São recolhidos dados sobre os tempos de resolução?', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'compliance', 'categorical_sim_nao', true, '44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 'Todos os canais'),
  ('São recolhidos dados sobre o resultado dos pedidos?', '0202cd14-b407-45bb-b815-9a2d7e79c863'::uuid, 'compliance', 'categorical_sim_nao', true, '44ca5aed-a702-447f-aa94-ad149a717f25'::uuid, 'Todos os canais');

-- 3) Acompanhamento digital do pedido (Simplicidade)
INSERT INTO public.indicators (description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, channel_scope)
VALUES
  ('O utilizador, nacional ou estrangeiro, pode acompanhar digitalmente o estado do pedido, consultar histórico/notificações e obter informação sobre próximos passos, sem depender de outros canais?', 'e3dca1ca-02b6-4c56-8bf3-2430359ff90c'::uuid, 'compliance', 'categorical_sim_nao', true, 'Portal');

-- 4) Ficha/página informativa do serviço — pai + 9 sub-perguntas
INSERT INTO public.indicators (id, description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, channel_scope)
VALUES
  ('c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 'Existe ficha ou página informativa atualizada sobre o serviço?', 'e3dca1ca-02b6-4c56-8bf3-2430359ff90c'::uuid, 'compliance', 'categorical_sim_nao', true, 'Portal');

INSERT INTO public.indicators (description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, parent_indicator_id, channel_scope)
VALUES
  ('Esta possui a data da última atualização?', 'e3dca1ca-02b6-4c56-8bf3-2430359ff90c'::uuid, 'compliance', 'categorical_sim_nao', true, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 'Portal'),
  ('Possui a entidade responsável pelo serviço?', 'e3dca1ca-02b6-4c56-8bf3-2430359ff90c'::uuid, 'compliance', 'categorical_sim_nao', true, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 'Portal'),
  ('Possui os requisitos necessários para aceder ao serviço?', 'e3dca1ca-02b6-4c56-8bf3-2430359ff90c'::uuid, 'compliance', 'categorical_sim_nao', true, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 'Portal'),
  ('Possui os documentos necessários a apresentar?', 'e3dca1ca-02b6-4c56-8bf3-2430359ff90c'::uuid, 'compliance', 'categorical_sim_nao', true, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 'Portal'),
  ('Possui os custos associados à realização do serviço?', 'e3dca1ca-02b6-4c56-8bf3-2430359ff90c'::uuid, 'compliance', 'categorical_sim_nao', true, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 'Portal'),
  ('Possui os prazos expectáveis para a realização das fases do serviço?', 'e3dca1ca-02b6-4c56-8bf3-2430359ff90c'::uuid, 'compliance', 'categorical_sim_nao', true, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 'Portal'),
  ('Possui os canais de acesso ao serviço?', 'e3dca1ca-02b6-4c56-8bf3-2430359ff90c'::uuid, 'compliance', 'categorical_sim_nao', true, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 'Portal'),
  ('Possui as formas de acompanhamento do serviço?', 'e3dca1ca-02b6-4c56-8bf3-2430359ff90c'::uuid, 'compliance', 'categorical_sim_nao', true, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 'Portal'),
  ('Possui os meios de contacto oficiais do serviço?', 'e3dca1ca-02b6-4c56-8bf3-2430359ff90c'::uuid, 'compliance', 'categorical_sim_nao', true, 'c204cb96-bfcd-4d32-a18d-6e895d7cc343'::uuid, 'Portal');

-- 5) Dados analíticos da ficha no gov.pt (Capacidade de Resposta e Eficiência)
INSERT INTO public.indicators (description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, channel_scope)
VALUES
  ('Estão disponíveis ou são monitorizados dados analíticos relativos às visitas à ficha do serviço no gov.pt, incluindo volume, origem e evolução temporal?', 'af9c9613-62aa-4465-9de8-765ebb143559'::uuid, 'compliance', 'categorical_sim_nao', true, 'Portal');

-- 6) Seguimento condicional do indicador Ágora Design System/Mosaico já existente
INSERT INTO public.indicators (description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, parent_indicator_id, channel_scope)
VALUES
  ('Se não, existe plano ou calendarização para essa atualização?', 'daa9c740-af9a-45a0-b0f8-2e99ff635477'::uuid, 'compliance', 'categorical_sim_nao', true, '37732d56-b185-47ca-a827-71a327d524cd'::uuid, 'Portal');

-- 7) Pontos de contacto visíveis — pai + seguimento condicional (Acessibilidade)
INSERT INTO public.indicators (id, description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, channel_scope)
VALUES
  ('1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52'::uuid, 'O serviço disponibiliza pontos de contacto visíveis, atualizados e acessíveis — e-mail, telefone, formulário ou canal equivalente — com indicação de finalidade?', 'daa9c740-af9a-45a0-b0f8-2e99ff635477'::uuid, 'compliance', 'categorical_sim_nao', true, 'Todos os canais');

INSERT INTO public.indicators (description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, parent_indicator_id, channel_scope)
VALUES
  ('Se sim, existe horário ou tempo expectável de resposta e alternativa de apoio?', 'daa9c740-af9a-45a0-b0f8-2e99ff635477'::uuid, 'compliance', 'categorical_sim_nao', true, '1bbdedcd-4ef5-4b64-8e98-a73fa85e5a52'::uuid, 'Todos os canais');

-- 8) Segurança da Informação e Dados Abertos — dimensão ainda sem nenhum indicador (5 novos)
INSERT INTO public.indicators (description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, channel_scope)
VALUES
  ('Antes da recolha de dados pessoais, é fornecida informação sobre a identidade e os contactos do responsável pelo tratamento?', '6682d5cd-9e0d-4a9f-a786-710f76e4a9fe'::uuid, 'compliance', 'categorical_sim_nao', true, 'Todos os canais'),
  ('Quando existam dados públicos, anonimizados e reutilizáveis gerados pelo serviço, estes estão publicados ou referenciados no dados.gov.pt, com metadados, formato aberto, condições de reutilização e periodicidade de atualização?', '6682d5cd-9e0d-4a9f-a786-710f76e4a9fe'::uuid, 'compliance', 'categorical_sim_nao', true, 'Portal'),
  ('A plataforma usada para prestar o serviço foi desenvolvida com base em práticas de desenvolvimento seguro (por exemplo, autenticação forte, controlo de acesso, revisão de código e testes de segurança)?', '6682d5cd-9e0d-4a9f-a786-710f76e4a9fe'::uuid, 'compliance', 'categorical_sim_nao', true, 'Portal'),
  ('Quando o tratamento de dados pessoais se baseia no consentimento, o titular pode retirá-lo por mecanismo tão simples quanto o da sua prestação, ficando registados data, hora, canal e efeitos da retirada?', '6682d5cd-9e0d-4a9f-a786-710f76e4a9fe'::uuid, 'compliance', 'categorical_sim_nao', true, 'Todos os canais'),
  ('Está disponível canal claro para o exercício dos direitos dos titulares dos dados e para pedidos de informação sobre o tratamento de dados pessoais no âmbito do serviço, incluindo contacto do encarregado de proteção de dados quando aplicável?', '6682d5cd-9e0d-4a9f-a786-710f76e4a9fe'::uuid, 'compliance', 'categorical_sim_nao', true, 'Todos os canais');

-- 9) Envolvimento dos Utilizadores — dimensão ainda sem nenhum indicador (4 novos)
INSERT INTO public.indicators (description, thematic_priority_id, type_of_indicator, value_type, is_mandatory, channel_scope)
VALUES
  ('Nos locais de atendimento presencial está visível a informação sobre o Livro de Reclamações/Livro Amarelo e a plataforma eletrónica aplicável, permitindo ao cidadão apresentar reclamações, elogios e sugestões?', '93dbacd6-f67a-4f1a-8d9e-35a716af5735'::uuid, 'compliance', 'categorical_sim_nao', true, 'Todos os canais'),
  ('Está disponível informação, interna ou publicamente, sobre o desempenho do serviço — níveis de serviço, tempos médios, satisfação do utilizador, duração, taxa de conclusão ou volume de pedidos?', '93dbacd6-f67a-4f1a-8d9e-35a716af5735'::uuid, 'compliance', 'categorical_sim_nao', true, 'Todos os canais'),
  ('Existe informação documentada ou publicamente disponível sobre a participação de utilizadores e partes interessadas no desenho, teste ou melhoria do serviço digital?', '93dbacd6-f67a-4f1a-8d9e-35a716af5735'::uuid, 'compliance', 'categorical_sim_nao', true, 'Todos os canais'),
  ('Os procedimentos de reclamação, sugestão e pedido de apoio são compreensíveis para cidadãos estrangeiros, incluindo informação em inglês ou encaminhamento para apoio adequado, quando aplicável?', '93dbacd6-f67a-4f1a-8d9e-35a716af5735'::uuid, 'compliance', 'categorical_sim_nao', true, 'Todos os canais');

-- 10) Reclassificação de dimensão pedida pela cliente: a família "Agendamento"
-- (UX) estava em Simplicidade; o ficheiro novo coloca-a em Acessibilidade.
-- Não apaga nem altera medições — só o thematic_priority_id do indicador.
UPDATE public.indicators
SET thematic_priority_id = 'daa9c740-af9a-45a0-b0f8-2e99ff635477'::uuid
WHERE id IN (
  '638f6811-4ef5-4097-ba78-21bdad14866b'::uuid, -- Realizou um agendamento para este serviço?
  '3d45cd63-a288-4aae-a260-6214ffde77ea'::uuid, -- Se "Não, mas tentei": que problemas encontrou?
  '9593bb15-4fd3-4a92-9f39-a540321aa3c7'::uuid, -- facilidade de agendamento para data adequada
  'f21b4261-433b-4357-b4fd-3b4a4aee1014'::uuid  -- foi fácil perceber como efetuar o agendamento?
);
