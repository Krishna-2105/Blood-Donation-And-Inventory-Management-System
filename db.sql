-- ============================================================================
-- DATABASE INITIALIZATION
-- ============================================================================
CREATE DATABASE Blood_Donation_Management_System;
USE Blood_Donation_Management_System;

-- ============================================================================
-- 1. MAIN USER & PROFILE TABLES
-- ============================================================================

-- Main User Table
CREATE TABLE User (
    user_id CHAR(10) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    phone_no VARCHAR(20) NOT NULL,
    user_type ENUM('donor', 'hospital', 'blood_bank', 'admin') NOT NULL,
    password_hash TEXT NOT NULL,
    created_dt DATE DEFAULT (CURRENT_DATE),
    CONSTRAINT chk_id_format CHECK (
        user_id LIKE 'DNR%' OR 
        user_id LIKE 'HSP%' OR 
        user_id LIKE 'BNK%' OR 
        user_id LIKE 'ADM%'
    )
);

-- Profiles
CREATE TABLE Donor (
    donor_id CHAR(10) PRIMARY KEY,
    blood_grp ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-') NOT NULL,
    dob DATE,
    FOREIGN KEY (donor_id) REFERENCES User(user_id) ON DELETE RESTRICT
);

CREATE TABLE Hospital (
    hospital_id CHAR(10) PRIMARY KEY,
    FOREIGN KEY (hospital_id) REFERENCES User(user_id) ON DELETE RESTRICT
);

CREATE TABLE Blood_Bank (
    bank_id CHAR(10) PRIMARY KEY,
    FOREIGN KEY (bank_id) REFERENCES User(user_id) ON DELETE RESTRICT
);

-- Organization Location (Updated with address)
CREATE TABLE Organization_Location (
    organisation_id CHAR(10) PRIMARY KEY,
    latitude DECIMAL(9,6) NULL,
    longitude DECIMAL(9,6) NULL,
    address TEXT NULL,
    FOREIGN KEY (organisation_id) REFERENCES User(user_id) ON DELETE RESTRICT
);

-- Ownership Relation
CREATE TABLE Owns (
    hospital_id CHAR(10),
    bank_id CHAR(10),
    PRIMARY KEY (hospital_id, bank_id),
    FOREIGN KEY (hospital_id) REFERENCES Hospital(hospital_id) ON DELETE RESTRICT,
    FOREIGN KEY (bank_id) REFERENCES Blood_Bank(bank_id) ON DELETE RESTRICT
);

-- ============================================================================
-- 2. TRANSACTIONS, STOCK & OPERATIONS
-- ============================================================================

-- Donation Table
CREATE TABLE Donation (
    donation_id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id CHAR(10),
    units_donated INT CHECK (units_donated > 0),
    donation_date DATE DEFAULT (CURRENT_DATE),
    bank_id CHAR(10),
    FOREIGN KEY (donor_id) REFERENCES Donor(donor_id) ON DELETE RESTRICT,
    FOREIGN KEY (bank_id) REFERENCES Blood_Bank(bank_id) ON DELETE RESTRICT
);

-- Blood Stock (Updated with v2/v5 additions, collection_dt omitted)
CREATE TABLE Blood_Stock (
    bank_id CHAR(10),
    stock_id INT,
    blood_grp ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'),
    units_available INT DEFAULT 0 CHECK (units_available >= 0),
    donation_id INT UNIQUE,
    expiry_date DATE NOT NULL,
    PRIMARY KEY (bank_id, stock_id),
    FOREIGN KEY (bank_id) REFERENCES Blood_Bank(bank_id) ON DELETE RESTRICT,
    FOREIGN KEY (donation_id) REFERENCES Donation(donation_id) ON DELETE RESTRICT
);

-- Index for expiry lookups
CREATE INDEX idx_blood_stock_expiry ON Blood_Stock(expiry_date);

-- Hospital Blood Request (Updated with CHAR(36) UUID format)
CREATE TABLE Blood_Request_from_hospital (
    request_id CHAR(36) PRIMARY KEY,
    hospital_id CHAR(10),
    final_status ENUM('Approved','Processing','Rejected','Cancelled') DEFAULT 'Processing',
    requested_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    units_required INT CHECK (units_required > 0),
    blood_grp ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'),
    priority INT DEFAULT 1,
    FOREIGN KEY (hospital_id) REFERENCES Hospital(hospital_id) ON DELETE RESTRICT
);

-- Requests Sent to Blood Banks (Updated with CHAR(36) UUID format)
CREATE TABLE Requests_sent_to_BloodBanks (
    request_id CHAR(36),
    bank_id CHAR(10),
    request_status ENUM('Approved','Processing','Rejected','Cancelled') DEFAULT 'Processing',
    PRIMARY KEY (request_id, bank_id),
    FOREIGN KEY (request_id) REFERENCES Blood_Request_from_hospital(request_id) ON DELETE RESTRICT,
    FOREIGN KEY (bank_id) REFERENCES Blood_Bank(bank_id) ON DELETE RESTRICT
);

-- Blood Issued to Hospital (Updated with CHAR(36) UUID format)
CREATE TABLE Blood_issued_to_hospital (
    issued_id CHAR(36) PRIMARY KEY,
    bank_id CHAR(10),
    blood_grp ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'),
    units_issued INT CHECK (units_issued > 0),
    issued_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    request_id CHAR(36) UNIQUE,
    FOREIGN KEY (bank_id) REFERENCES Blood_Bank(bank_id) ON DELETE RESTRICT,
    FOREIGN KEY (request_id) REFERENCES Blood_Request_from_hospital(request_id) ON DELETE RESTRICT
);

-- Donation Appointment Table
CREATE TABLE Donation_Appointment (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id CHAR(10) NOT NULL,
    bank_id CHAR(10) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('Pending','Approved','Rejected','Completed','Cancelled') DEFAULT 'Pending',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES Donor(donor_id) ON DELETE CASCADE,
    FOREIGN KEY (bank_id) REFERENCES Blood_Bank(bank_id) ON DELETE CASCADE
);

-- ============================================================================
-- 3. SYSTEM MANAGEMENT, AUDITS & NOTIFICATIONS
-- ============================================================================

-- Audit Logs
CREATE TABLE audit_logs (
    audit_log_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id VARCHAR(64) NOT NULL,
    action_type VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(128),
    previous_values TEXT,
    new_values TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE Notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type ENUM('REQUEST','DONATION','APPOINTMENT','INVENTORY','SYSTEM') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_user_read (user_id, is_read),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);