using Azure.Messaging.ServiceBus;
using CloudNative.CloudEvents;
using CloudNative.CloudEvents.NewtonsoftJson;
using HttpQueueReader.Adapters.Interfaces;
using HttpQueueReader.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HttpQueueReader.Adapters
{
    public class AzureServiceBusAdapter : IServiceBusAdapter
    {
        private readonly ServiceBusClient _client;
        private readonly ILogger<AzureServiceBusAdapter> _logger;

        public AzureServiceBusAdapter(ILogger<AzureServiceBusAdapter> logger,
            IConfiguration configuration)
        {
            _logger = logger;

            var connectionStrings = configuration.GetValue<string>("AzureStorageBusConnectionString");
            _client = new ServiceBusClient(connectionStrings);
        }

        public async Task<List<CloudEvent>> ReceiveMessages(string eventContainerName, int pageSize)
        {
            if (pageSize == 0)
            {
                pageSize = 10;
            }

            _logger.LogInformation($"Pulling events from '{eventContainerName}'");

            var receiver = _client.CreateReceiver(eventContainerName, new ServiceBusReceiverOptions());

            var peekedMsg = await receiver.PeekMessageAsync();
            var events = new List<CloudEvent>();
            var formatter = new JsonEventFormatter<DeviceData>();
            for (int i = 0; i < pageSize && peekedMsg != null; i++)
            {
                var message = await receiver.ReceiveMessageAsync();
                
                var cloudEvent = await formatter.DecodeStructuredModeMessageAsync(message.Body.ToStream(), null, null);
                events.Add(cloudEvent);

                await receiver.CompleteMessageAsync(message);

                peekedMsg = await receiver.PeekMessageAsync();
            }

            _logger.LogInformation($"{events.Count} events found for '{eventContainerName}'");

            return events;
        }
    }
}
