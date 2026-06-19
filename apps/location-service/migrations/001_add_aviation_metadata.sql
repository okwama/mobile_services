-- Migration: Add aviation metadata columns
-- Description: Adds source tracking and verification timestamp for aviation data quality

-- Add aviation-specific columns for OurAirports integration
-- Using procedure to check if column exists before adding (MySQL compatible)

-- Add iata_code column
SET @s = (SELECT IF(
    (SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_schema = DATABASE()
        AND table_name = 'locations'
        AND column_name = 'iata_code'
    ) > 0,
    "SELECT 'Column iata_code already exists' AS msg",
    "ALTER TABLE locations ADD COLUMN iata_code VARCHAR(3) NULL AFTER code"
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add icao_code column
SET @s = (SELECT IF(
    (SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_schema = DATABASE()
        AND table_name = 'locations'
        AND column_name = 'icao_code'
    ) > 0,
    "SELECT 'Column icao_code already exists' AS msg",
    "ALTER TABLE locations ADD COLUMN icao_code VARCHAR(4) NULL AFTER iata_code"
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add municipality column
SET @s = (SELECT IF(
    (SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_schema = DATABASE()
        AND table_name = 'locations'
        AND column_name = 'municipality'
    ) > 0,
    "SELECT 'Column municipality already exists' AS msg",
    "ALTER TABLE locations ADD COLUMN municipality VARCHAR(255) NULL AFTER country"
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add elevation_ft column
SET @s = (SELECT IF(
    (SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_schema = DATABASE()
        AND table_name = 'locations'
        AND column_name = 'elevation_ft'
    ) > 0,
    "SELECT 'Column elevation_ft already exists' AS msg",
    "ALTER TABLE locations ADD COLUMN elevation_ft INT NULL AFTER longitude"
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add source column
SET @s = (SELECT IF(
    (SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_schema = DATABASE()
        AND table_name = 'locations'
        AND column_name = 'source'
    ) > 0,
    "SELECT 'Column source already exists' AS msg",
    "ALTER TABLE locations ADD COLUMN source ENUM('google', 'ourairports', 'osm', 'manual') DEFAULT 'google' AFTER elevation_ft"
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add last_verified column
SET @s = (SELECT IF(
    (SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_schema = DATABASE()
        AND table_name = 'locations'
        AND column_name = 'last_verified'
    ) > 0,
    "SELECT 'Column last_verified already exists' AS msg",
    "ALTER TABLE locations ADD COLUMN last_verified TIMESTAMP NULL AFTER source"
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update code column to allow NULL
ALTER TABLE locations MODIFY COLUMN code VARCHAR(10) NULL;

-- Add indexes (with error handling)
SET @s = (SELECT IF(
    (SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE table_schema = DATABASE()
        AND table_name = 'locations'
        AND index_name = 'idx_locations_iata'
    ) > 0,
    "SELECT 'Index idx_locations_iata already exists' AS msg",
    "CREATE INDEX idx_locations_iata ON locations(iata_code)"
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
    (SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE table_schema = DATABASE()
        AND table_name = 'locations'
        AND index_name = 'idx_locations_icao'
    ) > 0,
    "SELECT 'Index idx_locations_icao already exists' AS msg",
    "CREATE INDEX idx_locations_icao ON locations(icao_code)"
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
    (SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE table_schema = DATABASE()
        AND table_name = 'locations'
        AND index_name = 'idx_locations_source'
    ) > 0,
    "SELECT 'Index idx_locations_source already exists' AS msg",
    "CREATE INDEX idx_locations_source ON locations(source)"
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
    (SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE table_schema = DATABASE()
        AND table_name = 'locations'
        AND index_name = 'idx_locations_verified'
    ) > 0,
    "SELECT 'Index idx_locations_verified already exists' AS msg",
    "CREATE INDEX idx_locations_verified ON locations(last_verified)"
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop old 'code' unique constraint if it exists and recreate with better name
SET @s = (SELECT IF(
    (SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE table_schema = DATABASE()
        AND table_name = 'locations'
        AND index_name = 'code'
    ) > 0,
    "DROP INDEX code ON locations",
    "SELECT 'Index code does not exist' AS msg"
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @s = (SELECT IF(
    (SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE table_schema = DATABASE()
        AND table_name = 'locations'
        AND index_name = 'idx_unique_code'
    ) > 0,
    "SELECT 'Index idx_unique_code already exists' AS msg",
    "CREATE UNIQUE INDEX idx_unique_code ON locations(code)"
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

