-- Add new columns to Doctors table for Profile Details
-- Run this in SQL Server Management Studio or add a migration

ALTER TABLE Doctors ADD Education NVARCHAR(500) NULL;
ALTER TABLE Doctors ADD ProfessionalExperience NVARCHAR(2000) NULL;
ALTER TABLE Doctors ADD Certifications NVARCHAR(1000) NULL;
ALTER TABLE Doctors ADD Languages NVARCHAR(100) NULL;
ALTER TABLE Doctors ADD AvailableHours NVARCHAR(200) NULL;

-- Optional: Add default values for existing doctors
UPDATE Doctors 
SET Education = 'M.D. in Internal Medicine with specialization in Cardiovascular Diseases',
    Languages = 'Arabic, English',
    AvailableHours = 'Sun-Thu: 9:00 AM - 5:00 PM'
WHERE Education IS NULL;
