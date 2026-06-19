-- Migration: Add expiry_date to Blood_Stock
USE BDMS;

ALTER TABLE Blood_Stock
  ADD COLUMN IF NOT EXISTS expiry_date DATE NULL;

-- For existing rows without expiry_date, set to 42 days from donation if donation exists, else set 42 days from today
UPDATE Blood_Stock bs
LEFT JOIN Donation d ON bs.donation_id = d.donation_id
SET bs.expiry_date = COALESCE(DATE_ADD(d.donation_date, INTERVAL 42 DAY), DATE_ADD(CURDATE(), INTERVAL 42 DAY))
WHERE bs.expiry_date IS NULL;

-- Enforce not null
ALTER TABLE Blood_Stock MODIFY COLUMN expiry_date DATE NOT NULL;

-- Index for expiry lookups
CREATE INDEX IF NOT EXISTS idx_blood_stock_expiry ON Blood_Stock(expiry_date);
