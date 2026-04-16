CREATE DATABASE BDMS;
USE BDMS;

-- 1. Main User Table
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

-- 2. Profiles
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

-- 3. Organization Location
CREATE TABLE Organization_Location (
    organisation_id CHAR(10) PRIMARY KEY,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    FOREIGN KEY (organisation_id) REFERENCES User(user_id) ON DELETE RESTRICT
);

-- 4. Ownership Relation
CREATE TABLE Owns (
    hospital_id CHAR(10),
    bank_id CHAR(10),
    PRIMARY KEY (hospital_id, bank_id),
    FOREIGN KEY (hospital_id) REFERENCES Hospital(hospital_id) ON DELETE RESTRICT,
    FOREIGN KEY (bank_id) REFERENCES Blood_Bank(bank_id) ON DELETE RESTRICT
);

-- 5. Donation Table
CREATE TABLE Donation (
    donation_id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id CHAR(10),
    units_donated INT CHECK (units_donated > 0),
    donation_date DATE DEFAULT (CURRENT_DATE),
    bank_id CHAR(10),
    FOREIGN KEY (donor_id) REFERENCES Donor(donor_id) ON DELETE RESTRICT,
    FOREIGN KEY (bank_id) REFERENCES Blood_Bank(bank_id) ON DELETE RESTRICT
);

-- 6. Blood Stock
CREATE TABLE Blood_Stock (
    bank_id CHAR(10),
    stock_id INT,
    blood_grp ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'),
    units_available INT DEFAULT 0 CHECK (units_available >= 0),
    donation_id INT UNIQUE,
    PRIMARY KEY (bank_id, stock_id),
    FOREIGN KEY (bank_id) REFERENCES Blood_Bank(bank_id) ON DELETE RESTRICT,
    FOREIGN KEY (donation_id) REFERENCES Donation(donation_id) ON DELETE RESTRICT
);

-- 7. Hospital Blood Request
CREATE TABLE Blood_Request_from_hospital (
    request_id VARCHAR(36) PRIMARY KEY,
    hospital_id CHAR(10),
    final_status ENUM('Approved','Processing','Rejected','Cancelled') DEFAULT 'Processing',
    requested_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    units_required INT CHECK (units_required > 0),
    blood_grp ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'),
    priority INT DEFAULT 1,
    FOREIGN KEY (hospital_id) REFERENCES Hospital(hospital_id) ON DELETE RESTRICT
);

-- 8. Requests Sent to Blood Banks
CREATE TABLE Requests_sent_to_BloodBanks (
    request_id VARCHAR(36),
    bank_id CHAR(10),
    request_status ENUM('Approved','Processing','Rejected','Cancelled') DEFAULT 'Processing',
    PRIMARY KEY (request_id, bank_id),
    FOREIGN KEY (request_id) REFERENCES Blood_Request_from_hospital(request_id) ON DELETE RESTRICT,
    FOREIGN KEY (bank_id) REFERENCES Blood_Bank(bank_id) ON DELETE RESTRICT
);

-- 9. Blood Issued to Hospital
CREATE TABLE Blood_issued_to_hospital (
    issued_id VARCHAR(36) PRIMARY KEY,
    bank_id CHAR(10),
    blood_grp ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'),
    units_issued INT CHECK (units_issued > 0),
    issued_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    request_id VARCHAR(36) UNIQUE,
    FOREIGN KEY (bank_id) REFERENCES Blood_Bank(bank_id) ON DELETE RESTRICT,
    FOREIGN KEY (request_id) REFERENCES Blood_Request_from_hospital(request_id) ON DELETE RESTRICT
);
