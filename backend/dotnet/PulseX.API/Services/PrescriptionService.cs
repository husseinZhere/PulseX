using PulseX.Core.DTOs.Prescription;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;
using System.Text.Json;

namespace PulseX.API.Services
{
    public class PrescriptionService
    {
        private readonly IPrescriptionRepository _prescriptionRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly NotificationService _notificationService;
        private readonly PatientNotificationService _patientNotificationService;
        private readonly ILogger<PrescriptionService> _logger;

        public PrescriptionService(
            IPrescriptionRepository prescriptionRepository,
            IDoctorRepository doctorRepository,
            IPatientRepository patientRepository,
            IAppointmentRepository appointmentRepository,
            NotificationService notificationService,
            PatientNotificationService patientNotificationService,
            ILogger<PrescriptionService> logger)
        {
            _prescriptionRepository = prescriptionRepository;
            _doctorRepository = doctorRepository;
            _patientRepository = patientRepository;
            _appointmentRepository = appointmentRepository;
            _notificationService = notificationService;
            _patientNotificationService = patientNotificationService;
            _logger = logger;
        }

        // Get form data for direct context (from patient profile)
        public async Task<PrescriptionFormDataDto> GetFormDataForPatientAsync(int patientId)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            var age = patient.DateOfBirth.HasValue
                ? DateTime.Now.Year - patient.DateOfBirth.Value.Year
                : 0;

            return new PrescriptionFormDataDto
            {
                PatientId = patientId,
                PatientName = patient.User?.FullName,
                Gender = patient.Gender,
                Age = age,
                VisitType = "Clinic",
                IsDirectContext = true
            };
        }

        // Search patients (for general access from menu)
        public async Task<List<PatientSearchDto>> SearchPatientsAsync(int doctorId, string searchTerm)
        {
            var patients = await _patientRepository.SearchPatientsAsync(searchTerm);
            
            // Filter by patients who have an appointment with this doctor
            var appointments = await _appointmentRepository.GetByDoctorIdAsync(doctorId);
            var doctorPatientIds = appointments.Select(a => a.PatientId).ToHashSet();
            
            var filteredPatients = patients.Where(p => doctorPatientIds.Contains(p.Id)).ToList();
            
            return filteredPatients.Select(p => new PatientSearchDto
            {
                Id = p.Id,
                PatientId = p.PatientId,
                FullName = p.User?.FullName ?? "Unknown",
                Age = p.DateOfBirth.HasValue 
                    ? DateTime.Now.Year - p.DateOfBirth.Value.Year 
                    : 0,
                Gender = p.Gender ?? "Unknown",
                ProfilePicture = null
            }).ToList();
        }

