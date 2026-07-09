-- Renomeia a entidade "Espaço Cidadão" (short_name='ec') para "ARTE", a pedido do
-- responsável do projeto. Só o nome de apresentação muda — short_name/schema (org_ec)
-- mantêm-se, para não obrigar a renomear esquemas/relações em toda a base de dados.

UPDATE organizations SET name = 'ARTE' WHERE short_name = 'ec';
