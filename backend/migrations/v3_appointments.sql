-- Migration: Add Donation_Appointment table
USE BDMS;

CREATE TABLE IF NOT EXISTS Donation_Appointment (
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
