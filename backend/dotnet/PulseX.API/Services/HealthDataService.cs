using AutoMapper;
using PulseX.Core.DTOs.HealthData;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;
using QRCoder;

namespace PulseX.API.Services
{
    public class HealthDataService
    {
        private readonly IHealthDataRepository _healthDataRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IMedicalRecordRepository _medicalRecordRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<HealthDataService> _logger;

        public HealthDataService(
            IHealthDataRepository healthDataRepository,
            IPatientRepository patientRepository,
            IMedicalRecordRepository medicalRecordRepository,
            IMapper mapper,
            ILogger<HealthDataService> logger)
        {
            _healthDataRepository = healthDataRepository;
            _patientRepository = patientRepository;
            _medicalRecordRepository = medicalRecordRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<HealthDataDto> AddHealthDataAsync(int userId, CreateHealthDataDto dto)
        {
            // userId from JWT -> resolve to Patient record
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            var healthData = _mapper.Map<HealthData>(dto);
            healthData.PatientId = patient.Id;

            await _healthDataRepository.AddAsync(healthData);

            return _mapper.Map<HealthDataDto>(healthData);
        }

        public async Task<IEnumerable<HealthDataDto>> GetPatientHealthDataAsync(int userId)
        {
            // userId from JWT -> resolve to Patient record
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null) return Enumerable.Empty<HealthDataDto>();

            var healthData = await _healthDataRepository.GetByPatientIdAsync(patient.Id);
            return _mapper.Map<IEnumerable<HealthDataDto>>(healthData);
        }

        // Doctor adds vital signs for patient
        public async Task<VitalSignsCardDto> AddVitalSignsByDoctorAsync(int patientId, AddVitalSignsDto dto)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            var healthDataEntries = new List<HealthData>();

            // Body Temperature
            if (dto.BodyTemperature.HasValue)
            {
                healthDataEntries.Add(new HealthData
                {
                    PatientId = patientId,
                    DataType = "BodyTemperature",
                    Value = dto.BodyTemperature.Value.ToString(),
                    Unit = "�C",
                    RecordedAt = DateTime.UtcNow
                });
            }

            // Blood Sugar
            if (dto.BloodSugar.HasValue)
            {
                healthDataEntries.Add(new HealthData
                {
                    PatientId = patientId,
                    DataType = "BloodSugar",
                    Value = dto.BloodSugar.Value.ToString(),
                    Unit = "mg/dL",
                    RecordedAt = DateTime.UtcNow
                });
            }

            // Height
            if (dto.Height.HasValue)
            {
                healthDataEntries.Add(new HealthData
                {
                    PatientId = patientId,
                    DataType = "Height",
                    Value = dto.Height.Value.ToString(),
                    Unit = "cm",
                    RecordedAt = DateTime.UtcNow
                });
            }

            // Weight
            if (dto.Weight.HasValue)
            {
                healthDataEntries.Add(new HealthData
                {
                    PatientId = patientId,
                    DataType = "Weight",
                    Value = dto.Weight.Value.ToString(),
                    Unit = "kg",
                    RecordedAt = DateTime.UtcNow
                });
            }

            // Heart Rate
            if (!string.IsNullOrEmpty(dto.HeartRate))
            {
                healthDataEntries.Add(new HealthData
                {
                    PatientId = patientId,
                    DataType = "HeartRate",
                    Value = dto.HeartRate,
                    Unit = "bpm",
                    RecordedAt = DateTime.UtcNow
                });
            }

            // Blood Pressure
            if (!string.IsNullOrEmpty(dto.BloodPressure))
            {
                healthDataEntries.Add(new HealthData
                {
                    PatientId = patientId,
                    DataType = "BloodPressure",
                    Value = dto.BloodPressure,
                    Unit = "mmHg",
                    RecordedAt = DateTime.UtcNow
                });
            }

            // Blood Count
            if (!string.IsNullOrEmpty(dto.BloodCount))
            {
                healthDataEntries.Add(new HealthData
                {
                    PatientId = patientId,
                    DataType = "BloodCount",
                    Value = dto.BloodCount,
                    Unit = "%",
                    RecordedAt = DateTime.UtcNow
                });
            }

            // Cholesterol
            if (!string.IsNullOrEmpty(dto.Cholesterol))
            {
                healthDataEntries.Add(new HealthData
                {
                    PatientId = patientId,
                    DataType = "Cholesterol",
                    Value = dto.Cholesterol,
                    Unit = "mg/dL",
                    RecordedAt = DateTime.UtcNow
                });
            }

            // Save all entries
            foreach (var entry in healthDataEntries)
            {
                await _healthDataRepository.AddAsync(entry);
            }

