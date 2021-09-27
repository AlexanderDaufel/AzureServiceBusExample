using AzureServiceBusExample.Adapters.Interfaces;
using AzureServiceBusExample.Managers.Interfaces;
using AzureServiceBusExample.Models;
using AzureServiceBusExample.Options;
using CloudNative.CloudEvents;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace AzureServiceBusExample.Managers
{
    public class Company1DataStreamManager : IDeviceDataStreamManager
    {
        private readonly IDeviceDataHelper _deviceDataHelper;
        private readonly IServiceBusAdapter _serviceBusAdapter;
        private readonly ILogger<Company1DataStreamManager> _logger;
        private readonly EventContainersOptions _eventContainersOptions;

        public Company1DataStreamManager(IDeviceDataHelper deviceDataHelper,
            IServiceBusAdapter serviceBusAdapter,
            ILogger<Company1DataStreamManager>  logger,
            IOptions<EventContainersOptions> options)
        {
            _deviceDataHelper = deviceDataHelper;
            _serviceBusAdapter = serviceBusAdapter;
            _logger = logger;
            _eventContainersOptions = options?.Value;

        }

        private readonly string COMPANY = "Company 1";

        public async Task<List<CloudEvent>> SendDataStream()
        {
            var events = new List<CloudEvent>();
            var startTime = DateTimeOffset.UtcNow;
            _logger.LogInformation($"[{startTime}] Sending messages for {COMPANY.ToUpper()}");

            for (int i = 1; i <= 500; i++)
            {
                var randomizedDeviceData = _deviceDataHelper.GetDeviceData();
                randomizedDeviceData.Company = COMPANY;

                events.Add(new CloudEvent
                {
                    Id = Guid.NewGuid().ToString(),
                    Type = nameof(DeviceData),
                    Source = new Uri($"https://{randomizedDeviceData.Company.Replace(" ","")}.com/"),
                    Time = startTime.AddMinutes(i),
                    Subject = "Device Temperature Observed",
                    Data = randomizedDeviceData
                });
            }

            await _serviceBusAdapter.SendMessages(
                    _eventContainersOptions.Topic
                    , events
                        .GroupBy(e => e.Time)
                        .Select(g => g.First())
                        .OrderBy(e => e.Time)
                        .ToList());

            var recievedMessages = events
                .Where(e => (e.Data as DeviceData)?.LoggingLevel == LoggingLevelTypes.Plain)
                .Count();
            _logger.LogInformation($"We should have only recieved {recievedMessages} in the {COMPANY} queue...\n\n");

            return events;
        }
    }
}
