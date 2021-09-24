using AzureServiceBusExample.Managers.Interfaces;
using AzureServiceBusExample.Models;
using System;

namespace AzureServiceBusExample.Managers
{
    public class DeviceDataRandomizerHelper : IDeviceDataHelper
    {
        private readonly Random _random = new Random();

        public DeviceData GetDeviceData()
        {
            var temperature = _random.Next(50, 200);

            var priority = "";
            if (temperature > 115)
            {
                priority = PriorityTypes.High;
            }
            else
            {
                priority = PriorityTypes.Low;
            }

            var loggingLevel = "";
            if (_random.Next(1, 3) == 1)
            {
                loggingLevel = LoggingLevelTypes.Plain;
            }
            else
            {
                loggingLevel = LoggingLevelTypes.Rich;
            }

            return new DeviceData
            {
                DeviceId = _random.Next(1, 5).ToString(),
                Temperature = temperature.ToString(),
                Priority = priority,
                LoggingLevel = loggingLevel
            };
        }
    }
}
