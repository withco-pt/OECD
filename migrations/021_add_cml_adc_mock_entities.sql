-- 021_add_cml_adc_mock_entities.sql
-- Novas entidades (dados sintéticos para testes de utilizador): Câmara Municipal de Lisboa e Agência para o Desenvolvimento e Coesão

INSERT INTO public.organizations (id, name, short_name, area_governamental, schema_name, active) VALUES ('628f4fff-9ceb-4025-afd1-b6c6d664359b', 'Agência para o Desenvolvimento e Coesão', 'adc', 'Economia e Coesão Territorial', 'org_adc', FALSE);
INSERT INTO public.organizations (id, name, short_name, area_governamental, schema_name, active) VALUES ('20a80027-3175-4557-a65e-4dcefb0f0e29', 'Câmara Municipal de Lisboa', 'cml', 'Administração Local', 'org_cml', FALSE);

CREATE SCHEMA org_adc;

CREATE TABLE org_adc.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_normalized TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    matriz_adotada BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (name_normalized, organization_id)
);

CREATE TABLE org_adc.measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES org_adc.services(id),
    indicator_id UUID NOT NULL REFERENCES public.indicators(id),
    year INTEGER NOT NULL,
    month INTEGER CHECK (month >= 1 AND month <= 12),
    channel TEXT,
    geo_level TEXT,
    geo_name TEXT,
    value NUMERIC,
    value_text TEXT,
    total_respondentes INTEGER,
    total_inquiridos INTEGER,
    is_provisional BOOLEAN NOT NULL DEFAULT FALSE,
    source_file TEXT,
    last_updated DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    category_counts JSONB,
    UNIQUE (service_id, indicator_id, year, month, channel, geo_level, geo_name)
);
CREATE INDEX idx_measurements_indicator ON org_adc.measurements USING btree (indicator_id);
CREATE INDEX idx_measurements_service ON org_adc.measurements USING btree (service_id);
CREATE INDEX idx_measurements_period ON org_adc.measurements USING btree (year, month);

CREATE TABLE org_adc.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE org_adc.comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES org_adc.users(id),
    name TEXT,
    service_ids UUID[] NOT NULL,
    indicator_ids UUID[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE org_adc.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES org_adc.users(id),
    entity_type TEXT NOT NULL CHECK (entity_type = ANY (ARRAY['service'::text, 'indicator'::text])),
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, entity_type, entity_id)
);

ALTER TABLE org_adc.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_adc.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_adc.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_adc.comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_adc.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY leitura_org ON org_adc.services FOR SELECT TO public USING (true);
CREATE POLICY leitura_org ON org_adc.measurements FOR SELECT TO public USING (true);
CREATE POLICY leitura_org ON org_adc.users FOR SELECT TO public USING (true);
CREATE POLICY leitura_org ON org_adc.comparisons FOR SELECT TO public USING (true);
CREATE POLICY leitura_org ON org_adc.user_favorites FOR SELECT TO public USING (true);

CREATE SCHEMA org_cml;

CREATE TABLE org_cml.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_normalized TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    matriz_adotada BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (name_normalized, organization_id)
);

CREATE TABLE org_cml.measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES org_cml.services(id),
    indicator_id UUID NOT NULL REFERENCES public.indicators(id),
    year INTEGER NOT NULL,
    month INTEGER CHECK (month >= 1 AND month <= 12),
    channel TEXT,
    geo_level TEXT,
    geo_name TEXT,
    value NUMERIC,
    value_text TEXT,
    total_respondentes INTEGER,
    total_inquiridos INTEGER,
    is_provisional BOOLEAN NOT NULL DEFAULT FALSE,
    source_file TEXT,
    last_updated DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    category_counts JSONB,
    UNIQUE (service_id, indicator_id, year, month, channel, geo_level, geo_name)
);
CREATE INDEX idx_measurements_indicator ON org_cml.measurements USING btree (indicator_id);
CREATE INDEX idx_measurements_service ON org_cml.measurements USING btree (service_id);
CREATE INDEX idx_measurements_period ON org_cml.measurements USING btree (year, month);

CREATE TABLE org_cml.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE org_cml.comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES org_cml.users(id),
    name TEXT,
    service_ids UUID[] NOT NULL,
    indicator_ids UUID[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE org_cml.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES org_cml.users(id),
    entity_type TEXT NOT NULL CHECK (entity_type = ANY (ARRAY['service'::text, 'indicator'::text])),
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, entity_type, entity_id)
);

ALTER TABLE org_cml.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_cml.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_cml.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_cml.comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_cml.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY leitura_org ON org_cml.services FOR SELECT TO public USING (true);
CREATE POLICY leitura_org ON org_cml.measurements FOR SELECT TO public USING (true);
CREATE POLICY leitura_org ON org_cml.users FOR SELECT TO public USING (true);
CREATE POLICY leitura_org ON org_cml.comparisons FOR SELECT TO public USING (true);
CREATE POLICY leitura_org ON org_cml.user_favorites FOR SELECT TO public USING (true);


INSERT INTO org_adc.services (id, name, name_normalized, organization_id) VALUES ('8f22b297-460f-4dfa-ad74-45aaed3a706d', 'Apoio ao Balcão dos Fundos', 'apoio ao balcão dos fundos', '628f4fff-9ceb-4025-afd1-b6c6d664359b');
INSERT INTO org_adc.services (id, name, name_normalized, organization_id) VALUES ('f20f03ae-8ad5-4f82-976d-12caa562f538', 'Registo no Balcão dos Fundos', 'registo no balcão dos fundos', '628f4fff-9ceb-4025-afd1-b6c6d664359b');
INSERT INTO org_cml.services (id, name, name_normalized, organization_id) VALUES ('160b52e3-02ab-45d9-8564-24892cd71124', 'Certidão de Licença de Utilização', 'certidão de licença de utilização', '20a80027-3175-4557-a65e-4dcefb0f0e29');
INSERT INTO org_cml.services (id, name, name_normalized, organization_id) VALUES ('636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', 'Pedido de Recolha de Monstros', 'pedido de recolha de monstros', '20a80027-3175-4557-a65e-4dcefb0f0e29');
INSERT INTO org_cml.services (id, name, name_normalized, organization_id) VALUES ('8908d4e4-cf22-4e29-ad98-55233f5b9e1a', 'Serviço de Recolha de Monstros', 'serviço de recolha de monstros', '20a80027-3175-4557-a65e-4dcefb0f0e29');
INSERT INTO org_cml.services (id, name, name_normalized, organization_id) VALUES ('fd42da38-0851-46d4-8afc-4c96cabbf7cb', 'Pedido de Certificado de Registo de Cidadão da União Europeia', 'pedido de certificado de registo de cidadão da união europeia', '20a80027-3175-4557-a65e-4dcefb0f0e29');
INSERT INTO org_cml.services (id, name, name_normalized, organization_id) VALUES ('8e4b22cb-3602-4174-8b51-a19d1b3fcd09', 'Solicitação de Lugar em Feira', 'solicitação de lugar em feira', '20a80027-3175-4557-a65e-4dcefb0f0e29');

