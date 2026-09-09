-- Run this once against your `kalatrail` database to create the schema.
-- In VS Code MySQL extension: open this file, right-click -> "Run MySQL Query" (or select-all and run).
-- Or via terminal: mysql -u root -p kalatrail < app/data/schema.sql

CREATE TABLE IF NOT EXISTS crafts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    state VARCHAR(100),
    district VARCHAR(100),
    description TEXT,
    ai_description TEXT,
    lat DECIMAL(9,6),
    lng DECIMAL(9,6),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster region-based filtering (used in GET /crafts/{region})
CREATE INDEX idx_crafts_state ON crafts (state);
CREATE INDEX idx_crafts_district ON crafts (district);
