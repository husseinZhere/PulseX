using AutoMapper;
using PulseX.Core.DTOs;
using PulseX.Core.DTOs.Admin;
using PulseX.Core.DTOs.Appointment;
using PulseX.Core.DTOs.Auth;
using PulseX.Core.DTOs.Doctor;
using PulseX.Core.DTOs.HealthData;
using PulseX.Core.DTOs.MedicalRecord;
using PulseX.Core.DTOs.Message;
using PulseX.Core.DTOs.RiskAssessment;
using PulseX.Core.DTOs.User;
using PulseX.Core.Models;
using System.Text.Json;

namespace PulseX.API.Helpers
{
    public class MappingProfile : Profile
    {
        private static readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

        private static List<ProfessionalExperienceItemDto> DeserializeExperience(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return new();
            try { return JsonSerializer.Deserialize<List<ProfessionalExperienceItemDto>>(json, _jsonOptions) ?? new(); }
            catch { return new(); }
        }

        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserProfileDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()))
                .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.Patient != null ? src.Patient.DateOfBirth : null))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Patient != null ? src.Patient.Gender : null))
                .ForMember(dest => dest.Address, opt => opt.Ignore())
                .ForMember(dest => dest.BloodType, opt => opt.Ignore())
                .ForMember(dest => dest.Specialization, opt => opt.MapFrom(src => src.Doctor != null ? src.Doctor.Specialization : null))
                .ForMember(dest => dest.LicenseNumber, opt => opt.MapFrom(src => src.Doctor != null ? src.Doctor.LicenseNumber : null))
                .ForMember(dest => dest.ConsultationPrice, opt => opt.MapFrom(src => src.Doctor != null ? (decimal?)src.Doctor.ConsultationPrice : null))
                .ForMember(dest => dest.ClinicLocation, opt => opt.MapFrom(src => src.Doctor != null ? src.Doctor.ClinicLocation : null))
                .ForMember(dest => dest.Bio, opt => opt.MapFrom(src => src.Doctor != null ? src.Doctor.Bio : null))
                .ForMember(dest => dest.YearsOfExperience, opt => opt.MapFrom(src => src.Doctor != null ? (int?)src.Doctor.YearsOfExperience : null));

            CreateMap<User, UserManagementDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
                .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src =>
                    src.Patient != null
                        ? src.Patient.DateOfBirth
                        : src.Doctor != null
                            ? (DateTime?)src.DateOfBirth
                            : (DateTime?)null))
                .ForMember(dest => dest.ProfilePicture, opt => opt.MapFrom(src =>
                    src.Doctor != null && !string.IsNullOrEmpty(src.Doctor.ProfilePicture)
                        ? src.Doctor.ProfilePicture
                        : src.ProfilePicture))
                .ForMember(dest => dest.ConsultationPrice, opt => opt.MapFrom(src =>
                    src.Doctor != null ? (decimal?)src.Doctor.ConsultationPrice : null))
                .ForMember(dest => dest.ClinicLocation, opt => opt.MapFrom(src =>
                    src.Doctor != null ? src.Doctor.ClinicLocation : null))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src =>
                    src.Patient != null ? src.Patient.Gender : null));

            // Doctor mappings
            CreateMap<Doctor, DoctorListDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email));

            CreateMap<Doctor, DoctorProfileDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.User.PhoneNumber))
                .ForMember(dest => dest.ProfessionalExperience,
                    opt => opt.MapFrom(src => DeserializeExperience(src.ProfessionalExperience)));

            // Appointment mappings
            CreateMap<Appointment, AppointmentDto>()
                .ForMember(dest => dest.PatientUserId, opt => opt.MapFrom(src => src.Patient.UserId))
                .ForMember(dest => dest.PatientName, opt => opt.MapFrom(src => src.Patient.User.FullName))
                .ForMember(dest => dest.PatientAvatar, opt => opt.MapFrom(src => src.Patient.User.ProfilePicture))
                .ForMember(dest => dest.DoctorUserId, opt => opt.MapFrom(src => src.Doctor.UserId))
                .ForMember(dest => dest.DoctorName, opt => opt.MapFrom(src => src.Doctor.User.FullName))
                .ForMember(dest => dest.DoctorAvatar, opt => opt.MapFrom(src =>
                    !string.IsNullOrEmpty(src.Doctor.ProfilePicture)
                        ? src.Doctor.ProfilePicture
                        : src.Doctor.User.ProfilePicture))
                .ForMember(dest => dest.Specialization, opt => opt.MapFrom(src => src.Doctor.Specialization))
                .ForMember(dest => dest.ClinicLocation, opt => opt.MapFrom(src => src.Doctor.ClinicLocation))
                .ForMember(dest => dest.TimeSlot, opt => opt.MapFrom(src => src.AppointmentDate.ToString("HH:mm")))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.PaymentMethod, opt => opt.MapFrom(src => src.PaymentMethod.ToString()))
                .ForMember(dest => dest.PaymentStatus, opt => opt.MapFrom(src => src.PaymentStatus.ToString()));

            // Message mappings
            CreateMap<Message, MessageDto>()
                .ForMember(dest => dest.SenderName, opt => opt.MapFrom(src =>
                    src.SenderPatient != null ? src.SenderPatient.User.FullName :
                    src.SenderDoctor != null ? src.SenderDoctor.User.FullName : "Unknown"));

            // MedicalRecord mappings
            CreateMap<MedicalRecord, MedicalRecordDto>();

            // HealthData mappings
            CreateMap<HealthData, HealthDataDto>();
            CreateMap<CreateHealthDataDto, HealthData>();

            // Story mappings � manual mapping used in StoryService; no AutoMapper rules needed

            // ActivityLog mappings
            CreateMap<ActivityLog, ActivityLogDto>()
                .ForMember(dest => dest.UserName, opt => opt.Ignore());

            // RiskAssessment mappings
            CreateMap<RiskAssessment, RiskAssessmentDto>();
        }
    }
}
