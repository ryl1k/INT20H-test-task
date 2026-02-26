CREATE TYPE "order_status" AS ENUM('completed','out_of_scope');

CREATE TABLE "orders" (
    "id" BIGSERIAL PRIMARY KEY,
    
    "latitude" NUMERIC(36, 18),
    "longitude" NUMERIC(36, 18), 

    "total_amount" NUMERIC(36, 18) NOT NULL,
    "tax_amount" NUMERIC(36, 18) NOT NULL,
    
    "composite_tax_rate" NUMERIC(36, 18),
    
    "state_rate" NUMERIC(36, 18) NOT NULL,
    "county_rate" NUMERIC(36, 18) NOT NULL,
    "city_rate" NUMERIC(36, 18) NOT NULL,
    "special_rates" NUMERIC(36, 18) NOT NULL,

    "jurisdictions" JSONB NOT NULL DEFAULT '[]',
    "reporting_code" VARCHAR(10) NOT NULL,
    "status" order_status NOT NULL,

    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_reporting_code ON orders (reporting_code);
CREATE INDEX idx_orders_total_amount ON orders (total_amount);
CREATE INDEX idx_orders_jurisdictions_gin ON orders USING GIN (jurisdictions);
CREATE INDEX idx_orders_status_created_at ON orders (status, created_at DESC);