INSERT INTO org_adc.measurements (id, service_id, indicator_id, year, month, channel, geo_level, geo_name, value, value_text, total_respondentes, total_inquiridos, category_counts) VALUES
('a917ca77-14ab-4312-9c4a-2c33b97e8de3', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '0e2341fa-ea68-4453-bebd-fe5af7be7c12', 2026, NULL, NULL, NULL, NULL, 3.98, NULL, 47, 49, NULL),
('4af23032-2cab-4617-a656-2f413f466729', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '0eb55c0c-ee11-45ed-9274-8c6815b716bd', 2026, NULL, NULL, NULL, NULL, 87.5, NULL, 16, 16, '{"Sim": 14, "Não": 2}'::jsonb),
('5419e825-b9e3-4cdd-973c-a21c39271e3b', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '09ee5ed8-31be-4702-83b6-40066c2ffce9', 2026, NULL, NULL, NULL, NULL, 4.48, NULL, 29, 30, NULL),
('5c141f05-d84b-48f8-9f65-583e8a04f2a7', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '06cf8e9f-b6aa-40b5-a93d-c05e07b7d19c', 2026, NULL, NULL, NULL, NULL, 4.2, NULL, 47, 47, NULL),
('64e4018c-9c94-4f71-940b-86578090f8af', '8f22b297-460f-4dfa-ad74-45aaed3a706d', 'a081f7cb-43b1-467d-bad2-42a58670d4fd', 2026, NULL, NULL, NULL, NULL, 173.0, NULL, NULL, NULL, NULL),
('5dc95bee-e86e-4d31-a0e8-89a8d43d0da8', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '3c3f0c46-5fb5-44d6-96ae-fe5893b17e86', 2026, NULL, NULL, NULL, NULL, 178.0, NULL, NULL, NULL, NULL),
('5bcbd1f1-be43-42b6-8c51-bbc554002f29', '8f22b297-460f-4dfa-ad74-45aaed3a706d', 'aa66baf8-b2b1-4943-bda8-99038132e723', 2026, NULL, NULL, NULL, NULL, 55.0, NULL, NULL, NULL, NULL),
('b7504c8f-9b6e-451f-81a3-b207c5333bed', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '197f10a6-35b0-4e21-a317-6d423c9c411b', 2026, NULL, NULL, NULL, NULL, 96.4, NULL, 28, 28, '{"Sim": 27, "Não": 1}'::jsonb),
('662b31a5-cd48-4995-ab92-d1c3e6147597', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '555b3b3b-0c1f-493a-a4d6-332ff4564e86', 2026, NULL, NULL, NULL, NULL, 0.95, NULL, NULL, NULL, NULL),
('c6ea7701-2367-447e-8521-8604f5571373', '8f22b297-460f-4dfa-ad74-45aaed3a706d', 'a561671e-06dd-4362-b34e-0238999a9889', 2026, NULL, NULL, NULL, NULL, 84.8, NULL, 33, 33, '{"Sim": 28, "Não": 5}'::jsonb),
('3052b45f-d301-4ae9-acac-e2b24ede7096', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '710b9c42-85c0-4137-bc45-3d2faf720189', 2026, NULL, NULL, NULL, NULL, 186.8, NULL, NULL, NULL, NULL),
('fe12aca9-6c3d-469f-932f-02407e614ae1', '8f22b297-460f-4dfa-ad74-45aaed3a706d', 'd8debeb6-4b50-404c-9109-a316ee2307c6', 2026, NULL, NULL, NULL, NULL, 71.4, NULL, 42, 42, '{"Sim": 30, "Não": 12}'::jsonb),
('72800a66-356d-4855-89ed-bd34fb470145', '8f22b297-460f-4dfa-ad74-45aaed3a706d', 'f9cdbbf6-f3d2-41ba-a48f-f750d90a4d03', 2026, NULL, NULL, NULL, NULL, 3.66, NULL, 31, 31, NULL),
('9bc5f1d1-fa77-493a-8d15-70d2cc1bdfd7', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '19147bb2-6858-470e-98f0-d9d44520b7be', 2026, NULL, NULL, NULL, NULL, 4.58, NULL, 24, 26, NULL),
('c7d77869-9533-47c7-a916-273525026257', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '5e3efc99-134c-4c04-a314-b82c5e74fd28', 2026, NULL, NULL, NULL, NULL, 4.48, NULL, 24, 25, NULL),
('988d3239-458d-45e8-a886-1eb2a55895c6', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '09750617-3c71-4e71-897d-f4630a90c106', 2026, NULL, NULL, NULL, NULL, 4.67, NULL, 47, 48, NULL),
('b81880df-a53c-406c-b575-30c6ae5bb242', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '777c4c1c-b104-42f6-8a13-f605d0b390df', 2026, NULL, NULL, NULL, NULL, 3.85, NULL, 52, 53, NULL),
('ad11548e-e046-430f-927d-48f7029cae0c', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '32545583-6689-4eca-ac16-863ae8ca4517', 2026, NULL, NULL, NULL, NULL, 4.38, NULL, 25, 27, NULL),
('1b259925-6c37-4ef6-b7b4-8af8015e9d35', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '638f6811-4ef5-4097-ba78-21bdad14866b', 2026, NULL, NULL, NULL, NULL, NULL, NULL, 26, 26, '{"Sim": 10, "Não": 11, "Não, mas tentei": 5}'::jsonb),
('8769a7db-7f42-4291-b147-c7151bf13d5d', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '9593bb15-4fd3-4a92-9f39-a540321aa3c7', 2026, NULL, NULL, NULL, NULL, 3.66, NULL, 44, 44, NULL),
('6ec462fd-fcdd-41a9-a332-35b1a91da2c4', '8f22b297-460f-4dfa-ad74-45aaed3a706d', 'f21b4261-433b-4357-b4fd-3b4a4aee1014', 2026, NULL, NULL, NULL, NULL, 4.05, NULL, 20, 22, NULL),
('3203c2b0-9c59-40b3-9458-0ea491b8b663', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '0951ab7e-d684-4cf6-be6a-48599556fa79', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('14eee823-594f-4535-baea-d3cc60d14048', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '0e8c5ac1-9e2e-48de-852f-92a5636a1549', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('7ea5d1cf-a41b-48c3-b038-d4c2e3ed636d', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '0b30f2bd-643e-409a-861b-61ad13913702', 2026, NULL, NULL, NULL, NULL, 120.0, NULL, NULL, NULL, NULL),
('ed8489e4-0bd2-4d7d-84a6-fb713b02666d', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '8536bc2a-6c51-44f2-b07e-38f35e97ed2d', 2026, NULL, NULL, NULL, NULL, 89.0, NULL, NULL, NULL, NULL),
('95c2dca8-057c-4e51-818a-11842d7fee0f', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '37732d56-b185-47ca-a827-71a327d524cd', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('1d68a228-0eed-45a5-83da-2aa8119e1a59', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '88467533-a43c-4e47-8293-62320cf47b2d', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('b4230ba3-cd04-4052-b04f-d5c197a32660', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '4c03f8e5-bbf4-4b3e-969d-155f3905ac0d', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('bbb3c313-8cfd-4dc4-8a12-bc9aa6b318f8', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '79d2668b-dde1-496b-a6c7-b9db32ce0f0c', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('ae6d77c5-2abd-4f37-96a7-40ffca021946', '8f22b297-460f-4dfa-ad74-45aaed3a706d', 'f6662b5a-3efe-4027-9d0b-d9516bddbf1d', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('ecc065eb-bcc9-4fbf-8031-d6c9a814347a', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '4850d9fb-1934-4759-b084-27523d453856', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('3e6f5af6-aec5-4a91-b30e-6a943e95b157', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '718ce242-06f2-4e05-93f1-ff5f04811588', 2026, NULL, NULL, NULL, NULL, 4.33, NULL, 20, 21, NULL),
('3b80fefb-69fb-4748-bd3d-29554163932a', '8f22b297-460f-4dfa-ad74-45aaed3a706d', 'dd3ccc77-c31c-40da-a5ed-6dc9502833ca', 2026, NULL, NULL, NULL, NULL, 3.72, NULL, 22, 24, NULL),
('2bd429de-fc90-4906-bc3f-275328c697d1', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '30dc4f36-b42d-49c4-9a11-9ba032053b31', 2026, NULL, NULL, NULL, NULL, 4.1, NULL, 34, 35, NULL),
('dafd7249-668c-4cdd-9837-2360c5c04ba8', '8f22b297-460f-4dfa-ad74-45aaed3a706d', 'e9361303-b1f4-4294-a310-a7fcb6918d8c', 2026, NULL, NULL, NULL, NULL, 4.65, NULL, 50, 52, NULL),
('d0a4241c-84ff-4b3e-ba48-4e6005fd2e11', '8f22b297-460f-4dfa-ad74-45aaed3a706d', 'bea96625-f206-4385-9289-e0826500389b', 2026, NULL, NULL, NULL, NULL, 3.73, NULL, 46, 48, NULL),
('526c357b-f1a3-428d-b8aa-3038b51c3da8', '8f22b297-460f-4dfa-ad74-45aaed3a706d', '51d04d58-a82e-4f20-aec1-8a06fbe13d5f', 2026, NULL, NULL, NULL, NULL, 4.37, NULL, 37, 37, NULL),
('e2ece742-b162-4d43-8019-61a27ad286e4', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '0e2341fa-ea68-4453-bebd-fe5af7be7c12', 2026, NULL, NULL, NULL, NULL, 4.76, NULL, 33, 33, NULL),
('b4915569-de2e-49f4-9d35-be2c16f8c3b7', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '0eb55c0c-ee11-45ed-9274-8c6815b716bd', 2026, NULL, NULL, NULL, NULL, 80.6, NULL, 31, 31, '{"Sim": 25, "Não": 6}'::jsonb),
('9685ea34-37ab-4761-a2d0-8c6e26c82c40', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '09ee5ed8-31be-4702-83b6-40066c2ffce9', 2026, NULL, NULL, NULL, NULL, 4.65, NULL, 24, 26, NULL),
('f6be277f-3e13-49ab-8b4e-8ab14c791fce', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '06cf8e9f-b6aa-40b5-a93d-c05e07b7d19c', 2026, NULL, NULL, NULL, NULL, 3.82, NULL, 51, 52, NULL),
('ce2cc7fe-5196-425a-9809-0e2e4c4b12f4', 'f20f03ae-8ad5-4f82-976d-12caa562f538', 'a081f7cb-43b1-467d-bad2-42a58670d4fd', 2026, NULL, NULL, NULL, NULL, 75.0, NULL, NULL, NULL, NULL),
('465e4db0-7ed5-4bb3-857a-b0ab9c51ba92', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '3c3f0c46-5fb5-44d6-96ae-fe5893b17e86', 2026, NULL, NULL, NULL, NULL, 11.0, NULL, NULL, NULL, NULL),
('9f3155df-0364-4da1-b774-7cbc5127fc0a', 'f20f03ae-8ad5-4f82-976d-12caa562f538', 'aa66baf8-b2b1-4943-bda8-99038132e723', 2026, NULL, NULL, NULL, NULL, 19.0, NULL, NULL, NULL, NULL),
('cc7563be-f496-48b4-8c8b-b51af18ea082', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '197f10a6-35b0-4e21-a317-6d423c9c411b', 2026, NULL, NULL, NULL, NULL, 87.5, NULL, 16, 16, '{"Sim": 14, "Não": 2}'::jsonb),
('60a74d70-e02f-43fb-a6c7-a0b123c300eb', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '555b3b3b-0c1f-493a-a4d6-332ff4564e86', 2026, NULL, NULL, NULL, NULL, 1.99, NULL, NULL, NULL, NULL),
('6a5ad536-ce9f-49f1-8f56-508222271e0d', 'f20f03ae-8ad5-4f82-976d-12caa562f538', 'a561671e-06dd-4362-b34e-0238999a9889', 2026, NULL, NULL, NULL, NULL, 74.2, NULL, 31, 31, '{"Sim": 23, "Não": 8}'::jsonb),
('140ebc25-ef44-41f0-b3ba-8995b5c8b8e9', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '710b9c42-85c0-4137-bc45-3d2faf720189', 2026, NULL, NULL, NULL, NULL, 465.5, NULL, NULL, NULL, NULL),
('cc4731aa-0fd2-4a1b-ab45-4f51803d339f', 'f20f03ae-8ad5-4f82-976d-12caa562f538', 'c9d3c07b-af78-48ec-bda2-5cba78b73d65', 2026, NULL, NULL, NULL, NULL, 8.75, NULL, 41, 41, NULL),
('143c22a0-fba7-4b2c-8476-e68a2e5e8f1d', 'f20f03ae-8ad5-4f82-976d-12caa562f538', 'ca65798d-6236-414d-b183-df0a4eb995d3', 2026, NULL, NULL, NULL, NULL, 4.56, NULL, 47, 48, NULL),
('f1f4c1c0-4eeb-484b-ae71-e1da0e30c95e', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '394ee8df-939a-40e4-ad90-243859da641a', 2026, NULL, NULL, NULL, NULL, 14, NULL, 31, 33, NULL),
('6e1a006b-1fdf-4f7f-8eeb-365523334c51', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '0951ab7e-d684-4cf6-be6a-48599556fa79', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('bc3d8693-8fe4-4de9-86e8-53850701cbdb', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '0e8c5ac1-9e2e-48de-852f-92a5636a1549', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('5ebd7bcc-f4d2-47c5-8947-d05ac04dada1', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '0b30f2bd-643e-409a-861b-61ad13913702', 2026, NULL, NULL, NULL, NULL, 59.0, NULL, NULL, NULL, NULL),
('e4e7de07-9c22-4915-88a7-d74b89e5c610', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '8536bc2a-6c51-44f2-b07e-38f35e97ed2d', 2026, NULL, NULL, NULL, NULL, 157.0, NULL, NULL, NULL, NULL),
('443e63de-c6de-4171-9138-821bca5bf653', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '37732d56-b185-47ca-a827-71a327d524cd', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('d75cad85-a115-4474-b7da-5ca926e45778', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '88467533-a43c-4e47-8293-62320cf47b2d', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('3b4b2da8-b119-4e0e-b29a-aa05a31f7ab9', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '4c03f8e5-bbf4-4b3e-969d-155f3905ac0d', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('17486f01-4a04-4842-b384-d600dd14fe65', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '79d2668b-dde1-496b-a6c7-b9db32ce0f0c', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('e39d8787-d3d9-4cb8-a459-785b5e1456d8', 'f20f03ae-8ad5-4f82-976d-12caa562f538', 'f6662b5a-3efe-4027-9d0b-d9516bddbf1d', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('b442b9b1-70f6-4b9f-abad-9ed5b84c3690', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '4850d9fb-1934-4759-b084-27523d453856', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('8478930e-79b2-476e-af01-661b511a72d5', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '718ce242-06f2-4e05-93f1-ff5f04811588', 2026, NULL, NULL, NULL, NULL, 3.76, NULL, 16, 17, NULL),
('3b6bfc2e-bdd7-438b-bbc1-5172f4e409e4', 'f20f03ae-8ad5-4f82-976d-12caa562f538', 'dd3ccc77-c31c-40da-a5ed-6dc9502833ca', 2026, NULL, NULL, NULL, NULL, 4.71, NULL, 25, 27, NULL),
('9d2fd3aa-c8ca-4d6d-bca6-758fc3bdb7f4', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '30dc4f36-b42d-49c4-9a11-9ba032053b31', 2026, NULL, NULL, NULL, NULL, 4.55, NULL, 52, 52, NULL),
('9cdbc2fe-6a05-406e-b071-a9dd8ea65d5a', 'f20f03ae-8ad5-4f82-976d-12caa562f538', 'e9361303-b1f4-4294-a310-a7fcb6918d8c', 2026, NULL, NULL, NULL, NULL, 3.69, NULL, 46, 47, NULL),
('743b94e4-e0b8-470d-bfde-638a6d07d176', 'f20f03ae-8ad5-4f82-976d-12caa562f538', 'bea96625-f206-4385-9289-e0826500389b', 2026, NULL, NULL, NULL, NULL, 4.31, NULL, 26, 27, NULL),
('9fcb6b6f-491d-4213-9da3-f05af5692af7', 'f20f03ae-8ad5-4f82-976d-12caa562f538', '51d04d58-a82e-4f20-aec1-8a06fbe13d5f', 2026, NULL, NULL, NULL, NULL, 4.42, NULL, 53, 54, NULL);

INSERT INTO org_cml.measurements (id, service_id, indicator_id, year, month, channel, geo_level, geo_name, value, value_text, total_respondentes, total_inquiridos, category_counts) VALUES
('5af5cc1d-c1a5-4f91-a802-f52b8399bced', '160b52e3-02ab-45d9-8564-24892cd71124', '0e2341fa-ea68-4453-bebd-fe5af7be7c12', 2026, NULL, NULL, NULL, NULL, 3.74, NULL, 31, 32, NULL),
('f20f2a8b-4c18-4c15-be40-5ca0ae6328c6', '160b52e3-02ab-45d9-8564-24892cd71124', '0eb55c0c-ee11-45ed-9274-8c6815b716bd', 2026, NULL, NULL, NULL, NULL, 80.0, NULL, 45, 45, '{"Sim": 36, "Não": 9}'::jsonb),
('beedc90c-35ee-4a95-9e0e-dc99028cd382', '160b52e3-02ab-45d9-8564-24892cd71124', '09ee5ed8-31be-4702-83b6-40066c2ffce9', 2026, NULL, NULL, NULL, NULL, 4.17, NULL, 15, 15, NULL),
('d332299e-9856-42d9-b92d-2307c2245277', '160b52e3-02ab-45d9-8564-24892cd71124', '06cf8e9f-b6aa-40b5-a93d-c05e07b7d19c', 2026, NULL, NULL, NULL, NULL, 4.46, NULL, 16, 16, NULL),
('313b26ae-a76f-4615-bec2-afaeeace7690', '160b52e3-02ab-45d9-8564-24892cd71124', 'a081f7cb-43b1-467d-bad2-42a58670d4fd', 2026, NULL, NULL, NULL, NULL, 146.0, NULL, NULL, NULL, NULL),
('5dd9a9c5-69e3-4dbc-a595-d23e2a30f92c', '160b52e3-02ab-45d9-8564-24892cd71124', '3c3f0c46-5fb5-44d6-96ae-fe5893b17e86', 2026, NULL, NULL, NULL, NULL, 11.0, NULL, NULL, NULL, NULL),
('ec12e8f2-c4a7-4b4a-80e3-12a90b2878c9', '160b52e3-02ab-45d9-8564-24892cd71124', 'aa66baf8-b2b1-4943-bda8-99038132e723', 2026, NULL, NULL, NULL, NULL, 116.0, NULL, NULL, NULL, NULL),
('d18f037e-d6f3-4f90-bfd7-9b603d8f15f5', '160b52e3-02ab-45d9-8564-24892cd71124', '197f10a6-35b0-4e21-a317-6d423c9c411b', 2026, NULL, NULL, NULL, NULL, 92.9, NULL, 42, 42, '{"Sim": 39, "Não": 3}'::jsonb),
('c9af7979-a70b-467e-8925-5cd89febd89a', '160b52e3-02ab-45d9-8564-24892cd71124', '555b3b3b-0c1f-493a-a4d6-332ff4564e86', 2026, NULL, NULL, NULL, NULL, 0.69, NULL, NULL, NULL, NULL),
('634f451d-e07c-41f7-a38e-cd9ad882a9a5', '160b52e3-02ab-45d9-8564-24892cd71124', 'a561671e-06dd-4362-b34e-0238999a9889', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, 13, 13, '{"Sim": 13, "Não": 0}'::jsonb),
('34cc5d79-376c-4671-ad03-9e7268d1dac7', '160b52e3-02ab-45d9-8564-24892cd71124', '710b9c42-85c0-4137-bc45-3d2faf720189', 2026, NULL, NULL, NULL, NULL, 341.4, NULL, NULL, NULL, NULL),
('0935e547-7f33-43ff-9d52-3e102b4099f6', '160b52e3-02ab-45d9-8564-24892cd71124', 'd8debeb6-4b50-404c-9109-a316ee2307c6', 2026, NULL, NULL, NULL, NULL, 72.2, NULL, 18, 18, '{"Sim": 13, "Não": 5}'::jsonb),
('0935cf0b-34c4-4f57-b0f3-d6ea2e229c4e', '160b52e3-02ab-45d9-8564-24892cd71124', 'f9cdbbf6-f3d2-41ba-a48f-f750d90a4d03', 2026, NULL, NULL, NULL, NULL, 4.73, NULL, 49, 49, NULL),
('093e7642-52a6-453b-af4a-31807ee738a1', '160b52e3-02ab-45d9-8564-24892cd71124', '19147bb2-6858-470e-98f0-d9d44520b7be', 2026, NULL, NULL, NULL, NULL, 4.47, NULL, 30, 32, NULL),
('ed331a18-602a-4c8e-b14f-fff6b9ed98c1', '160b52e3-02ab-45d9-8564-24892cd71124', '5e3efc99-134c-4c04-a314-b82c5e74fd28', 2026, NULL, NULL, NULL, NULL, 4.13, NULL, 49, 50, NULL),
('27db3275-7f85-43ae-a9ef-5b8330580ead', '160b52e3-02ab-45d9-8564-24892cd71124', '09750617-3c71-4e71-897d-f4630a90c106', 2026, NULL, NULL, NULL, NULL, 4.88, NULL, 46, 48, NULL),
('09880532-03e8-4022-916d-a124eb4e024e', '160b52e3-02ab-45d9-8564-24892cd71124', '777c4c1c-b104-42f6-8a13-f605d0b390df', 2026, NULL, NULL, NULL, NULL, 3.9, NULL, 35, 36, NULL),
('7c232036-099a-4dca-a4a9-cb554c0ef7b9', '160b52e3-02ab-45d9-8564-24892cd71124', '32545583-6689-4eca-ac16-863ae8ca4517', 2026, NULL, NULL, NULL, NULL, 4.44, NULL, 42, 44, NULL),
('657b70c2-0135-4f04-bd22-45e9b942d5e4', '160b52e3-02ab-45d9-8564-24892cd71124', '638f6811-4ef5-4097-ba78-21bdad14866b', 2026, NULL, NULL, NULL, NULL, NULL, NULL, 25, 25, '{"Sim": 6, "Não": 18, "Não, mas tentei": 1}'::jsonb),
('77be3933-a7e6-4f79-a5a8-b74e7f66ab6c', '160b52e3-02ab-45d9-8564-24892cd71124', '9593bb15-4fd3-4a92-9f39-a540321aa3c7', 2026, NULL, NULL, NULL, NULL, 4.21, NULL, 32, 32, NULL),
('9352d825-d839-4fda-87e8-7c82efd44bae', '160b52e3-02ab-45d9-8564-24892cd71124', 'f21b4261-433b-4357-b4fd-3b4a4aee1014', 2026, NULL, NULL, NULL, NULL, 4.04, NULL, 49, 49, NULL),
('f51a3e12-4e9f-4130-9375-180fb0867fdc', '160b52e3-02ab-45d9-8564-24892cd71124', '0951ab7e-d684-4cf6-be6a-48599556fa79', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('9985d5f6-1cfc-41ed-b74c-45b1ef474cee', '160b52e3-02ab-45d9-8564-24892cd71124', '0e8c5ac1-9e2e-48de-852f-92a5636a1549', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('030d8054-2c8d-4013-8f69-137f524814af', '160b52e3-02ab-45d9-8564-24892cd71124', '0b30f2bd-643e-409a-861b-61ad13913702', 2026, NULL, NULL, NULL, NULL, 68.0, NULL, NULL, NULL, NULL),
('39c8f1c7-0e91-493f-b8fc-5dfe04b9c5c1', '160b52e3-02ab-45d9-8564-24892cd71124', '8536bc2a-6c51-44f2-b07e-38f35e97ed2d', 2026, NULL, NULL, NULL, NULL, 87.0, NULL, NULL, NULL, NULL),
('63ed00e7-c57d-4d01-a4a7-e35a633929d5', '160b52e3-02ab-45d9-8564-24892cd71124', '37732d56-b185-47ca-a827-71a327d524cd', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('b1b4aa07-9049-4ee9-93c4-803fd3a7288a', '160b52e3-02ab-45d9-8564-24892cd71124', '88467533-a43c-4e47-8293-62320cf47b2d', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('45a82f09-9e37-4a36-ace9-0d92207dabe2', '160b52e3-02ab-45d9-8564-24892cd71124', '4c03f8e5-bbf4-4b3e-969d-155f3905ac0d', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('ed5d7254-5804-40ae-b729-88971529bae2', '160b52e3-02ab-45d9-8564-24892cd71124', '79d2668b-dde1-496b-a6c7-b9db32ce0f0c', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('4948cde0-855b-4bc9-8760-dc925b85a7e8', '160b52e3-02ab-45d9-8564-24892cd71124', 'f6662b5a-3efe-4027-9d0b-d9516bddbf1d', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('d5efb47d-2452-4781-ad01-f0e4161433e7', '160b52e3-02ab-45d9-8564-24892cd71124', '4850d9fb-1934-4759-b084-27523d453856', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('38a2bd75-0194-43dd-ac4b-8a35c7e7b962', '160b52e3-02ab-45d9-8564-24892cd71124', '718ce242-06f2-4e05-93f1-ff5f04811588', 2026, NULL, NULL, NULL, NULL, 4.56, NULL, 32, 32, NULL),
('2777baf0-c26d-4227-a15c-737323e9b41e', '160b52e3-02ab-45d9-8564-24892cd71124', 'dd3ccc77-c31c-40da-a5ed-6dc9502833ca', 2026, NULL, NULL, NULL, NULL, 4.43, NULL, 26, 27, NULL),
('048936cd-e11a-44cb-95a3-ec208a63128e', '160b52e3-02ab-45d9-8564-24892cd71124', '30dc4f36-b42d-49c4-9a11-9ba032053b31', 2026, NULL, NULL, NULL, NULL, 4.17, NULL, 36, 38, NULL),
('0c434343-3af5-4707-9c09-9048b714e1e3', '160b52e3-02ab-45d9-8564-24892cd71124', 'e9361303-b1f4-4294-a310-a7fcb6918d8c', 2026, NULL, NULL, NULL, NULL, 4.46, NULL, 29, 31, NULL),
('bd575401-3594-4a3d-9c63-95bf78bbd1dd', '160b52e3-02ab-45d9-8564-24892cd71124', 'bea96625-f206-4385-9289-e0826500389b', 2026, NULL, NULL, NULL, NULL, 4.69, NULL, 42, 42, NULL),
('45281d22-f466-4e96-83e8-f6336932351f', '160b52e3-02ab-45d9-8564-24892cd71124', '51d04d58-a82e-4f20-aec1-8a06fbe13d5f', 2026, NULL, NULL, NULL, NULL, 4.82, NULL, 35, 35, NULL),
('13b10a4d-0673-418a-b8db-9415090039ed', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '0e2341fa-ea68-4453-bebd-fe5af7be7c12', 2026, NULL, NULL, NULL, NULL, 4.69, NULL, 51, 53, NULL),
('4ffa5c8d-99de-4f4d-be76-51320d56b802', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '0eb55c0c-ee11-45ed-9274-8c6815b716bd', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, 21, 21, '{"Sim": 21, "Não": 0}'::jsonb),
('66b90a04-b9d7-4a84-ba02-b553b40e6a2e', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '09ee5ed8-31be-4702-83b6-40066c2ffce9', 2026, NULL, NULL, NULL, NULL, 4.37, NULL, 20, 22, NULL),
('e88f33e4-751c-4caa-908b-3d6abc40ea92', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '06cf8e9f-b6aa-40b5-a93d-c05e07b7d19c', 2026, NULL, NULL, NULL, NULL, 4.29, NULL, 17, 18, NULL),
('6ba00571-142e-4cad-8c57-67d6fc022762', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', 'a081f7cb-43b1-467d-bad2-42a58670d4fd', 2026, NULL, NULL, NULL, NULL, 103.0, NULL, NULL, NULL, NULL),
('d98bd40c-ff21-42a9-a784-99c247723706', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '3c3f0c46-5fb5-44d6-96ae-fe5893b17e86', 2026, NULL, NULL, NULL, NULL, 172.0, NULL, NULL, NULL, NULL),
('8ea8a4c6-affc-4eb2-85b9-53b3ff843ccb', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', 'aa66baf8-b2b1-4943-bda8-99038132e723', 2026, NULL, NULL, NULL, NULL, 82.0, NULL, NULL, NULL, NULL),
('854e4efe-ddfc-4789-bd7b-95bfa845ff2c', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '197f10a6-35b0-4e21-a317-6d423c9c411b', 2026, NULL, NULL, NULL, NULL, 70.6, NULL, 17, 17, '{"Sim": 12, "Não": 5}'::jsonb),
('5e1b897f-6471-470a-bbae-4b99eb2f82a4', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '555b3b3b-0c1f-493a-a4d6-332ff4564e86', 2026, NULL, NULL, NULL, NULL, 0.41, NULL, NULL, NULL, NULL),
('0ba06414-63de-4b7c-b06f-4eb9ec56a6cd', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', 'a561671e-06dd-4362-b34e-0238999a9889', 2026, NULL, NULL, NULL, NULL, 64.7, NULL, 17, 17, '{"Sim": 11, "Não": 6}'::jsonb),
('148951b9-1a87-4a41-ae5f-23f2a0f0877c', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '710b9c42-85c0-4137-bc45-3d2faf720189', 2026, NULL, NULL, NULL, NULL, 157.9, NULL, NULL, NULL, NULL),
('6c5f67b5-8034-4f99-8672-d496ebc75c80', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', 'c9d3c07b-af78-48ec-bda2-5cba78b73d65', 2026, NULL, NULL, NULL, NULL, 8.14, NULL, 31, 31, NULL),
('dd54ea55-8119-4c63-be16-e8888e7c365c', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', 'ca65798d-6236-414d-b183-df0a4eb995d3', 2026, NULL, NULL, NULL, NULL, 4.77, NULL, 31, 32, NULL),
('ab366124-2d17-4402-acbb-d530176806e9', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '394ee8df-939a-40e4-ad90-243859da641a', 2026, NULL, NULL, NULL, NULL, 13, NULL, 30, 31, NULL),
('f3ae5120-7121-4e0e-8893-1aaf2f4de9d2', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '0951ab7e-d684-4cf6-be6a-48599556fa79', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('4d86e835-51a6-4c86-a9e1-189cc7faaa41', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '0e8c5ac1-9e2e-48de-852f-92a5636a1549', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('6726f5e6-d59a-4697-84e8-664f8135d64e', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '0b30f2bd-643e-409a-861b-61ad13913702', 2026, NULL, NULL, NULL, NULL, 106.0, NULL, NULL, NULL, NULL),
('87ebc4e8-9213-4390-950e-0b8ca97c6bc8', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '8536bc2a-6c51-44f2-b07e-38f35e97ed2d', 2026, NULL, NULL, NULL, NULL, 168.0, NULL, NULL, NULL, NULL),
('bbfc1b43-0280-4cec-8601-ad1ff2b82811', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '37732d56-b185-47ca-a827-71a327d524cd', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('7cffc36e-82a2-47b7-863f-b8e4b37bb25f', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '88467533-a43c-4e47-8293-62320cf47b2d', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('31daccfb-51ae-4e25-88a8-fac518eb506e', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '4c03f8e5-bbf4-4b3e-969d-155f3905ac0d', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('5aeb6bef-7ba4-429c-ba7b-bc6f331fd950', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '79d2668b-dde1-496b-a6c7-b9db32ce0f0c', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('7fe17d2f-4725-4647-b9ec-2e2320c92bd0', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', 'f6662b5a-3efe-4027-9d0b-d9516bddbf1d', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('8233aaee-f712-4313-92e7-e452636e6166', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '4850d9fb-1934-4759-b084-27523d453856', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('e2f24b51-9544-484f-96a8-7708e5abe098', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '718ce242-06f2-4e05-93f1-ff5f04811588', 2026, NULL, NULL, NULL, NULL, 4.02, NULL, 47, 48, NULL),
('7c2be54b-da00-4f93-89c1-bf03ccd55097', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', 'dd3ccc77-c31c-40da-a5ed-6dc9502833ca', 2026, NULL, NULL, NULL, NULL, 4.7, NULL, 29, 29, NULL),
('65d4d62e-4a37-4e4c-b45d-aabc029987d2', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '30dc4f36-b42d-49c4-9a11-9ba032053b31', 2026, NULL, NULL, NULL, NULL, 3.99, NULL, 40, 41, NULL),
('4064f0fe-5128-47de-99f3-695963268891', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', 'e9361303-b1f4-4294-a310-a7fcb6918d8c', 2026, NULL, NULL, NULL, NULL, 3.8, NULL, 22, 22, NULL),
('aae6c6a2-6c94-42c7-a3ac-25a8cef5d28e', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', 'bea96625-f206-4385-9289-e0826500389b', 2026, NULL, NULL, NULL, NULL, 4.68, NULL, 16, 16, NULL),
('6ae51108-bdbd-4808-b95e-249d816afb40', '636ec47d-d22c-48b3-9db2-a5c0c1af2cb5', '51d04d58-a82e-4f20-aec1-8a06fbe13d5f', 2026, NULL, NULL, NULL, NULL, 3.85, NULL, 50, 52, NULL),
('84501627-518d-4dd6-a15f-6afd288da550', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '0e2341fa-ea68-4453-bebd-fe5af7be7c12', 2026, NULL, NULL, NULL, NULL, 4.55, NULL, 34, 35, NULL),
('bcc3e7a3-6b8d-4edc-8867-41886acd93d3', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '0eb55c0c-ee11-45ed-9274-8c6815b716bd', 2026, NULL, NULL, NULL, NULL, 83.7, NULL, 43, 43, '{"Sim": 36, "Não": 7}'::jsonb),
('2d263aed-3b1e-4478-b305-2eb081c0ade4', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '09ee5ed8-31be-4702-83b6-40066c2ffce9', 2026, NULL, NULL, NULL, NULL, 4.46, NULL, 43, 44, NULL),
('00130932-3931-47b4-9ae9-38e4a7dabe9e', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '06cf8e9f-b6aa-40b5-a93d-c05e07b7d19c', 2026, NULL, NULL, NULL, NULL, 4.3, NULL, 40, 42, NULL),
('7b2c77dc-307e-4db6-aae8-6d17474c2859', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', 'a081f7cb-43b1-467d-bad2-42a58670d4fd', 2026, NULL, NULL, NULL, NULL, 86.0, NULL, NULL, NULL, NULL),
('948c30c5-97c8-4095-83cc-65041b658e23', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '3c3f0c46-5fb5-44d6-96ae-fe5893b17e86', 2026, NULL, NULL, NULL, NULL, 57.0, NULL, NULL, NULL, NULL),
('a0c75147-203a-4feb-b14c-d8cc2b9365ef', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', 'aa66baf8-b2b1-4943-bda8-99038132e723', 2026, NULL, NULL, NULL, NULL, 111.0, NULL, NULL, NULL, NULL),
('49bee9cc-7c72-4f03-94af-1132a0bf27a2', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '197f10a6-35b0-4e21-a317-6d423c9c411b', 2026, NULL, NULL, NULL, NULL, 95.5, NULL, 44, 44, '{"Sim": 42, "Não": 2}'::jsonb),
('64d5b578-80b9-4932-9ac5-4f1008848777', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '555b3b3b-0c1f-493a-a4d6-332ff4564e86', 2026, NULL, NULL, NULL, NULL, 1.03, NULL, NULL, NULL, NULL),
('8a1ba848-0c77-4755-a2f9-0e68828ce6c0', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', 'a561671e-06dd-4362-b34e-0238999a9889', 2026, NULL, NULL, NULL, NULL, 76.5, NULL, 34, 34, '{"Sim": 26, "Não": 8}'::jsonb),
('f5a1bf17-ea7b-4bab-8397-398e277e0fcf', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '710b9c42-85c0-4137-bc45-3d2faf720189', 2026, NULL, NULL, NULL, NULL, 319.9, NULL, NULL, NULL, NULL),
('f5e30c72-a08e-49f8-bafc-b5eb43b0107c', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', 'c9d3c07b-af78-48ec-bda2-5cba78b73d65', 2026, NULL, NULL, NULL, NULL, 7.49, NULL, 17, 17, NULL),
('b70443b1-2299-46d8-ac42-69326b8dfd0f', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', 'ca65798d-6236-414d-b183-df0a4eb995d3', 2026, NULL, NULL, NULL, NULL, 4.68, NULL, 31, 33, NULL),
('aec6e6f7-f713-4896-8ea6-edaf655143fe', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '394ee8df-939a-40e4-ad90-243859da641a', 2026, NULL, NULL, NULL, NULL, 10, NULL, 34, 35, NULL),
('151905ec-04d0-4fc6-bcea-c553805317c0', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '0951ab7e-d684-4cf6-be6a-48599556fa79', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('122abecb-6fb9-45f0-9194-3d4dafb2534e', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '0e8c5ac1-9e2e-48de-852f-92a5636a1549', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('ce6af5e2-de76-4a2f-bdda-e578a008cc06', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '0b30f2bd-643e-409a-861b-61ad13913702', 2026, NULL, NULL, NULL, NULL, 124.0, NULL, NULL, NULL, NULL),
('a5febbeb-4c2e-4e70-9428-832e375e8925', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '8536bc2a-6c51-44f2-b07e-38f35e97ed2d', 2026, NULL, NULL, NULL, NULL, 113.0, NULL, NULL, NULL, NULL),
('b0a78460-9500-4e2a-8460-7efbfc3736f7', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '37732d56-b185-47ca-a827-71a327d524cd', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('2aaf3410-f71a-46b5-8978-f80b8be52e64', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '88467533-a43c-4e47-8293-62320cf47b2d', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('3a1c5e7b-a047-4925-9eb6-7c182a4cd48c', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '4c03f8e5-bbf4-4b3e-969d-155f3905ac0d', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('ac0e30d7-436d-4c44-94c1-f7a57985df88', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '79d2668b-dde1-496b-a6c7-b9db32ce0f0c', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('aba71629-4864-4e51-b074-bfd0972a43c5', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', 'f6662b5a-3efe-4027-9d0b-d9516bddbf1d', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('ea383c0d-ae9b-4b9e-8035-82294cf61812', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '4850d9fb-1934-4759-b084-27523d453856', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('9d8ccc0e-7999-46cf-b292-19e270493dc1', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '718ce242-06f2-4e05-93f1-ff5f04811588', 2026, NULL, NULL, NULL, NULL, 4.19, NULL, 39, 39, NULL),
('0a62d92a-9155-44ff-8295-3afbdb93f289', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', 'dd3ccc77-c31c-40da-a5ed-6dc9502833ca', 2026, NULL, NULL, NULL, NULL, 3.63, NULL, 27, 29, NULL),
('2cf2592b-951a-42fd-aa20-ce25d0d6baf7', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '30dc4f36-b42d-49c4-9a11-9ba032053b31', 2026, NULL, NULL, NULL, NULL, 4.3, NULL, 20, 20, NULL),
('4fc8de37-6cdd-4786-b38e-f349d4c7368c', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', 'e9361303-b1f4-4294-a310-a7fcb6918d8c', 2026, NULL, NULL, NULL, NULL, 4.55, NULL, 34, 36, NULL),
('27a7b9be-eb78-4b62-9825-52a03794fdda', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', 'bea96625-f206-4385-9289-e0826500389b', 2026, NULL, NULL, NULL, NULL, 4.07, NULL, 31, 33, NULL),
('6462d2ab-f789-4100-a6c5-df2f999a13b9', '8908d4e4-cf22-4e29-ad98-55233f5b9e1a', '51d04d58-a82e-4f20-aec1-8a06fbe13d5f', 2026, NULL, NULL, NULL, NULL, 4.41, NULL, 36, 37, NULL),
('02c4f6fd-8e09-4edc-aa9f-d80ddb21ed38', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '0e2341fa-ea68-4453-bebd-fe5af7be7c12', 2026, NULL, NULL, NULL, NULL, 3.77, NULL, 21, 23, NULL),
('a91807e3-7a87-4949-8943-8098b7a02ff6', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '0eb55c0c-ee11-45ed-9274-8c6815b716bd', 2026, NULL, NULL, NULL, NULL, 79.2, NULL, 24, 24, '{"Sim": 19, "Não": 5}'::jsonb),
('69046dd0-dd75-4675-97af-7940456103c6', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '09ee5ed8-31be-4702-83b6-40066c2ffce9', 2026, NULL, NULL, NULL, NULL, 4.48, NULL, 43, 44, NULL),
('36db4844-2e5e-45b9-b02e-78add3f749a6', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '06cf8e9f-b6aa-40b5-a93d-c05e07b7d19c', 2026, NULL, NULL, NULL, NULL, 4.1, NULL, 51, 53, NULL),
('101dbe96-7e05-45f1-8cbd-7b25d1e192ca', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', 'a081f7cb-43b1-467d-bad2-42a58670d4fd', 2026, NULL, NULL, NULL, NULL, 20.0, NULL, NULL, NULL, NULL),
('63f32929-1fb8-4499-b194-3de9c24adda1', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '3c3f0c46-5fb5-44d6-96ae-fe5893b17e86', 2026, NULL, NULL, NULL, NULL, 177.0, NULL, NULL, NULL, NULL),
('a53acea1-f6f4-4a83-9450-4f681f38c401', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', 'aa66baf8-b2b1-4943-bda8-99038132e723', 2026, NULL, NULL, NULL, NULL, 172.0, NULL, NULL, NULL, NULL),
('7081de6e-78f0-4d31-8294-f76bcf219ec1', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '197f10a6-35b0-4e21-a317-6d423c9c411b', 2026, NULL, NULL, NULL, NULL, 93.5, NULL, 31, 31, '{"Sim": 29, "Não": 2}'::jsonb),
('d6f396b2-f5af-4bfc-9842-a8d282106bd3', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '555b3b3b-0c1f-493a-a4d6-332ff4564e86', 2026, NULL, NULL, NULL, NULL, 1.63, NULL, NULL, NULL, NULL),
('d127133a-e60a-40e5-901d-f14513de14b3', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', 'a561671e-06dd-4362-b34e-0238999a9889', 2026, NULL, NULL, NULL, NULL, 84.4, NULL, 45, 45, '{"Sim": 38, "Não": 7}'::jsonb),
('10ce68ac-2d3c-4b8d-85bd-fbe63c7f2e1f', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '710b9c42-85c0-4137-bc45-3d2faf720189', 2026, NULL, NULL, NULL, NULL, 423.4, NULL, NULL, NULL, NULL),
('c2c80bd1-61f6-4b6d-9ba6-b1bf550c9564', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '2df322e5-bcca-4c13-872c-33cd3f95a52c', 2026, NULL, NULL, NULL, NULL, 408.3, NULL, NULL, NULL, NULL),
('078a8c1e-d8de-4a10-be8d-3f8099b8d71f', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', 'c264285f-4076-4a35-9467-82642e2735b9', 2026, NULL, NULL, NULL, NULL, 62.8, NULL, NULL, NULL, NULL),
('80e543c0-a6ac-4d23-a676-4a07222a223f', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', 'd8debeb6-4b50-404c-9109-a316ee2307c6', 2026, NULL, NULL, NULL, NULL, 80.6, NULL, 36, 36, '{"Sim": 29, "Não": 7}'::jsonb),
('69fdd40c-a7cf-456e-8e14-0cbff6cb1322', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', 'f9cdbbf6-f3d2-41ba-a48f-f750d90a4d03', 2026, NULL, NULL, NULL, NULL, 4.65, NULL, 42, 42, NULL),
('c70a5d84-1706-4133-a132-2b2ca3efeea1', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '19147bb2-6858-470e-98f0-d9d44520b7be', 2026, NULL, NULL, NULL, NULL, 4.66, NULL, 46, 48, NULL),
('f8998a7a-cd96-449c-8277-2b85f62eca81', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '5e3efc99-134c-4c04-a314-b82c5e74fd28', 2026, NULL, NULL, NULL, NULL, 4.59, NULL, 35, 36, NULL),
('7435c8ff-51c9-40ff-863f-be8900a84743', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '09750617-3c71-4e71-897d-f4630a90c106', 2026, NULL, NULL, NULL, NULL, 4.6, NULL, 29, 31, NULL),
('2be0d9f6-8ece-40df-9258-296d45833044', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '777c4c1c-b104-42f6-8a13-f605d0b390df', 2026, NULL, NULL, NULL, NULL, 4.21, NULL, 26, 28, NULL),
('1d3e3ff7-d2c0-4036-9412-f8e8a8e792c8', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '32545583-6689-4eca-ac16-863ae8ca4517', 2026, NULL, NULL, NULL, NULL, 4.41, NULL, 32, 34, NULL),
('f35f8bd4-2f21-4ee3-aa94-c300d267337b', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '638f6811-4ef5-4097-ba78-21bdad14866b', 2026, NULL, NULL, NULL, NULL, NULL, NULL, 30, 30, '{"Sim": 12, "Não": 16, "Não, mas tentei": 2}'::jsonb),
('8b5ad631-86d5-4e65-a261-4cd97496a3ca', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '9593bb15-4fd3-4a92-9f39-a540321aa3c7', 2026, NULL, NULL, NULL, NULL, 4.83, NULL, 43, 44, NULL),
('188cbce8-a7d0-46f6-b2d0-481a7e211c1d', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', 'f21b4261-433b-4357-b4fd-3b4a4aee1014', 2026, NULL, NULL, NULL, NULL, 3.66, NULL, 46, 48, NULL),
('df6bfce6-6849-4dc5-9818-1af45f940107', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', 'f25b4776-1701-479a-a50b-90e9cf30a0b0', 2026, NULL, NULL, NULL, NULL, 158.0, NULL, NULL, NULL, NULL),
('01e5fc5c-3f8f-44fd-b3a3-a5374a8ef369', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '0951ab7e-d684-4cf6-be6a-48599556fa79', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('d1abc576-e8ac-4bd0-895e-7ca600374412', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '0e8c5ac1-9e2e-48de-852f-92a5636a1549', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('98f856c6-3506-4b95-b5d6-f155ad51f116', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', 'a4705399-bc3e-4b48-9796-45a52aaccb4f', 2026, NULL, NULL, NULL, NULL, 32.0, NULL, NULL, NULL, NULL),
('d94b17bb-8e01-421a-bd16-396f85a84603', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '0b30f2bd-643e-409a-861b-61ad13913702', 2026, NULL, NULL, NULL, NULL, 162.0, NULL, NULL, NULL, NULL),
('39b42444-eec7-4578-b0e8-696f47d020c7', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '465031c9-0f52-4dc0-90dc-6dcd93b0660f', 2026, NULL, NULL, NULL, NULL, 108.0, NULL, NULL, NULL, NULL),
('b085b73f-27d6-49d2-98ed-5e85cd5cce36', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '8536bc2a-6c51-44f2-b07e-38f35e97ed2d', 2026, NULL, NULL, NULL, NULL, 174.0, NULL, NULL, NULL, NULL),
('43ca5dbd-d093-486e-8c4d-627c8b2e1c6f', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '37732d56-b185-47ca-a827-71a327d524cd', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('a5a4981c-554e-44cb-8835-ea7b8169fb78', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '88467533-a43c-4e47-8293-62320cf47b2d', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('54c9968a-070c-4817-8a7d-0ea5f5aaf93c', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '4c03f8e5-bbf4-4b3e-969d-155f3905ac0d', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('49dec4cb-29dc-4165-848a-01be613e98a1', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '79d2668b-dde1-496b-a6c7-b9db32ce0f0c', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('356ac1f8-48b1-4c8d-ba8b-bac1437329c4', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', 'f6662b5a-3efe-4027-9d0b-d9516bddbf1d', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('1f4170cd-9a4e-4ffa-a911-a259ab953549', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '4850d9fb-1934-4759-b084-27523d453856', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('f0c32d5f-4df7-4d87-9d0a-5edca78ccb10', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '718ce242-06f2-4e05-93f1-ff5f04811588', 2026, NULL, NULL, NULL, NULL, 4.33, NULL, 33, 35, NULL),
('c4724523-c451-40b5-8d8e-f9cc28f465fb', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', 'dd3ccc77-c31c-40da-a5ed-6dc9502833ca', 2026, NULL, NULL, NULL, NULL, 4.77, NULL, 21, 22, NULL),
('2452436d-01a0-453a-981c-c604eb9a7290', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '30dc4f36-b42d-49c4-9a11-9ba032053b31', 2026, NULL, NULL, NULL, NULL, 4.51, NULL, 39, 40, NULL),
('95d14062-c51b-4128-bba0-0431c928e6a8', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', 'e9361303-b1f4-4294-a310-a7fcb6918d8c', 2026, NULL, NULL, NULL, NULL, 4.56, NULL, 36, 36, NULL),
('49b44697-6624-42c8-8167-d672aee4bafb', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', 'bea96625-f206-4385-9289-e0826500389b', 2026, NULL, NULL, NULL, NULL, 4.12, NULL, 50, 52, NULL),
('acda95b2-0fa2-460e-9210-f776ffcf48d8', 'fd42da38-0851-46d4-8afc-4c96cabbf7cb', '51d04d58-a82e-4f20-aec1-8a06fbe13d5f', 2026, NULL, NULL, NULL, NULL, 4.73, NULL, 33, 34, NULL),
('e20b4914-d5a6-44ac-888b-54b5d5e66aef', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '0e2341fa-ea68-4453-bebd-fe5af7be7c12', 2026, NULL, NULL, NULL, NULL, 4.47, NULL, 19, 19, NULL),
('3c7aeb49-7e29-4ce9-8b26-a2167d5d9acd', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '0eb55c0c-ee11-45ed-9274-8c6815b716bd', 2026, NULL, NULL, NULL, NULL, 93.5, NULL, 31, 31, '{"Sim": 29, "Não": 2}'::jsonb),
('1fc78e5c-e95e-434f-a397-0936ba67df1f', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '09ee5ed8-31be-4702-83b6-40066c2ffce9', 2026, NULL, NULL, NULL, NULL, 4.71, NULL, 16, 16, NULL),
('5e893bc9-6ee6-46da-83c6-15f526312b89', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '06cf8e9f-b6aa-40b5-a93d-c05e07b7d19c', 2026, NULL, NULL, NULL, NULL, 4.88, NULL, 17, 19, NULL),
('7dd2ff2a-2e67-4aa2-9f67-77976e570029', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', 'a081f7cb-43b1-467d-bad2-42a58670d4fd', 2026, NULL, NULL, NULL, NULL, 117.0, NULL, NULL, NULL, NULL),
('1bcdc3a8-0899-49e3-87a7-e9170d577d82', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '3c3f0c46-5fb5-44d6-96ae-fe5893b17e86', 2026, NULL, NULL, NULL, NULL, 18.0, NULL, NULL, NULL, NULL),
('6db9aaa0-19f7-4e21-b081-759028ee7d1e', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', 'aa66baf8-b2b1-4943-bda8-99038132e723', 2026, NULL, NULL, NULL, NULL, 57.0, NULL, NULL, NULL, NULL),
('4bd6de2a-8b5e-41b9-8e63-870c374000ae', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '197f10a6-35b0-4e21-a317-6d423c9c411b', 2026, NULL, NULL, NULL, NULL, 97.6, NULL, 42, 42, '{"Sim": 41, "Não": 1}'::jsonb),
('5738cc74-342d-4267-82dd-6b4a86fa8e2d', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '555b3b3b-0c1f-493a-a4d6-332ff4564e86', 2026, NULL, NULL, NULL, NULL, 1.62, NULL, NULL, NULL, NULL),
('6b41b2a9-59cf-49de-93d4-663d7a448dde', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', 'a561671e-06dd-4362-b34e-0238999a9889', 2026, NULL, NULL, NULL, NULL, 92.0, NULL, 25, 25, '{"Sim": 23, "Não": 2}'::jsonb),
('7e446fcd-1f50-4a32-8f78-669836f530c6', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '710b9c42-85c0-4137-bc45-3d2faf720189', 2026, NULL, NULL, NULL, NULL, 346.6, NULL, NULL, NULL, NULL),
('6b943f03-ee98-4654-ba49-1b5ffeff59ae', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', 'd8debeb6-4b50-404c-9109-a316ee2307c6', 2026, NULL, NULL, NULL, NULL, 70.6, NULL, 17, 17, '{"Sim": 12, "Não": 5}'::jsonb),
('25103b97-a0b0-4865-b3fc-44d019166915', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', 'f9cdbbf6-f3d2-41ba-a48f-f750d90a4d03', 2026, NULL, NULL, NULL, NULL, 4.12, NULL, 35, 37, NULL),
('40f684dd-8cd6-4fdc-84ed-f899b222a4f6', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '5e3efc99-134c-4c04-a314-b82c5e74fd28', 2026, NULL, NULL, NULL, NULL, 4.08, NULL, 32, 32, NULL),
('c29910ed-dbf5-4352-9268-760dfb921860', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '09750617-3c71-4e71-897d-f4630a90c106', 2026, NULL, NULL, NULL, NULL, 4.35, NULL, 18, 19, NULL),
('b85fc713-f2bb-47a9-98e2-2241bfc1e61a', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '777c4c1c-b104-42f6-8a13-f605d0b390df', 2026, NULL, NULL, NULL, NULL, 4.21, NULL, 16, 18, NULL),
('17b633eb-18c8-4efa-8651-b7ff29a7c4f8', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '32545583-6689-4eca-ac16-863ae8ca4517', 2026, NULL, NULL, NULL, NULL, 4.69, NULL, 33, 34, NULL),
('b1067a78-6777-4588-b297-cb88b2287dc7', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '638f6811-4ef5-4097-ba78-21bdad14866b', 2026, NULL, NULL, NULL, NULL, NULL, NULL, 39, 39, '{"Sim": 18, "Não": 14, "Não, mas tentei": 7}'::jsonb),
('6f02d8c6-7091-48c6-8396-cd5029338220', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '9593bb15-4fd3-4a92-9f39-a540321aa3c7', 2026, NULL, NULL, NULL, NULL, 3.87, NULL, 28, 28, NULL),
('ce3fc467-25c8-4f01-b70d-3ca4a2ed7535', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', 'f21b4261-433b-4357-b4fd-3b4a4aee1014', 2026, NULL, NULL, NULL, NULL, 4.66, NULL, 16, 17, NULL),
('8df45875-1f38-4c91-ab50-d12679a4162b', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '0951ab7e-d684-4cf6-be6a-48599556fa79', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('6abcc105-b34c-4cc4-b0c5-2431869dd4d9', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '0e8c5ac1-9e2e-48de-852f-92a5636a1549', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('beae445a-6a2b-4774-81e9-a1966c196390', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '0b30f2bd-643e-409a-861b-61ad13913702', 2026, NULL, NULL, NULL, NULL, 177.0, NULL, NULL, NULL, NULL),
('b4d17bf3-8079-49b1-866f-f12e264e0f26', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '853081cf-47f8-4d67-94d3-b600a302f3c3', 2026, NULL, NULL, NULL, NULL, 36.0, NULL, NULL, NULL, NULL),
('3c5dc2f9-77a0-434c-b2a0-08f85c9b422f', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '8536bc2a-6c51-44f2-b07e-38f35e97ed2d', 2026, NULL, NULL, NULL, NULL, 16.0, NULL, NULL, NULL, NULL),
('61ae5267-8d90-41c4-9c26-41e208cbad45', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '37732d56-b185-47ca-a827-71a327d524cd', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('797edfa9-f57a-4375-94b7-3be1d3046da1', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '88467533-a43c-4e47-8293-62320cf47b2d', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('9fb7677e-f81a-4945-a42c-4667f7732803', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '4c03f8e5-bbf4-4b3e-969d-155f3905ac0d', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('7b699c9e-7d38-4d08-a647-82cffb5c6314', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '79d2668b-dde1-496b-a6c7-b9db32ce0f0c', 2026, NULL, NULL, NULL, NULL, 0.0, NULL, NULL, NULL, '{"Sim": 0, "Não": 1}'::jsonb),
('1f7da76d-9d0f-464f-b35e-a4b93f7c681f', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', 'f6662b5a-3efe-4027-9d0b-d9516bddbf1d', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('d97fce8b-ed7d-4093-a4ba-716b8435c2dd', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '4850d9fb-1934-4759-b084-27523d453856', 2026, NULL, NULL, NULL, NULL, 100.0, NULL, NULL, NULL, '{"Sim": 1, "Não": 0}'::jsonb),
('06ba7106-b27c-4607-9734-cb4cf830eb6a', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '718ce242-06f2-4e05-93f1-ff5f04811588', 2026, NULL, NULL, NULL, NULL, 3.94, NULL, 49, 50, NULL),
('5e536e0a-d0b9-422f-a8b2-8a97372e072b', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', 'dd3ccc77-c31c-40da-a5ed-6dc9502833ca', 2026, NULL, NULL, NULL, NULL, 3.6, NULL, 48, 48, NULL),
('b3c83958-8c93-4923-8991-54843fc677b1', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '30dc4f36-b42d-49c4-9a11-9ba032053b31', 2026, NULL, NULL, NULL, NULL, 4.62, NULL, 19, 20, NULL),
('e83faa97-09ac-4065-b96e-2e51fa033f41', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', 'e9361303-b1f4-4294-a310-a7fcb6918d8c', 2026, NULL, NULL, NULL, NULL, 4.28, NULL, 43, 43, NULL),
('49c5061d-b2d7-4e74-af44-2d8174341802', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', 'bea96625-f206-4385-9289-e0826500389b', 2026, NULL, NULL, NULL, NULL, 4.39, NULL, 20, 20, NULL),
('10f64da8-f410-4af8-a068-d650f3eaa354', '8e4b22cb-3602-4174-8b51-a19d1b3fcd09', '51d04d58-a82e-4f20-aec1-8a06fbe13d5f', 2026, NULL, NULL, NULL, NULL, 4.68, NULL, 29, 30, NULL);
