-- Migration: Ensure Organization_Location has lat/long/address
ALTER TABLE Organization_Location
ADD COLUMN IF NOT EXISTS latitude DECIMAL(9,6) NULL,
ADD COLUMN IF NOT EXISTS longitude DECIMAL(9,6) NULL,
ADD COLUMN IF NOT EXISTS address TEXT NULL;

-- Note: run this against BDMS if Organization_Location was created without these columns.
