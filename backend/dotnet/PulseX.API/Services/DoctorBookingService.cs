using PulseX.Core.DTOs.Doctor;
using PulseX.Core.DTOs.Appointment;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;
using PulseX.Core.Enums;
using System.Text.Json;

namespace PulseX.API.Services
{
    public class DoctorBookingService
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly IDoctorScheduleRepository _scheduleRepository;
        private readonly NotificationService _notificationService;
        private readonly PatientNotificationService _patientNotificationService;
        private readonly ILogger<DoctorBookingService> _logger;

        // Egypt Standard Time (UTC+2, no DST) � single source of truth for local time
        private static readonly TimeZoneInfo EgyptTz =
            TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

        // Current moment expressed in Egypt local time
        private static DateTime EgyptNow =>
            TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, EgyptTz);

        public DoctorBookingService(
            IDoctorRepository doctorRepository,
            IPatientRepository patientRepository,
            IAppointmentRepository appointmentRepository,
            IUserRepository userRepository,
            IDoctorScheduleRepository scheduleRepository,
            NotificationService notificationService,
            PatientNotificationService patientNotificationService,
            ILogger<DoctorBookingService> logger)
        {
            _doctorRepository = doctorRepository;
            _patientRepository = patientRepository;
            _appointmentRepository = appointmentRepository;
            _userRepository = userRepository;
            _scheduleRepository = scheduleRepository;
            _notificationService = notificationService;
            _patientNotificationService = patientNotificationService;
            _logger = logger;
        }

        private static readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

        private static List<ProfessionalExperienceItemDto> DeserializeExperience(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return new();
            try { return JsonSerializer.Deserialize<List<ProfessionalExperienceItemDto>>(json, _jsonOptions) ?? new(); }
            catch { return new(); }
        }

        // 1?? Get Doctors List with Filtering & Pagination
        public async Task<DoctorListResponseDto> GetDoctorsListAsync(DoctorListRequestDto request)
        {
            var query = (await _doctorRepository.GetAllAsync())
                .Where(d => d.IsApproved && d.User != null && d.User.IsActive)
                .AsQueryable();

            // Search by name or specialization
            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                query = query.Where(d =>
                    d.User!.FullName.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                    d.Specialization.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase));
            }

            // Filter by price range
            if (request.MinPrice.HasValue)
            {
                query = query.Where(d => d.ConsultationPrice >= request.MinPrice.Value);
            }
            if (request.MaxPrice.HasValue)
            {
                query = query.Where(d => d.ConsultationPrice <= request.MaxPrice.Value);
            }

            // Filter by rating
            if (request.MinRating.HasValue)
            {
                query = query.Where(d => d.AverageRating >= request.MinRating.Value);
            }

            // Filter by location
            if (!string.IsNullOrEmpty(request.Location))
            {
                query = query.Where(d =>
                    d.ClinicLocation != null &&
                    d.ClinicLocation.Contains(request.Location, StringComparison.OrdinalIgnoreCase));
            }

            // Calculate statistics before pagination
            var allDoctors = query.ToList();
            var statistics = new DoctorStatisticsDto
            {
                TotalDoctors = allDoctors.Count,
                TopRatedDoctors = allDoctors.Count(d => d.AverageRating >= 4.5m),
                ActiveNow = allDoctors.Count(d => IsActiveNow(d)) // Simulated
            };

            // Apply pagination
            var totalItems = allDoctors.Count;
            var totalPages = (int)Math.Ceiling(totalItems / (double)request.PageSize);
            
            var doctors = allDoctors
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(d => new DoctorCardDto
                {
                    Id = d.Id,
                    FullName = d.User!.FullName,
                    Specialization = d.Specialization,
                    ProfilePicture = d.ProfilePicture,
                    ClinicLocation = d.ClinicLocation,
                    AverageRating = d.AverageRating,
                    TotalRatings = d.TotalRatings,
                    ConsultationPrice = d.ConsultationPrice,
                    YearsOfExperience = d.YearsOfExperience,
                    IsActiveNow = IsActiveNow(d)
                })
                .ToList();

            return new DoctorListResponseDto
            {
                Statistics = statistics,
                Doctors = doctors,
                Pagination = new PaginationDto
                {
                    CurrentPage = request.PageNumber,
                    PageSize = request.PageSize,
                    TotalPages = totalPages,
                    TotalItems = totalItems,
                    HasPrevious = request.PageNumber > 1,
                    HasNext = request.PageNumber < totalPages
                }
            };
        }

        // 2?? Get Doctor Profile with Chat Authorization
        public async Task<DoctorProfileDto> GetDoctorProfileAsync(int doctorId, int userId)
        {
            var doctor = await _doctorRepository.GetByIdAsync(doctorId);
            if (doctor == null || !doctor.IsApproved)
            {
                throw new Exception("Doctor not found or not approved");
            }

            // Check if patient has active chat with this doctor
            var canChat = await CheckChatAuthorizationAsync(userId, doctorId);

            // Calculate TotalPatients
            var appointments = await _appointmentRepository.GetByDoctorIdAsync(doctorId);
            var totalPatients = appointments.Select(a => a.PatientId).Distinct().Count();

            return new DoctorProfileDto
            {
                Id = doctor.Id,
                FullName = doctor.User!.FullName,
                Email = doctor.User.Email,
                PhoneNumber = doctor.User.PhoneNumber,
                Specialization = doctor.Specialization,
                LicenseNumber = doctor.LicenseNumber,
                ConsultationPrice = doctor.ConsultationPrice,
                ClinicLocation = doctor.ClinicLocation,
                Bio = doctor.Bio,
                YearsOfExperience = doctor.YearsOfExperience,
                ProfilePicture = doctor.ProfilePicture,
                AverageRating = doctor.AverageRating,
                TotalRatings = doctor.TotalRatings,
                TotalPatients = totalPatients,

                // Profile Details
                Education = doctor.Education,
                ProfessionalExperience = DeserializeExperience(doctor.ProfessionalExperience),
                Certifications = doctor.Certifications,
                Languages = doctor.Languages,
                AvailableHours = doctor.AvailableHours,
                
                // For backwards compatibility
                About = doctor.Bio ?? "Experienced cardiologist dedicated to providing comprehensive heart care.",
                Experience = $"{doctor.YearsOfExperience}+ years of experience in cardiovascular medicine and patient care.",
                
                CanChat = canChat
            };
        }

        // 3?? Get Available Time Slots for a Doctor
        public async Task<AvailableSlotsDto> GetAvailableSlotsAsync(int doctorId, DateTime date)
        {
            var doctor = await _doctorRepository.GetByIdAsync(doctorId);
            if (doctor == null)
            {
                throw new Exception("Doctor not found");
            }

            // Treat the incoming date as an Egypt-local date so it aligns with
            // how schedule slots are stored (Egypt "HH:mm" strings).
            var egyptDate = date.Date;

            // Convert each stored UTC appointment time to Egypt local time before
            // comparing dates, so a 22:00 UTC appointment (00:00 EGY next day) is
            // never silently placed on the wrong calendar date.
            var appointments = await _appointmentRepository.GetByDoctorIdAsync(doctorId);
            var bookedTimes = appointments
                .Where(a =>
                {
                    var egyptApptDate = TimeZoneInfo.ConvertTimeFromUtc(a.AppointmentDate, EgyptTz);
                    return egyptApptDate.Date == egyptDate && a.Status != AppointmentStatus.Cancelled;
                })
                .Select(a => TimeZoneInfo.ConvertTimeFromUtc(a.AppointmentDate, EgyptTz).ToString("HH:mm"))
                .ToHashSet();

            // Fetch doctor-defined schedule slots
            var scheduleSlots = (await _scheduleRepository.GetByDoctorIdAsync(doctorId)).ToList();
            var dow = (int)egyptDate.DayOfWeek;

            // Collect times from weekly recurring slots matching the day-of-week
            var weeklyTimes = scheduleSlots
                .Where(s => s.SlotType == "Weekly" && s.DayOfWeek == dow)
                .Select(s => s.StartTime);

            // Collect times from single slots matching the exact Egypt local date
            var singleTimes = scheduleSlots
                .Where(s => s.SlotType == "Single" && s.SlotDate.HasValue && s.SlotDate.Value.Date == egyptDate)
                .Select(s => s.StartTime);

            var allTimes = weeklyTimes.Concat(singleTimes).Distinct().OrderBy(t => t).ToList();

            var slots = allTimes.Select(time => new TimeSlotDto
            {
                Time        = time,
                IsAvailable = !bookedTimes.Contains(time)
            }).ToList();

            return new AvailableSlotsDto
            {
                Date           = date,
                AvailableSlots = slots
            };
        }

        // 4?? Create Appointment with Payment
        public async Task<BookingSummaryDto> CreateAppointmentAsync(int userId, CreateAppointmentDto dto)
        {
            // Get patient
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            // Get doctor
            var doctor = await _doctorRepository.GetByIdAsync(dto.DoctorId);
            if (doctor == null || !doctor.IsApproved)
            {
                throw new Exception("Doctor not found or not approved");
            }

            // Validate time slot availability
            var appointmentDateTime = dto.AppointmentDate.Date.Add(TimeSpan.Parse(dto.TimeSlot));
            var existingAppointment = (await _appointmentRepository.GetByDoctorIdAsync(dto.DoctorId))
                .FirstOrDefault(a => 
                    a.AppointmentDate == appointmentDateTime && 
                    a.Status != AppointmentStatus.Cancelled);

            if (existingAppointment != null)
            {
                throw new Exception("Time slot is already booked. Please select another time.");
            }

            // Determine payment status based on method
            var paymentStatus = dto.PaymentMethod == PaymentMethod.Online ? PaymentStatus.Paid : PaymentStatus.Pending;
            var appointmentStatus = dto.PaymentMethod == PaymentMethod.Online ? AppointmentStatus.Confirmed : AppointmentStatus.Scheduled;
            
            // Chat expiry logic
            DateTime? chatExpiryDate = null;
            string chatMessage = "";
            
            if (dto.PaymentMethod == PaymentMethod.Online)
            {
                // Online payment: Chat active immediately for 24 hours
                chatExpiryDate = DateTime.UtcNow.AddHours(24);
                chatMessage = "Payment confirmed! Chat with your doctor is active for 24 hours.";
            }
            else
            {
                // Cash payment: Chat auto-opens at appointment time (24h window)
                chatExpiryDate = null;
                chatMessage = "Appointment confirmed! Chat will open automatically when your appointment begins.";
            }

            // Create appointment
            var appointment = new Appointment
            {
                PatientId = patient.Id,
                DoctorId = dto.DoctorId,
                AppointmentDate = appointmentDateTime,
                Notes = dto.Notes,
                Status = appointmentStatus,
                PaymentMethod = dto.PaymentMethod,
                PaymentStatus = paymentStatus,
                ChatExpiryDate = chatExpiryDate,
                IsVideoCallActive = false, // Will be activated within appointment time window
                CreatedAt = DateTime.UtcNow
            };

            await _appointmentRepository.AddAsync(appointment);
            await _notificationService.CreateAppointmentBookedAsync(
                doctor.Id,
                patient.Id,
                appointment.Id,
                appointment.AppointmentDate);
            await _patientNotificationService.CreateAppointmentStatusAsync(
                patient.Id,
                appointment.Id,
                "Appointment Booked",
                $"Your appointment with Dr. {doctor.User!.FullName} is booked for {appointment.AppointmentDate:MMM dd, yyyy} at {appointment.AppointmentDate:hh:mm tt}.");

            _logger.LogInformation($"Appointment created: ID={appointment.Id}, Patient={patient.Id}, Doctor={dto.DoctorId}, ChatExpiry={chatExpiryDate}");

            // Return booking summary
            return new BookingSummaryDto
            {
                AppointmentId = appointment.Id,
                DoctorName = doctor.User!.FullName,
                Specialization = doctor.Specialization,
                AppointmentDate = appointmentDateTime,
                TimeSlot = dto.TimeSlot,
                Status = appointmentStatus.ToString(),
                PaymentStatus = paymentStatus.ToString(),
                ConsultationFee = doctor.ConsultationPrice,
                ChatExpiryDate = chatExpiryDate,
                CanChat = chatExpiryDate.HasValue &&
                          EgyptNow < TimeZoneInfo.ConvertTimeFromUtc(chatExpiryDate.Value, EgyptTz),
                IsVideoCallActive = false,
                ChatMessage = chatMessage
            };
        }

        // 5?? Activate Chat
        public async Task<BookingSummaryDto> ActivateChatAsync(int doctorId, int appointmentId, int expiryDays = 7)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
            if (appointment == null)
            {
                throw new Exception("Appointment not found");
            }

            if (appointment.DoctorId != doctorId)
            {
                throw new Exception("Unauthorized: This appointment does not belong to you");
            }

            if (appointment.Status == AppointmentStatus.Cancelled)
            {
                throw new Exception("Cannot activate chat for cancelled appointment");
            }

            // Activate chat for 24 hours
            appointment.ChatExpiryDate = DateTime.UtcNow.AddHours(24);
            appointment.UpdatedAt = DateTime.UtcNow;

            await _appointmentRepository.UpdateAsync(appointment);

            _logger.LogInformation($"Chat activated for Appointment {appointmentId} until {appointment.ChatExpiryDate}");

            var doctor = await _doctorRepository.GetByIdAsync(doctorId);

            return new BookingSummaryDto
            {
                AppointmentId = appointment.Id,
                DoctorName = doctor?.User?.FullName ?? "Unknown",
                Specialization = doctor?.Specialization ?? "",
                AppointmentDate = appointment.AppointmentDate,
                TimeSlot = appointment.AppointmentDate.ToString("HH:mm"),
                Status = appointment.Status.ToString(),
                PaymentStatus = appointment.PaymentStatus.ToString(),
                ConsultationFee = doctor?.ConsultationPrice ?? 0,
                ChatExpiryDate = appointment.ChatExpiryDate,
                CanChat = true,
                IsVideoCallActive = false,
                ChatMessage = $"Chat activated! Available for 24 hours."
            };
        }

        // 6?? Check Chat Authorization (with Expiry)
        public async Task<bool> CheckChatAuthorizationAsync(int userId, int doctorId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                return false;
            }

            return await CanChatWithDoctorAsync(patient.Id, doctorId);
        }

        // Helper: Check if patient can chat with doctor (with expiry check)
        private async Task<bool> CanChatWithDoctorAsync(int patientId, int doctorId)
        {
            var appointments = await _appointmentRepository.GetByPatientIdAsync(patientId);
            var nowEgypt = EgyptNow;

            return appointments.Any(a =>
            {
                if (a.DoctorId != doctorId || a.Status == AppointmentStatus.Cancelled) return false;

                // Manually activated chat (expiry date set)
                if (a.ChatExpiryDate.HasValue &&
                    nowEgypt < TimeZoneInfo.ConvertTimeFromUtc(a.ChatExpiryDate.Value, EgyptTz))
                    return true;

                // Cash: auto-open during the 24-hour appointment window
                // AppointmentDate is stored as Egypt local time (Unspecified kind)
                if (a.PaymentMethod == PaymentMethod.Cash && !a.ChatExpiryDate.HasValue &&
                    nowEgypt >= a.AppointmentDate &&
                    nowEgypt <= a.AppointmentDate.AddHours(24))
                    return true;

                return false;
            });
        }

        // 7?? Check Video Call Availability
        public async Task<bool> IsVideoCallAvailableAsync(int appointmentId)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
            if (appointment == null)
            {
                return false;
            }

            // Express all times in Egypt local so the 1-hour window matches
            // what the user sees on their clock.
            var nowEgypt          = EgyptNow;
            var apptEgypt         = TimeZoneInfo.ConvertTimeFromUtc(appointment.AppointmentDate, EgyptTz);
            var appointmentStart  = apptEgypt.AddHours(-1);
            var appointmentEnd    = apptEgypt.AddHours(1);

            var expiryOk = appointment.ChatExpiryDate.HasValue &&
                           nowEgypt < TimeZoneInfo.ConvertTimeFromUtc(appointment.ChatExpiryDate.Value, EgyptTz);

            return nowEgypt >= appointmentStart &&
                   nowEgypt <= appointmentEnd   &&
                   appointment.Status != AppointmentStatus.Cancelled &&
                   expiryOk;
        }

        // 8?? Get Doctor by UserId (for Controller)
        public async Task<int?> GetDoctorIdByUserIdAsync(int userId)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(userId);
            return doctor?.Id;
        }

        // Helper: Simulate active status (can be replaced with real logic)
        private bool IsActiveNow(Doctor doctor)
        {
            // Simulate: Doctors with rating > 4.0 are "active"
            return doctor.AverageRating > 4.0m;
        }
    }
}