        // Create and send prescription
        public async Task<PrescriptionResponseDto> CreatePrescriptionAsync(int doctorId, CreatePrescriptionDto dto)
        {
            var doctor = await _doctorRepository.GetByIdAsync(doctorId);
            if (doctor == null)
            {
                throw new Exception("Doctor not found");
            }

            var patient = await _patientRepository.GetByIdAsync(dto.PatientId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            var medicationsJson = JsonSerializer.Serialize(dto.Medications);
            var labRequestsJson = JsonSerializer.Serialize(dto.LabRequests);

            var prescription = new Prescription
            {
                DoctorId = doctorId,
                PatientId = dto.PatientId,
                AppointmentId = dto.AppointmentId,
                MedicationsJson = medicationsJson,
                LabRequestsJson = labRequestsJson,
                ClinicalNotes = dto.ClinicalNotes,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            await _prescriptionRepository.AddAsync(prescription);
            await SendPrescriptionNotificationAsync(doctorId, dto.PatientId, prescription.Id);

            _logger.LogInformation($"Prescription created: ID={prescription.Id}, Doctor={doctorId}, Patient={dto.PatientId}");

            return MapToPrescriptionResponseDto(prescription);
        }

        // Get my prescriptions (for patient) - old method
        public async Task<List<PrescriptionResponseDto>> GetMyPrescriptionsAsync(int userId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            var prescriptions = await _prescriptionRepository.GetByPatientIdAsync(patient.Id);
            return prescriptions.Select(p => MapToPrescriptionResponseDto(p)).ToList();
        }

        /// <summary>
        /// Get my prescriptions with filters and search (Enhanced for patient dashboard)
        /// </summary>
        public async Task<PrescriptionListResponseDto> GetMyPrescriptionsWithFiltersAsync(
            int userId, 
            string? status, 
            string? searchTerm, 
            int page, 
            int pageSize)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            // Get all prescriptions for patient
            var allPrescriptions = await _prescriptionRepository.GetByPatientIdAsync(patient.Id);

            // Convert to DTOs
            var prescriptionDtos = allPrescriptions.Select(p => MapToPrescriptionResponseDto(p)).ToList();

            // Filter by status
            if (!string.IsNullOrEmpty(status))
            {
                if (status.ToLower() == "active")
                {
                    prescriptionDtos = prescriptionDtos.Where(p => p.Status == "Active").ToList();
                }
                else if (status.ToLower() == "completed")
                {
                    prescriptionDtos = prescriptionDtos.Where(p => p.Status == "Completed").ToList();
                }
            }

            // Search by doctor name or date
            if (!string.IsNullOrEmpty(searchTerm))
            {
                var searchLower = searchTerm.ToLower();
                prescriptionDtos = prescriptionDtos.Where(p =>
                    p.DoctorName.ToLower().Contains(searchLower) ||
                    p.CreatedAt.ToString("MMMM dd, yyyy").ToLower().Contains(searchLower) ||
                    p.PrescriptionId.ToLower().Contains(searchLower)
                ).ToList();
            }

            // Calculate stats
            var stats = new PrescriptionStatsDto
            {
                TotalPrescriptions = allPrescriptions.Count(),
                ActivePrescriptions = prescriptionDtos.Count(p => p.Status == "Active"),
                CompletedPrescriptions = prescriptionDtos.Count(p => p.Status == "Completed")
            };

            // Pagination
            var totalCount = prescriptionDtos.Count;
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            var paginatedPrescriptions = prescriptionDtos
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return new PrescriptionListResponseDto
            {
                Prescriptions = paginatedPrescriptions,
                Stats = stats,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        /// <summary>
        /// Get patient prescription statistics
        /// </summary>
        public async Task<PrescriptionStatsDto> GetPatientPrescriptionStatsAsync(int userId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            var prescriptions = await _prescriptionRepository.GetByPatientIdAsync(patient.Id);
            var prescriptionDtos = prescriptions.Select(p => MapToPrescriptionResponseDto(p)).ToList();

            return new PrescriptionStatsDto
            {
                TotalPrescriptions = prescriptions.Count(),
                ActivePrescriptions = prescriptionDtos.Count(p => p.Status == "Active"),
                CompletedPrescriptions = prescriptionDtos.Count(p => p.Status == "Completed")
            };
        }

        private string CalculatePrescriptionStatus(DateTime createdAt, string medicationsJson)
        {
            var maxDuration = TimeSpan.Zero;
            try
            {
                var medications = JsonSerializer.Deserialize<List<MedicationDto>>(medicationsJson) ?? new();
                foreach (var med in medications)
                {
                    if (string.IsNullOrWhiteSpace(med.Duration)) continue;
                    
                    var durationSpan = ParseDuration(med.Duration);
                    if (durationSpan > maxDuration)
                    {
                        maxDuration = durationSpan;
                    }
                }
            }
            catch { }

            // Default to 7 days if no valid duration found
            if (maxDuration == TimeSpan.Zero)
            {
                maxDuration = TimeSpan.FromDays(7);
            }

            var expirationDate = createdAt.Add(maxDuration);
            return DateTime.UtcNow >= expirationDate ? "Completed" : "Active";
        }

        private TimeSpan ParseDuration(string durationStr)
        {
            durationStr = durationStr.ToLower().Trim();
            var parts = durationStr.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2 && double.TryParse(parts[0], out double value))
            {
                var unit = parts[1];
                if (unit.StartsWith("min")) return TimeSpan.FromMinutes(value);
                if (unit.StartsWith("hour") || unit.StartsWith("hr")) return TimeSpan.FromHours(value);
                if (unit.StartsWith("day") || unit == "d") return TimeSpan.FromDays(value);
                if (unit.StartsWith("week") || unit == "w") return TimeSpan.FromDays(value * 7);
                if (unit.StartsWith("month") || unit == "m") return TimeSpan.FromDays(value * 30);
            }
            return TimeSpan.Zero;
        }

        /// <summary>
        /// Map Prescription entity to DTO with status logic
        /// </summary>
        private PrescriptionResponseDto MapToPrescriptionResponseDto(Prescription prescription)
        {
            var status = CalculatePrescriptionStatus(prescription.CreatedAt, prescription.MedicationsJson);

            // Generate prescription ID (RX-YYYY-MMDD-XXXX)
            var prescriptionId = $"RX-{prescription.CreatedAt:yyyy-MMdd}-{prescription.Id:D4}";

            return new PrescriptionResponseDto
            {
                Id = prescription.Id,
                DoctorId = prescription.DoctorId,
                DoctorName = prescription.Doctor?.User?.FullName ?? "Unknown",
                DoctorSpecialization = prescription.Doctor?.Specialization,
                DoctorProfilePicture = prescription.Doctor?.ProfilePicture ?? prescription.Doctor?.User?.ProfilePicture,
                PatientId = prescription.PatientId,
                PatientName = prescription.Patient?.User?.FullName ?? "Unknown",
                PatientProfilePicture = prescription.Patient?.User?.ProfilePicture,
                AppointmentId = prescription.AppointmentId,
                Medications = JsonSerializer.Deserialize<List<MedicationDto>>(prescription.MedicationsJson) ?? new(),
                LabRequests = JsonSerializer.Deserialize<List<LabRequestDto>>(prescription.LabRequestsJson) ?? new(),
                ClinicalNotes = prescription.ClinicalNotes,
                CreatedAt = prescription.CreatedAt,
                IsRead = prescription.IsRead,
                Status = status,
                PrescriptionId = prescriptionId
            };
        }

        // Get prescription by ID
        public async Task<PrescriptionResponseDto> GetPrescriptionByIdAsync(int prescriptionId)
        {
            var prescription = await _prescriptionRepository.GetByIdAsync(prescriptionId);
            if (prescription == null)
            {
                throw new Exception("Prescription not found");
            }

            return MapToPrescriptionResponseDto(prescription);
        }

        // Mark prescription as read
        public async Task MarkAsReadAsync(int prescriptionId)
        {
            var prescription = await _prescriptionRepository.GetByIdAsync(prescriptionId);
            if (prescription != null)
            {
                prescription.IsRead = true;
                prescription.ReadAt = DateTime.UtcNow;
                await _prescriptionRepository.UpdateAsync(prescription);
            }
        }

        // Send notification to patient
        private async Task SendPrescriptionNotificationAsync(int doctorId, int patientId, int prescriptionId)
        {
            try
            {
                var doctor = await _doctorRepository.GetByIdAsync(doctorId);
                var doctorName = doctor?.User?.FullName ?? "Your Doctor";
                await _patientNotificationService.CreatePrescriptionReadyAsync(patientId, prescriptionId, doctorName);

                _logger.LogInformation(
                    $"?? New Prescription Notification | " +
                    $"Patient ID: {patientId} | " +
                    $"Prescription ID: {prescriptionId} | " +
                    $"Doctor: {doctorName} | " +
                    $"Message: Your new prescription is ready"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send prescription notification for prescription {prescriptionId}");
            }
        }

        /// <summary>
        /// Get prescription details for patient view (Enhanced with full details)
        /// </summary>
        public async Task<PrescriptionDetailsDto> GetPrescriptionDetailsAsync(int prescriptionId, int userId)
        {
            var prescription = await _prescriptionRepository.GetByIdAsync(prescriptionId);
            if (prescription == null)
            {
                throw new Exception("Prescription not found");
            }

            // Verify patient owns this prescription
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null || prescription.PatientId != patient.Id)
            {
                throw new Exception("Unauthorized access to prescription");
            }

            // Parse medications
            var medications = JsonSerializer.Deserialize<List<MedicationDto>>(prescription.MedicationsJson) ?? new();
            var medicationDetails = medications.Select((med, index) => new MedicationDetailsDto
            {
                Number = index + 1,
                DrugName = med.DrugName,
                Dosage = med.Dosage,
                Frequency = med.Frequency,
                Duration = med.Duration,
                DisplayFrequency = med.Frequency // ???? ?????? ?? logic ????
            }).ToList();

            // Parse lab requests
            var labRequests = JsonSerializer.Deserialize<List<LabRequestDto>>(prescription.LabRequestsJson) ?? new();
            var labRequestDetails = labRequests.Select((lab, index) => new LabRequestDetailsDto
            {
                Number = index + 1,
                TestName = lab.TestName,
                TestType = lab.TestType,
                AdditionalNotes = lab.AdditionalNotes,
                IsFastingRequired = lab.IsFastingRequired,
                Instructions = lab.Instructions,
                HasResult = false, // TODO: Check if patient uploaded result
                ResultUploadedAt = null,
                MedicalRecordId = null
            }).ToList();

            // Format date and time
            var formattedDate = prescription.CreatedAt.ToString("MMMM dd, yyyy");
            var formattedTime = prescription.CreatedAt.ToString("hh:mm tt");

            // Status logic
            var status = CalculatePrescriptionStatus(prescription.CreatedAt, prescription.MedicationsJson);

            return new PrescriptionDetailsDto
            {
                Id = prescription.Id,
                PrescriptionId = $"RX-{prescription.CreatedAt:yyyy-MMdd}-{prescription.Id:D4}",
                
                // Doctor Info
                DoctorId = prescription.DoctorId,
                DoctorName = prescription.Doctor?.User?.FullName ?? "Unknown",
                DoctorSpecialization = prescription.Doctor?.Specialization,
                DoctorProfilePicture = prescription.Doctor?.ProfilePicture,
                
                // Patient Info
                PatientId = prescription.PatientId,
                PatientName = prescription.Patient?.User?.FullName ?? "Unknown",
                PatientIdNumber = prescription.Patient?.PatientId,
                PatientProfilePicture = prescription.Patient?.User?.ProfilePicture,
                
                // Date Info
                CreatedAt = prescription.CreatedAt,
                FormattedDate = formattedDate,
                FormattedTime = formattedTime,
                
                // Content
                Medications = medicationDetails,
                LabRequests = labRequestDetails,
                ClinicalNotes = prescription.ClinicalNotes,
                ImportantInstructions = "Take all medications as prescribed. Do not stop or change dosage without consulting your doctor. Complete the full course of antibiotics even if you feel better. Follow any fasting requirements mentioned. Bring your ID and insurance card if applicable.",
                
                // Status
                Status = status,
                IsRead = prescription.IsRead
            };
        }
    }
}
