using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IMessageRepository
    {
        Task<Message?> GetByIdAsync(int id);
        Task<IEnumerable<Message>> GetByAppointmentIdAsync(int appointmentId);
        Task<Message> AddAsync(Message message);
        Task UpdateAsync(Message message);
    }
}
