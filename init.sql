
CREATE TABLE IF NOT EXISTS wheels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    items JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS wheels_name_idx ON wheels(name);