-- Reordena as 7 dimensões existentes segundo a ordem canónica das 9 dimensões da matriz
-- e insere as 3 dimensões em falta (Clareza, Proatividade, Envolvimento das partes interessadas).
-- "Procura" não faz parte das 9 dimensões da matriz: mantém-se na tabela (tem indicadores associados)
-- mas passa a display_order 99 para ser excluída das listagens de dimensões na UI.

UPDATE thematic_priorities SET display_order = 1 WHERE name_pt = 'Satisfação e Impacto';
UPDATE thematic_priorities SET display_order = 2 WHERE name_pt = 'Acessibilidade';
UPDATE thematic_priorities SET display_order = 3 WHERE name_pt = 'Simplicidade';
UPDATE thematic_priorities SET display_order = 5 WHERE name_pt = 'Imparcialidade e Profissionalismo';
UPDATE thematic_priorities SET display_order = 6 WHERE name_pt = 'Capacidade de Resposta e Desempenho';
UPDATE thematic_priorities SET display_order = 7 WHERE name_pt = 'Integração e Continuidade';
UPDATE thematic_priorities SET display_order = 99 WHERE name_pt = 'Procura';

INSERT INTO thematic_priorities (name_pt, name_en, description, icon_name, display_order)
SELECT 'Clareza', 'Clarity',
       'O serviço fornece a informação numa linguagem que é fácil de entender.',
       'clareza.svg', 4
WHERE NOT EXISTS (SELECT 1 FROM thematic_priorities WHERE name_pt = 'Clareza');

INSERT INTO thematic_priorities (name_pt, name_en, description, icon_name, display_order)
SELECT 'Proatividade', 'Proactivity',
       'O serviço inicia o primeiro contacto com o utilizador, antecipando as suas necessidades e obrigações.',
       'proatividade.svg', 8
WHERE NOT EXISTS (SELECT 1 FROM thematic_priorities WHERE name_pt = 'Proatividade');

INSERT INTO thematic_priorities (name_pt, name_en, description, icon_name, display_order)
SELECT 'Envolvimento das partes interessadas', 'Stakeholder Engagement',
       'O serviço possuí um envolvimento inclusivo e significativo das partes interessadas em todas as fases de design.',
       'envolvimento.svg', 9
WHERE NOT EXISTS (SELECT 1 FROM thematic_priorities WHERE name_pt = 'Envolvimento das partes interessadas');
