namespace PulseX.API.Helpers
{
    /// <summary>
    /// Helper class for name manipulation operations
    /// </summary>
    public static class NameHelper
    {
        /// <summary>
        /// Splits a full name into first name and last name
        /// </summary>
        /// <param name="fullName">The full name to split</param>
        /// <returns>A tuple containing (FirstName, LastName)</returns>
        public static (string FirstName, string LastName) SplitFullName(string fullName)
        {
            if (string.IsNullOrWhiteSpace(fullName))
            {
                return (string.Empty, string.Empty);
            }

            var parts = fullName.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);

            return parts.Length switch
            {
                0 => (string.Empty, string.Empty),
                1 => (parts[0], string.Empty),
                _ => (parts[0], parts[1])
            };
        }

        /// <summary>
        /// Combines first name and last name into full name
        /// </summary>
        /// <param name="firstName">First name</param>
        /// <param name="lastName">Last name</param>
        /// <returns>Combined full name</returns>
        public static string CombineNames(string firstName, string lastName)
        {
            var first = firstName?.Trim() ?? string.Empty;
            var last = lastName?.Trim() ?? string.Empty;

            if (string.IsNullOrEmpty(first) && string.IsNullOrEmpty(last))
            {
                return string.Empty;
            }

            if (string.IsNullOrEmpty(last))
            {
                return first;
            }

            if (string.IsNullOrEmpty(first))
            {
                return last;
            }

            return $"{first} {last}";
        }
    }
}
