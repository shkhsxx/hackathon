-- ============================================================
-- AI Style Fit Advisor — Supabase Schema (No Auth)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUM TYPES ─────────────────────────────────────────────
CREATE TYPE body_shape_enum AS ENUM (
  'triangle', 'inverted_triangle', 'rectangle', 'hourglass', 'oval'
);
CREATE TYPE shoulder_width_enum AS ENUM ('narrow', 'medium', 'wide');
CREATE TYPE waist_line_enum     AS ENUM ('narrow', 'medium', 'wide');
CREATE TYPE body_balance_enum   AS ENUM ('upper-heavy', 'balanced', 'lower-heavy');
CREATE TYPE category_enum       AS ENUM ('top', 'bottom', 'outer', 'accessory');

-- ─── TABLES ─────────────────────────────────────────────────

-- analyses (user_id 없이 독립 저장)
CREATE TABLE IF NOT EXISTS analyses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url       TEXT NOT NULL,
  body_shape      body_shape_enum NOT NULL,
  shoulder_width  shoulder_width_enum NOT NULL,
  waist_line      waist_line_enum NOT NULL,
  body_balance    body_balance_enum NOT NULL,
  confidence      NUMERIC(4,2) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- recommendations
CREATE TABLE IF NOT EXISTS recommendations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id         UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  recommendation_json JSONB NOT NULL,
  explanation         TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recommendations_analysis_id ON recommendations(analysis_id);

-- products
CREATE TABLE IF NOT EXISTS products (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name      TEXT NOT NULL,
  category  category_enum NOT NULL,
  fit_type  TEXT NOT NULL,
  image_url TEXT NOT NULL,
  price     INTEGER NOT NULL CHECK (price >= 0)
);

CREATE INDEX idx_products_fit_type ON products(fit_type);
CREATE INDEX idx_products_category ON products(category);

-- ─── ROW LEVEL SECURITY (전체 공개) ─────────────────────────

ALTER TABLE analyses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analyses: public"        ON analyses        FOR ALL USING (TRUE);
CREATE POLICY "recommendations: public" ON recommendations FOR ALL USING (TRUE);
CREATE POLICY "products: public read"   ON products        FOR SELECT USING (TRUE);

-- ─── SEED: sample products ───────────────────────────────────

INSERT INTO products (name, category, fit_type, image_url, price) VALUES
  -- Tops
  ('옥스포드 셔츠',      'top',    'regular fit',      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 59000),
  ('크루넥 니트',        'top',    'regular fit',      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400', 79000),
  ('오버사이즈 티셔츠',  'top',    'oversized fit',    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 39000),
  ('슬림핏 반팔티',      'top',    'slim fit',         'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400', 29000),
  ('세미오버 후드',      'top',    'semi oversized',   'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400', 89000),
  ('터틀넥 스웨터',      'top',    'regular fit',      'https://images.unsplash.com/photo-1608667508764-33cf0726b13a?w=400', 69000),
  ('린넨 셔츠',          'top',    'relaxed fit',      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400', 55000),
  ('크롭 탑',            'top',    'slim fit',         'https://images.unsplash.com/photo-1592301933927-35b597393c0a?w=400', 35000),
  -- Bottoms
  ('와이드 슬랙스',      'bottom', 'wide fit',         'https://images.unsplash.com/photo-1594938298603-c8148c4b2dfe?w=400', 89000),
  ('스트레이트 데님',    'bottom', 'straight fit',     'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 79000),
  ('스키니 진',          'bottom', 'skinny fit',       'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400', 69000),
  ('A라인 스커트',       'bottom', 'a-line',           'https://images.unsplash.com/photo-1583496661160-fb5218f83d61?w=400', 59000),
  ('플레어 팬츠',        'bottom', 'flare fit',        'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400', 85000),
  ('테이퍼드 치노',      'bottom', 'tapered fit',      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', 72000),
  ('미디 스커트',        'bottom', 'relaxed fit',      'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400', 65000),
  ('숏 버뮤다 팬츠',     'bottom', 'regular fit',      'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400', 49000),
  -- Outers
  ('트렌치코트',         'outer',  'regular fit',      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400', 189000),
  ('오버핏 블레이저',    'outer',  'oversized fit',    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', 159000),
  ('봄 바람막이',        'outer',  'relaxed fit',      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400', 99000),
  ('크롭 재킷',          'outer',  'slim fit',         'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400', 129000);
