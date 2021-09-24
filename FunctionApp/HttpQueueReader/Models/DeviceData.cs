using System;

namespace HttpQueueReader.Models
{
    public class DeviceData
    {
        public string DeviceId { get; set; }

        public string Priority { get; set; }

        public string Temperature { get; set; }

        public string Company { get; set; }

        public string LoggingLevel { get; set; }
    }
}