            _logger.LogInformation($"Vital signs added for Patient {patientId} by doctor");

            // Return current vital signs
            return await GetVitalSignsCardAsync(patientId);
        }

        // Get patient vital signs (for display)
        public async Task<PatientVitalSignsDto> GetPatientVitalSignsAsync(int patientId)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            var healthData = await _healthDataRepository.GetByPatientIdAsync(patientId);
            var hasVitalSigns = healthData.Any();

            var vitalSigns = hasVitalSigns ? await GetVitalSignsCardAsync(patientId) : null;
            
            var medicalRecords = await _medicalRecordRepository.GetByPatientIdAsync(patientId);
            var recordSummaries = medicalRecords.Select(r => new MedicalRecordSummaryDto
            {
                Id = r.Id,
                FileName = r.FileName,
                RecordType = r.RecordType,
                UploadedAt = r.UploadedAt,
                FilePath = r.FilePath
            }).ToList();

            // Calculate age
            var age = patient.DateOfBirth.HasValue 
                ? DateTime.Now.Year - patient.DateOfBirth.Value.Year 
                : 0;

            // Generate QR Code if has medical records
            PatientQRCodeDto? qrCode = null;
            if (medicalRecords.Any())
            {
                qrCode = GeneratePatientQRCode(patientId, recordSummaries.Count);
            }

            return new PatientVitalSignsDto
            {
                PatientId = patientId,
                PatientName = patient.User?.FullName ?? "Unknown",
                Age = age,
                Gender = patient.Gender ?? "Unknown",
                HasVitalSigns = hasVitalSigns,
                VitalSigns = vitalSigns,
                MedicalRecords = recordSummaries,
                QRCode = qrCode
            };
        }

        // Helper: Get vital signs as card
        private async Task<VitalSignsCardDto> GetVitalSignsCardAsync(int patientId)
        {
            var healthData = await _healthDataRepository.GetByPatientIdAsync(patientId);
            var latestData = healthData
                .GroupBy(h => h.DataType)
                .Select(g => g.OrderByDescending(h => h.RecordedAt).First())
                .ToList();

            var heartRate = latestData.FirstOrDefault(h => h.DataType == "HeartRate")?.Value;
            var bloodPressure = latestData.FirstOrDefault(h => h.DataType == "BloodPressure")?.Value;
            var bloodSugar = latestData.FirstOrDefault(h => h.DataType == "BloodSugar")?.Value;
            var cholesterol = latestData.FirstOrDefault(h => h.DataType == "Cholesterol")?.Value;
            var bloodCount = latestData.FirstOrDefault(h => h.DataType == "BloodCount")?.Value;
            var bodyTemp = latestData.FirstOrDefault(h => h.DataType == "BodyTemperature")?.Value;
            var height = latestData.FirstOrDefault(h => h.DataType == "Height")?.Value;
            var weight = latestData.FirstOrDefault(h => h.DataType == "Weight")?.Value;

            // Calculate BMI if height and weight available
            decimal? bmi = null;
            if (height != null && weight != null && 
                decimal.TryParse(height, out var h) && decimal.TryParse(weight, out var w) && h > 0)
            {
                var heightInMeters = h / 100;
                bmi = Math.Round(w / (heightInMeters * heightInMeters), 2);
            }

            return new VitalSignsCardDto
            {
                HeartRate = heartRate,
                BloodPressure = bloodPressure,
                BloodSugar = bloodSugar != null ? decimal.Parse(bloodSugar) : null,
                Cholesterol = cholesterol,
                BloodCount = bloodCount,
                BodyTemperature = bodyTemp != null ? decimal.Parse(bodyTemp) : null,
                Height = height != null ? decimal.Parse(height) : null,
                Weight = weight != null ? decimal.Parse(weight) : null,
                BMI = bmi,
                LastUpdated = latestData.Any() ? latestData.Max(h => h.RecordedAt) : null
            };
        }

        // Helper: Generate QR Code for patient
        private PatientQRCodeDto GeneratePatientQRCode(int patientId, int totalFiles)
        {
            var qrData = $"pulsex://patient/{patientId}/medical-records";

            using var qrGenerator = new QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode(qrData, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrCodeData);
            var qrCodeBytes = qrCode.GetGraphic(20);
            var base64Image = Convert.ToBase64String(qrCodeBytes);

            return new PatientQRCodeDto
            {
                QRCodeImageBase64 = $"data:image/png;base64,{base64Image}",
                QRCodeData = qrData,
                GeneratedOn = DateTime.UtcNow,
                TotalFiles = totalFiles
            };
        }
    }
}
