-- Completa innovation_suggestions com as 14 sugestões que a migration 017 tinha
-- deixado de fora "por decisão do responsável do projeto" — pela mesma razão da
-- migration 018 (case_studies): nessa altura, as dimensões "Interoperabilidade",
-- "Segurança da Informação e Dados Abertos" e "Envolvimento dos Utilizadores" ainda
-- não existiam na plataforma. Passaram a existir com as migrations 032/033 e ninguém
-- voltou a inserir estas sugestões depois disso — mesmo problema identificado pelo
-- cliente para os Casos de Estudo (2026-07-16), aplicado aqui à secção "Como Inovar
-- para Melhorar o Indicador?".
--
-- Fonte: "Boas práticas - Inovação ARTE.xlsx" (docs/Blue section squares/), folha
-- "Suggestions", linhas "Interoperabilidade", "Segurança da Informação e Dados
-- Abertos" e "Envolvimento dos Utilizadores". Cada célula tinha o formato
-- "Título: ...; Descrição: ...; Link: ..." — extraído programaticamente.

INSERT INTO innovation_suggestions (thematic_priority_id, title, description, saber_mais_url, display_order)
SELECT tp.id, v.title, v.description, v.saber_mais_url, v.display_order
FROM (VALUES
  ('Interoperabilidade', 1, 'Integre o Serviço de Autenticação', 'Deve utilizar o Serviço de Autenticação como componente de autenticação, de obtenção de atributos, e para fornecer dados qualificados sobre o utilizador.', NULL),
  ('Interoperabilidade', 2, 'Disponibilize e Reutilize Dados Abertos', 'Disponibilize os dados abertos preferencialmente sob a forma de conjuntos, em formatos passíveis de leitura por mecanismos automatizados, através de ferramentas abertas, para que possam ser reutilizados, transformados ou integrados por qualquer cidadão ou entidade.', NULL),
  ('Interoperabilidade', 3, 'Implemente uma Autenticação Multifator', 'Implemente uma autenticação multifator, de modo a proporcionar um nível adicional de segurança, uma vez que está demonstrado que muitos dos ataques cibernéticos são causados pelo comprometimento de contas.', NULL),
  ('Interoperabilidade', 4, 'Partilhar dados de forma segura entre entidades com OOTS', 'O Once-Only Technical System (OOTS) é um projeto da União Europeia (UE) que permite a troca automática de documentos e dados entre entidades públicas de diferentes Estados-Membro, sem que o cidadão ou a empresa tenha de fornecer a mesma informação várias vezes.

Implementado ao abrigo do Regulamento do Single Digital Gateway (SDG), o OOTS facilita os processos para quem se muda, trabalha ou estuda noutro noutro país da UE, ao simplificar procedimentos administrativos transfronteiriços.', NULL),
  ('Interoperabilidade', 5, 'Criar um modelo de dados e identificar pontos de convergência', 'Definir uma visão geral de todos os dados necessários ao serviço, criar um modelo de dados e identificar pontos de convergência.

Assim, os documentos e dados solicitados podem ser partilhados com outros serviços que necessitem da mesma informação.', NULL),
  ('Segurança da Informação e Dados Abertos', 1, 'Estabelecer um nível de segurança da informação em todos os serviços da organização', 'Definir um nível mínimo comum de segurança da informação e promover uma cultura de segurança em toda a organização, ao reforçar a resiliência perante riscos de cibersegurança.', 'https://www.cncs.gov.pt/docs/guia-de-gestao-dos-riscos.pdf'),
  ('Segurança da Informação e Dados Abertos', 2, 'Ser transparente no tratamento dos dados pessoais', 'Disponibilizar informação clara às pessoas e às empresas sobre o tratamento dos seus dados, incluindo finalidades, fundamentos legais e direitos associados, usando linguagem simples.', 'https://ec.europa.eu/newsroom/article29/items/622227/en'),
  ('Segurança da Informação e Dados Abertos', 3, 'Avaliar os riscos e definir as medidas de segurança no tratamento dos dados', 'Avaliar os riscos associados à utilização e ao tratamento dos dados e definir os protocolos de segurança que devem ser seguidos para mitigar estes riscos.', 'https://ec.europa.eu/newsroom/article29/items/611236/en'),
  ('Segurança da Informação e Dados Abertos', 4, 'Envolver as equipas com competências complementares', 'Trabalhar com equipas multidisciplinares na área da segurança da informação e dos dados pessoais, de forma colaborativa e responsabilidades definidas.', 'https://joinup.ec.europa.eu/sites/default/files/document/2022-01/Issue%20paper%20-%20Multidisciplinary%20teams%20for%20digital-ready%20policymaking_0.pdf'),
  ('Segurança da Informação e Dados Abertos', 5, 'Facilitar o acesso aos dados de forma livre e aberta', 'Promover a disponibilização dos dados de forma livre e aberta, não obrigando a nenhum tipo de registo ou pedido de reutilização, para poderem ser facilmente descarregados e reutilizados.', 'https://dataeuropa.gitlab.io/data-provider-manual/recommendations-for-improving/'),
  ('Segurança da Informação e Dados Abertos', 6, 'Publicar dados do serviço', 'Publicar dados – não só descritivos e de utilização do serviço, mas também dados sobre a forma como as pessoas/empresas usam o serviço (sem identificar ninguém, claro).', 'https://data.europa.eu/pt/publicacoes/open-data-impact'),
  ('Segurança da Informação e Dados Abertos', 7, 'Disponibilize e Reutilize Dados Abertos', 'Disponibilize os dados abertos preferencialmente sob a forma de conjuntos, em formatos passíveis de leitura por mecanismos automatizados, através de ferramentas abertas, para que possam ser reutilizados, transformados ou integrados por qualquer cidadão ou entidade.', NULL),
  ('Envolvimento dos Utilizadores', 1, 'Realize Testes de Usabilidade', 'Teste e avalie o processo de registo com utilizadores para identificar oportunidades de melhoria.', NULL),
  ('Envolvimento dos Utilizadores', 2, 'Realize dinâmicas com grupos de utilizadores', 'Promova atividades com grupos de utilizadores para criar empatia e identificar necessidades e expetativas relativamente ao serviço público digital. Pode recorrer a:

Focus groups
Workshops de design thinking
Observação da experiência de utilização
Inquéritos
Entrevistas
Desk research', NULL)
) AS v(dimensao, display_order, title, description, saber_mais_url)
JOIN thematic_priorities tp ON tp.name_pt = v.dimensao;
