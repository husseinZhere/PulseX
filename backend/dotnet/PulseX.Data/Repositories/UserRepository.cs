using Microsoft.EntityFrameworkCore;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.Data.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.Patient)
                .Include(u => u.Doctor)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.Patient)
                .Include(u => u.Doctor)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users
                .Include(u => u.Patient)
                .Include(u => u.Doctor)
                .ToListAsync();
        }

        public async Task<User> AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task UpdateAsync(User user)
        {
            user.UpdatedAt = DateTime.UtcNow;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _context.Users
                .Include(u => u.Patient)
                .Include(u => u.Doctor)
                .FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return;

            if (user.Doctor != null)
            {
                var doctorId = user.Doctor.Id;

                // Pre-delete DoctorNotifications (cascade from Doctor, but RelatedAppointmentId has Restrict)
                var doctorNotifs = await _context.DoctorNotifications
                    .Where(n => n.DoctorId == doctorId).ToListAsync();
                _context.DoctorNotifications.RemoveRange(doctorNotifs);

                var doctorApptIds = await _context.Appointments
                    .Where(a => a.DoctorId == doctorId).Select(a => a.Id).ToListAsync();

                var doctorPrescIds = await _context.Prescriptions
                    .Where(p => p.DoctorId == doctorId).Select(p => p.Id).ToListAsync();

                // Nullify PatientNotifications referencing this doctor's prescriptions or appointments
                if (doctorPrescIds.Any())
                {
                    var pnForPresc = await _context.PatientNotifications
                        .Where(n => n.RelatedPrescriptionId.HasValue && doctorPrescIds.Contains(n.RelatedPrescriptionId.Value))
                        .ToListAsync();
                    pnForPresc.ForEach(n => n.RelatedPrescriptionId = null);
                }
                if (doctorApptIds.Any())
                {
                    var pnForAppt = await _context.PatientNotifications
                        .Where(n => n.RelatedAppointmentId.HasValue && doctorApptIds.Contains(n.RelatedAppointmentId.Value))
                        .ToListAsync();
                    pnForAppt.ForEach(n => n.RelatedAppointmentId = null);
                }

                await _context.SaveChangesAsync();

                // Delete DoctorRatings (Restrict on Doctor + Appointment — must be before Appointments)
                var doctorRatings = await _context.DoctorRatings
                    .Where(r => r.DoctorId == doctorId).ToListAsync();
                _context.DoctorRatings.RemoveRange(doctorRatings);

                // Delete Prescriptions (Restrict on Doctor — must be before Appointments too)
                var prescriptions = await _context.Prescriptions
                    .Where(p => p.DoctorId == doctorId).ToListAsync();
                _context.Prescriptions.RemoveRange(prescriptions);

                // Delete VideoCallSessions (Restrict on Appointment — must be before Appointments)
                if (doctorApptIds.Any())
                {
                    var videoSessions = await _context.VideoCallSessions
                        .Where(v => doctorApptIds.Contains(v.AppointmentId)).ToListAsync();
                    _context.VideoCallSessions.RemoveRange(videoSessions);
                }

                // Delete Appointments
                var appointments = await _context.Appointments
                    .Where(a => a.DoctorId == doctorId).ToListAsync();
                _context.Appointments.RemoveRange(appointments);

                await _context.SaveChangesAsync();
            }

            if (user.Patient != null)
            {
                var patientId = user.Patient.Id;

                // Pre-delete PatientNotifications (cascade from Patient, but RelatedAppointmentId has Restrict)
                var patientNotifs = await _context.PatientNotifications
                    .Where(n => n.PatientId == patientId).ToListAsync();
                _context.PatientNotifications.RemoveRange(patientNotifs);

                var patientApptIds = await _context.Appointments
                    .Where(a => a.PatientId == patientId).Select(a => a.Id).ToListAsync();

                // Nullify DoctorNotifications referencing this patient or patient's appointments
                var dnForPatient = await _context.DoctorNotifications
                    .Where(n => n.RelatedPatientId == patientId).ToListAsync();
                dnForPatient.ForEach(n => n.RelatedPatientId = null);

                if (patientApptIds.Any())
                {
                    var dnForAppt = await _context.DoctorNotifications
                        .Where(n => n.RelatedAppointmentId.HasValue && patientApptIds.Contains(n.RelatedAppointmentId.Value))
                        .ToListAsync();
                    dnForAppt.ForEach(n => n.RelatedAppointmentId = null);
                }

                await _context.SaveChangesAsync();

                // Delete DoctorRatings by this patient
                var patientRatings = await _context.DoctorRatings
                    .Where(r => r.PatientId == patientId).ToListAsync();
                _context.DoctorRatings.RemoveRange(patientRatings);

                // Delete Prescriptions for this patient
                var prescriptions = await _context.Prescriptions
                    .Where(p => p.PatientId == patientId).ToListAsync();
                _context.Prescriptions.RemoveRange(prescriptions);

                // Delete VideoCallSessions for patient's appointments
                if (patientApptIds.Any())
                {
                    var videoSessions = await _context.VideoCallSessions
                        .Where(v => patientApptIds.Contains(v.AppointmentId)).ToListAsync();
                    _context.VideoCallSessions.RemoveRange(videoSessions);
                }

                // Delete Appointments for this patient
                var appointments = await _context.Appointments
                    .Where(a => a.PatientId == patientId).ToListAsync();
                _context.Appointments.RemoveRange(appointments);

                await _context.SaveChangesAsync();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}

