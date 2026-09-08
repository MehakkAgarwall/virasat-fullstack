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

-- Artisan profiles table (originally created by the TS/tRPC backend).
-- Column names are camelCase to match that schema so both backends agree on shape.
CREATE TABLE IF NOT EXISTS artisan_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    artisanKey VARCHAR(255) NOT NULL UNIQUE,
    primaryCraftId INT NULL,
    studioName VARCHAR(500) NOT NULL,
    personalName VARCHAR(255) NOT NULL,
    craftSpecialization VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    yearsOfPractice INT DEFAULT 0,
    bio TEXT NOT NULL,
    profilePhotoUrl VARCHAR(500) NOT NULL,
    coverPhotoUrl VARCHAR(500) NOT NULL,
    publicContact VARCHAR(500) DEFAULT '',
    languages VARCHAR(255) DEFAULT '',
    experienceInfo TEXT NOT NULL,
    lat DECIMAL(9,6) NULL,
    lng DECIMAL(9,6) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index for artisan region filtering and craft lookups
CREATE INDEX idx_artisan_state ON artisan_profiles (state);
CREATE INDEX idx_artisan_craft ON artisan_profiles (primaryCraftId);
