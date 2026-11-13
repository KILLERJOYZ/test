-- Draft catalog for the BRD retrieval spike.
-- Rows are crawled listing text, not reviewed production evidence (BR-13, BR-15).

CREATE TABLE IF NOT EXISTS product_families (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    name TEXT NOT NULL,
    dataset_kind TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS variants (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL REFERENCES product_families (id),
    sku TEXT,
    name TEXT NOT NULL,
    source_url TEXT,
    cpu TEXT,
    ram TEXT,
    storage TEXT,
    gpu TEXT,
    screen TEXT,
    os_name TEXT,
    weight TEXT,
    publication_state TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sellers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offers (
    id TEXT PRIMARY KEY,
    variant_id TEXT NOT NULL REFERENCES variants (id),
    seller_id TEXT NOT NULL REFERENCES sellers (id),
    condition TEXT NOT NULL,
    availability TEXT,
    currency TEXT NOT NULL,
    source_url TEXT,
    dataset_kind TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS price_observations (
    id TEXT PRIMARY KEY,
    offer_id TEXT NOT NULL REFERENCES offers (id),
    amount_vnd INTEGER,
    original_vnd INTEGER,
    observed_at TIMESTAMPTZ NOT NULL,
    completeness TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence (
    id TEXT PRIMARY KEY,
    variant_id TEXT NOT NULL REFERENCES variants (id),
    source_label TEXT NOT NULL,
    source_url TEXT,
    claim TEXT NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    permitted_use TEXT NOT NULL,
    publication_state TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS evidence_variant_idx ON evidence (variant_id);
CREATE INDEX IF NOT EXISTS offers_variant_idx ON offers (variant_id);
