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

        public async Task<List<CloudEvent>> ReceiveMessages(string eventContainerName)
        {
            var receiver = _client.CreateReceiver(eventContainerName, new ServiceBusReceiverOptions());

            var events = new List<CloudEvent>();
            var formatter = new JsonEventFormatter<DeviceData>();
            var message = await receiver.ReceiveMessageAsync();
            for (int i = 0; i < 100 || message == null; i++)
            {
                if (message != null)
                {
                    var cloudEvent = await formatter.DecodeStructuredModeMessageAsync(message.Body.ToStream(), null, null);
                    events.Add(cloudEvent);
                    await receiver.CompleteMessageAsync(message);
                }

                message = await receiver.ReceiveMessageAsync();
            }

            _logger.LogInformation($"{events.Count} events found for '{eventContainerName}'");

            return events;
        }
    }
}
