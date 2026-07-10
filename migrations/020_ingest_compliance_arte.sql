-- Ingestão de Compliance (conformidade) dos 5 serviços ARTE.
-- Fonte: "ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx" (Microsoft Forms).
-- Snapshot de conformidade (Julho 2026). Respostas Sim/Não guardadas como category_counts
-- ({"Sim":1,"Não":0} ou {"Sim":0,"Não":1}) + value = % de Sim, seguindo a convenção da BD.
-- Ver docs/data-study-data02.md.
--
-- Mapeamento: 7 indicadores de compliance correspondem 1:1 a uma coluna do formulário;
-- o indicador composto ("Se sim: periodicidade + exportáveis + documentação") é registado
-- como "Não" (a condição de todas cumpridas falha nos 5 serviços: periodicidade=Não, documentação=Não).
-- CM Lisboa (fora de âmbito) e Ficheiro C (dados de teste) NÃO são ingeridos.

INSERT INTO org_ec.measurements
  (service_id, indicator_id, year, month, channel, geo_level, geo_name, value, category_counts, is_provisional, source_file)
SELECT s.id, i.id, 2026, 7, NULL, NULL, NULL, v.value,
       jsonb_build_object('Sim', v.sim, 'Não', v.nao),
       false, 'ARTE and LCC - Matriz_ Questionário de avaliação da conformidade do serviço.xlsx'
