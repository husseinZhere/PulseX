-- ===================================================================
-- FIX EMPTY PatientId VALUES
-- ===================================================================
-- This script fills empty PatientId values with the format PAT00001, PAT00002, etc.
-- Run this BEFORE applying the AddPatientProfileFields migration

USE [PulseXDB]; -- Replace with your database name
GO

-- Update empty PatientId values
UPDATE Patients
SET PatientId = 'PAT' + RIGHT('00000' + CAST(Id AS VARCHAR(5)), 5)
WHERE PatientId IS NULL OR PatientId = '';
GO

-- Verify the update
SELECT Id, PatientId, UserId 
FROM Patients 
ORDER BY Id;
GO

PRINT '? PatientId values updated successfully!';
GO
