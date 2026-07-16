-- Atualiza nomes/descrições finais das 9 dimensões da matriz e reordena, com base na tabela
-- oficial fornecida (nome + descrição definitivos em português).
-- "Procura" volta a fazer parte das 9 dimensões (dimensão 2), pelo que deixa de ser excluída da UI.
-- "Clareza" e "Proatividade" deixam de existir como dimensões próprias (0 indicadores associados;
-- os seus conceitos foram absorvidos por "Simplicidade" e "Procura" respetivamente).
-- Nova dimensão "Segurança da Informação e Dados Abertos" (sem ícone dedicado ainda — usa o
-- fallback genérico já existente para dimensões sem icon_name).

UPDATE thematic_priorities SET
  display_order = 1,
  description = 'O serviço adota uma abordagem que visa melhorar a experiência dos utilizadores e permitir que estes alcancem os resultados pretendidos e satisfaçam as suas necessidades.'
WHERE name_pt = 'Satisfação e Impacto';

UPDATE thematic_priorities SET
  display_order = 2,
  description = 'O serviço pode gerir a procura ao longo do tempo através dos diferentes canais de prestação, incluindo de forma proativa quando apropriado, ajudando a informar e a adaptar as suas estratégias de prestação.'
WHERE name_pt = 'Procura';

UPDATE thematic_priorities SET
  display_order = 3,
  description = 'O serviço é plenamente acessível a todas as pessoas, independentemente do perfil do utilizador, da sua idade, localização ou qualquer tipo de deficiência.'
WHERE name_pt = 'Acessibilidade';

UPDATE thematic_priorities SET
  display_order = 4,
  description = 'O serviço é fácil de utilizar, reduz barreiras administrativas para o utilizador, e disponibiliza informação clara e fácil de entender.'
WHERE name_pt = 'Simplicidade';

UPDATE thematic_priorities SET
  display_order = 5,
  description = 'O serviço trata os utilizadores de forma justa, assegurando cortesia e respeito nas interações.'
WHERE name_pt = 'Imparcialidade e Profissionalismo';

UPDATE thematic_priorities SET
  name_pt = 'Capacidade de Resposta e Eficiência',
  display_order = 6,
  description = 'O serviço responde de forma rápida e eficaz às necessidades dos utilizadores.'
WHERE name_pt = 'Capacidade de Resposta e Desempenho';

UPDATE thematic_priorities SET
  name_pt = 'Interoperabilidade',
  display_order = 7,
  description = 'O serviço é coordenado com outros serviços para trabalharem juntos em benefício dos utilizadores, através da comunicação e da partilha de informação (cumprindo o princípio do "once-only"), apoiando a integração dos serviços sempre que necessário ao longo das jornadas e interações dos utilizadores.'
WHERE name_pt = 'Integração e Continuidade';

UPDATE thematic_priorities SET
  name_pt = 'Envolvimento dos Utilizadores',
  name_en = 'User Engagement',
  display_order = 9,
  description = 'O serviço apoia a participação dos utilizadores em todo o processo de conceção, prestação e melhoria do serviço.'
WHERE name_pt = 'Envolvimento das partes interessadas';

INSERT INTO thematic_priorities (name_pt, name_en, description, icon_name, display_order)
SELECT 'Segurança da Informação e Dados Abertos', 'Information Security and Open Data',
       'O serviço é apoiado por práticas adequadas de segurança da informação e está alinhado com as políticas de dados abertos.',
       NULL, 8
WHERE NOT EXISTS (SELECT 1 FROM thematic_priorities WHERE name_pt = 'Segurança da Informação e Dados Abertos');

DELETE FROM thematic_priorities WHERE name_pt IN ('Clareza', 'Proatividade');
