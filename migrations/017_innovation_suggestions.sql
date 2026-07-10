-- Popula innovation_suggestions (tabela já existente, aprovada em docs/data-schema.md)
-- com conteúdo real da ARTE, para a secção "Como Inovar para Melhorar o Indicador?"
-- no detalhe do indicador. Substitui os 3 cartões mock fixos.
-- Fonte: "Boas práticas - Inovação ARTE.xlsx" (Google Drive, partilhado pela ARTE).
--
-- Decisão do responsável do projeto: sugestões associadas à Dimensão (thematic_priority_id),
-- não a um indicador específico (indicator_id fica NULL) — o Excel organiza o conteúdo por
-- dimensão, partilhado por todos os indicadores dessa dimensão; não há dados que suportem
-- uma associação 1-para-1 com indicadores individuais.
--
-- Nota: o Excel também tinha sugestões para "Interoperabilidade", "Segurança da
-- Informação e Dados Abertos" e "Envolvimento dos Utilizadores" — dimensões que
-- não existem na plataforma atual. Por decisão do responsável do projeto, essas
-- ficam de fora por agora (não foram inventadas nem forçadas para outra dimensão).

INSERT INTO innovation_suggestions (thematic_priority_id, title, description, saber_mais_url, display_order)
SELECT tp.id, v.title, v.description, v.saber_mais_url, v.display_order
FROM (VALUES
  ('Satisfação e Impacto', 1, 'Prioritize Necessidades e Expectativas dos Utilizadores', 'Prioritize as necessidades de alto nível e as expectativas dos utilizadores, de modo a organizar e direcionar o trabalho de implementação do serviço público digital.', NULL),
  ('Satisfação e Impacto', 2, 'Fazer atividades de melhoria contínua para todos os aspetos do serviço', 'Dado que as necessidades não são estanques no tempo, a melhoria contínua vai evitar que os serviços se tornem obsoletos, de um ponto de vista de utilidade, e vai identificar potenciais atualizações a serem realizadas.', NULL),
  ('Procura', 1, 'Teste o seu serviço para diferentes cenários através do "Túnel de Vento"', 'Através do exercício do "Túnel de Vento" é possível testar a preparação do seu serviço para diferentes cenários de stress do seu serviço e inclusive desenhar estratégias de mitigação de risco e preparação da situação.', 'https://www.dpmc.govt.nz/our-programmes/policy-project/policy-tools/futures-thinking/wind-tunnelling'),
  ('Acessibilidade', 1, 'Disponibilize Estacionamento Reservado para Pessoas com Deficiência', 'Disponibilize lugares sinalizados para pessoas com deficiência próximas da entrada principal.', NULL),
  ('Acessibilidade', 2, 'Adote uma Sinalização Inclusiva', 'Utilize sinalética com alto contraste e piso tátil para orientar pessoas com baixa visão. A sinalização deve ser clara e compreensível por todos.', NULL),
  ('Acessibilidade', 3, 'Garanta uma Entrada Acessível', 'Assegure-se de que existem rampas com inclinação adequada e portas largas de fácil abertura. O acesso principal ao serviço deve ser utilizável por todos, sem barreiras.', NULL),
  ('Acessibilidade', 4, 'Criar mapas de empatia e desenhar a jornada do utilizador', 'Crie mapas de empatia e desenhe a jornada do utilizador, tendo em conta as diferentes necessidades de acessibilidade. A documentação das informações recolhidas será útil durante a implementação do serviço público digital.', NULL),
  ('Acessibilidade', 5, 'Cumprir os requisitos do selo de ouro', 'Assegurar o cumprimento dos requisitos do Selo de Ouro de Usabilidade e Acessibilidade ao aplicar as melhores práticas em sítios web e aplicações móveis.', 'https://mosaico.gov.pt/guias-praticos/como-aderir-selo-usabilidade-acessibilidade'),
  ('Acessibilidade', 6, 'Utilizar ferramentas de tradução automática', 'Recomenda-se a utilização de ferramentas de tradução automática, com preferência às ferramentas disponibilizadas pela Comissão Europeia, para traduzir os serviços públicos digitais.

Estas ferramentas:

Garantem a segurança e confidencialidade dos conteúdos traduzidos, ao manter os direitos de propriedade intelectual do proprietário original
Estão otimizadas para a tradução de textos de maior rigor, como as legislação ou os procedimentos administrativos público
Podem ser utilizadas por qualquer funcionário público da União Europeia
traduzem de forma rápida todas as línguas oficiais da União Europeia (UE) e também Árabe, Chinês, Islandês, Japonês, Norueguês, Russo, Turco e Ucraniano
São compatíveis com uma grande variedade de formatos (.doc, .pdf, entre outros)
Estão em constante evolução', NULL),
  ('Simplicidade', 1, 'Facilite o Acesso e Utilização do Serviço Online', 'Garanta que o acesso ao serviço online é possível através de uma plataforma digital simples, intuitiva e acessível a todos.', NULL),
  ('Simplicidade', 2, 'Divulgue o Serviço Online', 'Informe os cidadãos sobre a existência e as vantagens do serviço online em diferentes canais de comunicação.', NULL),
  ('Simplicidade', 3, 'Simplificar a linguagem e as terminologias técnicas', 'Simplificar ao máximo a linguagem e as terminologias técnicas utilizadas ao longo das várias etapas do serviço. Lembre-se de que as pessoas não precisam de conhecer o funcionamento interno do Estado para conseguir utilizar o serviço.', 'https://mosaico.gov.pt/areas-tecnicas/usabilidade'),
  ('Simplicidade', 4, 'Promover a simplicidade na comunicação visual e nos conteúdos', 'Promover a simplicidade não apenas no texto, mas também na comunicação visual. O conteúdo deve manter uma linha condutora coerente e contínua em todas as páginas do serviço.', 'https://mosaico.gov.pt/ferramentas/agora-design-system'),
  ('Imparcialidade e Profissionalismo', 1, 'Guia para serviços públicos baseados em direitos humanos', 'Desenvolvido a partir dos “Princípios orientadores para uma abordagem aos serviços públicos baseada em Direitos Humanos”, apresentados pela Presidência Portuguesa do Conselho da União Europeia em 2021, este guia disponibiliza uma metodologia prática para que dirigentes e responsáveis da administração pública integrem os direitos humanos no redesenho e avaliação dos seus serviços, com o envolvimento ativo de todas as partes interessadas ao longo do processo.', 'https://www.arte.gov.pt/wp-content/uploads/2026/05/KITS_Guia-SPDH-LabX_20260521.pdf'),
  ('Capacidade de Resposta e Desempenho', 1, 'Faça uma Gestão Inteligente do Atendimento', 'Adote sistemas de agendamento eficientes, com, por exemplo, análise de procura, para adaptar os recursos disponíveis às necessidades.', NULL)
) AS v(dimensao, display_order, title, description, saber_mais_url)
JOIN thematic_priorities tp ON tp.name_pt = v.dimensao;