FROM (VALUES
  ('Alteração de PIN da Chave Móvel Digital', 'O serviço exige ao cidadão a apresentação de documentos ou informação já disponíveis noutros serviços/organismos da Administração Pública, quando possam ser obtidos oficiosamente ou por interoperabilidade?', 0, 1, 0),
  ('Pedido de alteração de morada', 'O serviço exige ao cidadão a apresentação de documentos ou informação já disponíveis noutros serviços/organismos da Administração Pública, quando possam ser obtidos oficiosamente ou por interoperabilidade?', 0, 1, 0),
  ('Desbloqueio da Chave Móvel Digital', 'O serviço exige ao cidadão a apresentação de documentos ou informação já disponíveis noutros serviços/organismos da Administração Pública, quando possam ser obtidos oficiosamente ou por interoperabilidade?', 0, 1, 0),
  ('Cancelamento da Chave Móvel Digital', 'O serviço exige ao cidadão a apresentação de documentos ou informação já disponíveis noutros serviços/organismos da Administração Pública, quando possam ser obtidos oficiosamente ou por interoperabilidade?', 0, 1, 0),
  ('Ativação da Chave Móvel Digital', 'O serviço exige ao cidadão a apresentação de documentos ou informação já disponíveis noutros serviços/organismos da Administração Pública, quando possam ser obtidos oficiosamente ou por interoperabilidade?', 0, 1, 0),
  ('Alteração de PIN da Chave Móvel Digital', 'O formulário eletrónico pré-preenche, sempre que aplicável, campos com dados que a entidade já detém ou que pode obter por interoperabilidade, evitando nova introdução pelo cidadão?', 1, 0, 100),
  ('Pedido de alteração de morada', 'O formulário eletrónico pré-preenche, sempre que aplicável, campos com dados que a entidade já detém ou que pode obter por interoperabilidade, evitando nova introdução pelo cidadão?', 1, 0, 100),
  ('Desbloqueio da Chave Móvel Digital', 'O formulário eletrónico pré-preenche, sempre que aplicável, campos com dados que a entidade já detém ou que pode obter por interoperabilidade, evitando nova introdução pelo cidadão?', 1, 0, 100),
  ('Cancelamento da Chave Móvel Digital', 'O formulário eletrónico pré-preenche, sempre que aplicável, campos com dados que a entidade já detém ou que pode obter por interoperabilidade, evitando nova introdução pelo cidadão?', 1, 0, 100),
  ('Ativação da Chave Móvel Digital', 'O formulário eletrónico pré-preenche, sempre que aplicável, campos com dados que a entidade já detém ou que pode obter por interoperabilidade, evitando nova introdução pelo cidadão?', 1, 0, 100),
  ('Alteração de PIN da Chave Móvel Digital', 'O serviço está integrado no modelo omnicanal aplicável, permitindo acesso ou encaminhamento através dos canais previstos — presencial, telefónico e digital — e garantindo continuidade da experiência entre canais, quando aplicável?', 1, 0, 100),
  ('Pedido de alteração de morada', 'O serviço está integrado no modelo omnicanal aplicável, permitindo acesso ou encaminhamento através dos canais previstos — presencial, telefónico e digital — e garantindo continuidade da experiência entre canais, quando aplicável?', 1, 0, 100),
  ('Desbloqueio da Chave Móvel Digital', 'O serviço está integrado no modelo omnicanal aplicável, permitindo acesso ou encaminhamento através dos canais previstos — presencial, telefónico e digital — e garantindo continuidade da experiência entre canais, quando aplicável?', 1, 0, 100),
  ('Cancelamento da Chave Móvel Digital', 'O serviço está integrado no modelo omnicanal aplicável, permitindo acesso ou encaminhamento através dos canais previstos — presencial, telefónico e digital — e garantindo continuidade da experiência entre canais, quando aplicável?', 1, 0, 100),
  ('Ativação da Chave Móvel Digital', 'O serviço está integrado no modelo omnicanal aplicável, permitindo acesso ou encaminhamento através dos canais previstos — presencial, telefónico e digital — e garantindo continuidade da experiência entre canais, quando aplicável?', 1, 0, 100),
  ('Alteração de PIN da Chave Móvel Digital', 'São recolhidos dados sobre a satisfação do utilizador sobre a qualidade do serviço?', 1, 0, 100),
  ('Pedido de alteração de morada', 'São recolhidos dados sobre a satisfação do utilizador sobre a qualidade do serviço?', 1, 0, 100),
  ('Desbloqueio da Chave Móvel Digital', 'São recolhidos dados sobre a satisfação do utilizador sobre a qualidade do serviço?', 1, 0, 100),
  ('Cancelamento da Chave Móvel Digital', 'São recolhidos dados sobre a satisfação do utilizador sobre a qualidade do serviço?', 1, 0, 100),
  ('Ativação da Chave Móvel Digital', 'São recolhidos dados sobre a satisfação do utilizador sobre a qualidade do serviço?', 1, 0, 100),
  ('Alteração de PIN da Chave Móvel Digital', 'Se sim, 1. tem periodicidade definida? 2. Os dados são exportáveis? 3. Há uma clara documentação da utilização desses dados para a melhoria do serviço?', 0, 1, 0),
  ('Pedido de alteração de morada', 'Se sim, 1. tem periodicidade definida? 2. Os dados são exportáveis? 3. Há uma clara documentação da utilização desses dados para a melhoria do serviço?', 0, 1, 0),
  ('Desbloqueio da Chave Móvel Digital', 'Se sim, 1. tem periodicidade definida? 2. Os dados são exportáveis? 3. Há uma clara documentação da utilização desses dados para a melhoria do serviço?', 0, 1, 0),
  ('Cancelamento da Chave Móvel Digital', 'Se sim, 1. tem periodicidade definida? 2. Os dados são exportáveis? 3. Há uma clara documentação da utilização desses dados para a melhoria do serviço?', 0, 1, 0),
  ('Ativação da Chave Móvel Digital', 'Se sim, 1. tem periodicidade definida? 2. Os dados são exportáveis? 3. Há uma clara documentação da utilização desses dados para a melhoria do serviço?', 0, 1, 0),
  ('Alteração de PIN da Chave Móvel Digital', 'O serviço está disponível através de atendimento digital assistido na rede de Lojas/Espaços Cidadão ou existe encaminhamento claro para o ponto de atendimento assistido competente?', 1, 0, 100),
  ('Pedido de alteração de morada', 'O serviço está disponível através de atendimento digital assistido na rede de Lojas/Espaços Cidadão ou existe encaminhamento claro para o ponto de atendimento assistido competente?', 1, 0, 100),
  ('Desbloqueio da Chave Móvel Digital', 'O serviço está disponível através de atendimento digital assistido na rede de Lojas/Espaços Cidadão ou existe encaminhamento claro para o ponto de atendimento assistido competente?', 1, 0, 100),
  ('Cancelamento da Chave Móvel Digital', 'O serviço está disponível através de atendimento digital assistido na rede de Lojas/Espaços Cidadão ou existe encaminhamento claro para o ponto de atendimento assistido competente?', 1, 0, 100),
  ('Ativação da Chave Móvel Digital', 'O serviço está disponível através de atendimento digital assistido na rede de Lojas/Espaços Cidadão ou existe encaminhamento claro para o ponto de atendimento assistido competente?', 1, 0, 100),
  ('Alteração de PIN da Chave Móvel Digital', 'O serviço está disponível em inglês?', 1, 0, 100),
  ('Pedido de alteração de morada', 'O serviço está disponível em inglês?', 1, 0, 100),
  ('Desbloqueio da Chave Móvel Digital', 'O serviço está disponível em inglês?', 1, 0, 100),
  ('Cancelamento da Chave Móvel Digital', 'O serviço está disponível em inglês?', 1, 0, 100),
  ('Ativação da Chave Móvel Digital', 'O serviço está disponível em inglês?', 1, 0, 100),
  ('Alteração de PIN da Chave Móvel Digital', 'O canal digital do serviço está alinhado com o Ágora Design System/Mosaico?', 1, 0, 100),
  ('Pedido de alteração de morada', 'O canal digital do serviço está alinhado com o Ágora Design System/Mosaico?', 1, 0, 100),
  ('Desbloqueio da Chave Móvel Digital', 'O canal digital do serviço está alinhado com o Ágora Design System/Mosaico?', 1, 0, 100),
  ('Cancelamento da Chave Móvel Digital', 'O canal digital do serviço está alinhado com o Ágora Design System/Mosaico?', 1, 0, 100),
  ('Ativação da Chave Móvel Digital', 'O canal digital do serviço está alinhado com o Ágora Design System/Mosaico?', 1, 0, 100)
) AS v(sname, idesc, sim, nao, value)
JOIN org_ec.services s ON btrim(s.name) = v.sname
JOIN indicators i ON i.description = v.idesc AND i.type_of_indicator = 'compliance';
