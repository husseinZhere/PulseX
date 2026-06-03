using AutoMapper;
using PulseX.Core.DTOs.Appointment;
using PulseX.Core.Enums;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.API.Services
{
    public class AppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IActivityLogRepository _activityLogRepository;
        private readonly NotificationService _notificationService;
        private readonly PatientNotificationService _patientNotificationService;
        private readonly IMapper _mapper;

        public AppointmentService(
            IAppointmentRepository appointmentRepository,
            IPatientRepository patientRepository,
            IDoctorRepository doctorRepository,
            IActivityLogRepository activityLogRepository,
            NotificationService notificationService,
            PatientNotificationService patientNotificationService,
            IMapper mapper)
        {
            _appointmentRepository = appointmentRepository;
            _patientRepository = patientRepository;
            _doctorRepository = doctorRepository;
            _activityLogRepository = activityLogRepository;
            _notificationService = notificationService;
            _patientNotificationService = patientNotificationService;
            _mapper = mapper;
        }

        public async Task<AppointmentDto> BookAppointmentAsync(int patientId, CreateAppointmentDto dto)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);
            if (patient == null)
            {
                throw new Exception("Patient not found");
            }

            var doctor = await _doctorRepository.GetByIdAsync(dto.DoctorId);
            if (doctor == null)
            {
                throw new Exception("Doctor not found");
            }

            var appointment = new Appointment
            {
                PatientId = patientId,
                DoctorId = dto.DoctorId,
                AppointmentDate = dto.AppointmentDate,
                Notes = dto.Notes,
                PaymentMethod = dto.PaymentMethod,
                Status = AppointmentStatus.Scheduled,
                PaymentStatus = PaymentStatus.Pending
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
                $"Your appointment with Dr. {doctor.User.FullName} is booked for {appointment.AppointmentDate:MMM dd, yyyy} at {appointment.AppointmentDate:hh:mm tt}.");

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = patient.UserId,
                Action = "Book Appointment",
                EntityType = "Appointment",
                EntityId = appointment.Id,
                Details = $"Appointment booked with Dr. {doctor.User.FullName}"
            });

            var result = await _appointmentRepository.GetByIdAsync(appointment.Id);
            return _mapper.Map<AppointmentDto>(result);
        }

        public async Task<IEnumerable<AppointmentDto>> GetPatientAppointmentsAsync(int patientId)
        {
            var appointments = await _appointmentRepository.GetByPatientIdAsync(patientId);
            return _mapper.Map<IEnumerable<AppointmentDto>>(appointments);
        }

        public async Task<IEnumerable<AppointmentDto>> GetMyAppointmentsAsync(int userId)
        {
            IEnumerable<Appointment> appointments;

            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient != null)
            {
                appointments = await _appointmentRepository.GetByPatientIdAsync(patient.Id);
            }
            else
            {
                var doctor = await _doctorRepository.GetByUserIdAsync(userId);
                if (doctor != null)
                    appointments = await _appointmentRepository.GetByDoctorIdAsync(doctor.Id);
                else
                    return Enumerable.Empty<AppointmentDto>();
            }

            var nowUtc = DateTime.UtcNow;
            // AppointmentDate is stored as Egypt local (UTC+2); Egypt now = UTC + 2h
            var nowEgypt = nowUtc.AddHours(2);

            var apptList = appointments.ToList();

            // Auto-complete past scheduled appointments whose 24-hour window has closed
            var toComplete = apptList
                .Where(a => (a.Status == AppointmentStatus.Scheduled || a.Status == AppointmentStatus.Confirmed)
                            && nowEgypt > a.AppointmentDate.AddHours(24))
                .ToList();
            foreach (var a in toComplete)
            {
                a.Status = AppointmentStatus.Completed;
                await _appointmentRepository.UpdateAsync(a);
            }

            var dtos = _mapper.Map<List<AppointmentDto>>(apptList);

            // Compute CanChat for each appointment
            for (int i = 0; i < dtos.Count; i++)
            {
                var appt = apptList[i];
                var dto = dtos[i];

                if (appt.Status == AppointmentStatus.Cancelled) continue;

                // Manually activated or credit card: check expiry
                if (appt.ChatExpiryDate.HasValue && nowUtc < appt.ChatExpiryDate.Value)
                {
                    dto.CanChat = true;
                    continue;
                }

                // Cash: auto-open during the 24-hour appointment window
                if (appt.PaymentMethod == PaymentMethod.Cash && !appt.ChatExpiryDate.HasValue &&
                    nowEgypt >= appt.AppointmentDate &&
                    nowEgypt <= appt.AppointmentDate.AddHours(24))
                {
                    dto.CanChat = true;
                }
            }

            return dtos;
        }

        public async Task<IEnumerable<AppointmentDto>> GetDoctorAppointmentsAsync(int doctorId)
        {
            var appointments = await _appointmentRepository.GetByDoctorIdAsync(doctorId);
            return _mapper.Map<IEnumerable<AppointmentDto>>(appointments);
        }

        public async Task<AppointmentDto> UpdateAppointmentStatusAsync(int appointmentId, UpdateAppointmentStatusDto dto, int userId)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
            if (appointment == null)
            {
                throw new Exception("Appointment not found");
            }

            var previousStatus = appointment.Status;
            appointment.Status = dto.Status;
            
            if (dto.PaymentStatus.HasValue)
            {
                appointment.PaymentStatus = dto.PaymentStatus.Value;
            }

            await _appointmentRepository.UpdateAsync(appointment);

            if (dto.Status == AppointmentStatus.Cancelled && previousStatus != AppointmentStatus.Cancelled)
            {
                await _notificationService.CreateAppointmentCancelledAsync(
                    appointment.DoctorId,
                    appointment.PatientId,
                    appointment.Id,
                    appointment.AppointmentDate);

                var doctorName = appointment.Doctor?.User?.FullName ?? "your doctor";
                await _patientNotificationService.CreateAppointmentStatusAsync(
                    appointment.PatientId,
                    appointment.Id,
                    "Appointment Cancelled",
                    $"Your appointment with Dr. {doctorName} scheduled for {appointment.AppointmentDate:MMM dd, yyyy} at {appointment.AppointmentDate:hh:mm tt} was cancelled.",
                    "High");
            }

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = userId,
                Action = "Update Appointment Status",
                EntityType = "Appointment",
                EntityId = appointment.Id,
                Details = $"Status changed to {dto.Status}"
            });

            var result = await _appointmentRepository.GetByIdAsync(appointmentId);
            return _mapper.Map<AppointmentDto>(result);
        }
    }
}
