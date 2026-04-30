using PulseX.Core.Interfaces;

namespace PulseX.API.Services
{
    public class ChatbotService
    {
        private readonly IHealthDataRepository _healthDataRepository;
        private readonly IPatientRepository _patientRepository;

        public ChatbotService(
            IHealthDataRepository healthDataRepository,
            IPatientRepository patientRepository)
        {
            _healthDataRepository = healthDataRepository;
            _patientRepository = patientRepository;
        }

        public async Task<string> GetChatbotResponseAsync(int patientId, string message)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);
            if (patient == null)
            {
                return "I'm sorry, I couldn't find your patient information.";
            }

            // Get patient health data
            var healthData = await _healthDataRepository.GetByPatientIdAsync(patientId);
            var healthDataList = healthData.ToList();

            // Simple stateless chatbot logic
            var lowerMessage = message.ToLower();

            if (lowerMessage.Contains("health") || lowerMessage.Contains("data"))
            {
                if (!healthDataList.Any())
                {
                    return "You don't have any health data recorded yet. Please add your health readings to get personalized insights.";
                }

                var summary = "Here's a summary of your recent health data:\n\n";
                var recentData = healthDataList.OrderByDescending(h => h.RecordedAt).Take(5);
                
                foreach (var data in recentData)
                {
                    summary += $"- {data.DataType}: {data.Value} {data.Unit} (Recorded: {data.RecordedAt:MM/dd/yyyy})\n";
                }

                return summary;
            }
            else if (lowerMessage.Contains("blood pressure"))
            {
                var bpData = healthDataList
                    .Where(h => h.DataType.ToLower().Contains("blood") && h.DataType.ToLower().Contains("pressure"))
                    .OrderByDescending(h => h.RecordedAt)
                    .FirstOrDefault();

                if (bpData != null)
                {
                    return $"Your most recent blood pressure reading was {bpData.Value} {bpData.Unit} on {bpData.RecordedAt:MM/dd/yyyy}. " +
                           "Make sure to monitor it regularly and consult your doctor if you notice any unusual changes.";
                }
                else
                {
                    return "You don't have any blood pressure readings recorded. Regular monitoring is important for maintaining good health.";
                }
            }
            else if (lowerMessage.Contains("heart rate") || lowerMessage.Contains("pulse"))
            {
                var hrData = healthDataList
                    .Where(h => h.DataType.ToLower().Contains("heart"))
                    .OrderByDescending(h => h.RecordedAt)
                    .FirstOrDefault();

                if (hrData != null)
                {
                    return $"Your most recent heart rate reading was {hrData.Value} {hrData.Unit} on {hrData.RecordedAt:MM/dd/yyyy}. " +
                           "A normal resting heart rate for adults ranges from 60 to 100 beats per minute.";
                }
                else
                {
                    return "You don't have any heart rate readings recorded. Monitoring your heart rate can help track your cardiovascular health.";
                }
            }
            else if (lowerMessage.Contains("appointment") || lowerMessage.Contains("doctor"))
            {
                return "To book an appointment with a doctor, please use the appointments section of the app. You can view available doctors and schedule your visit.";
            }
            else if (lowerMessage.Contains("help") || lowerMessage.Contains("what can you do"))
            {
                return "I can help you with:\n" +
                       "- Viewing your health data summary\n" +
                       "- Checking specific health metrics (blood pressure, heart rate, etc.)\n" +
                       "- General health information\n" +
                       "- Guidance on using the app\n\n" +
                       "Just ask me a question about your health!";
            }
            else
            {
                return "I'm PulseX AI Assistant. I can help you understand your health data and provide general health information. " +
                       "Try asking me about your health data, blood pressure, heart rate, or type 'help' to see what I can do!";
            }
        }
    }
}
