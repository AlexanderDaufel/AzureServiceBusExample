using Azure.Messaging.ServiceBus;
using AzureServiceBusExample.Adapters.Interfaces;
using AzureServiceBusExample.Models;
using AzureServiceBusExample.Options;
using CloudNative.CloudEvents;
using CloudNative.CloudEvents.NewtonsoftJson;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Net.Mime;
using System.Threading.Tasks;

namespace AzureServiceBusExample.Adapters
{
    public class AzureServiceBusAdapter : IServiceBusAdapter
    {
        private readonly ServiceBusClient _client;
        private readonly ILogger<AzureServiceBusAdapter> _logger;

        public AzureServiceBusAdapter(ILogger<AzureServiceBusAdapter> logger,
            IOptions<ConnectionStringsOptions> options)
        {
            _logger = logger;

            var connectionStrings = options?.Value;
            _client = new ServiceBusClient(connectionStrings.AzureStorageBus);
        }

        public void ReceiverMessage()
        {
            throw new System.NotImplementedException();
        }

        public async Task SendMessages(string eventContainersName, List<CloudEvent> events)
        {
            await using (var sender = _client.CreateSender(eventContainersName))
            {
                // create a batch 
                using ServiceBusMessageBatch messageBatch = await sender.CreateMessageBatchAsync();

                var highPriority = 0;
                var lowPriority = 0;
                var richLogging = 0;
                var plainLogging = 0;

                foreach (var cloudEvent in events)
                {
                    var formatter = new JsonEventFormatter();
                    var bytes = formatter.EncodeStructuredModeMessage(cloudEvent, out ContentType contentType);
                    var message = new ServiceBusMessage(bytes);

                    message.MessageId = cloudEvent.Id;
                    message.ContentType = cloudEvent.GetType().Name;
                    message.Subject = cloudEvent.Subject;
                    var data = cloudEvent?.Data as DeviceData;
                    message.ApplicationProperties.Add("Company", data.Company);
                    message.ApplicationProperties.Add("Priority", data.Priority);
                    message.ApplicationProperties.Add("LoggingLevel", data.LoggingLevel);

                    // try adding a message to the batch
                    if (!messageBatch.TryAddMessage(message))
                    {
                        // if it is too large for the batch
                        throw new Exception($"The message is too large to fit in the batch.");
                    }

                    if (data.Priority == "high") highPriority++;
                    if (data.Priority == "low") lowPriority++;
                    if (data.LoggingLevel == "rich") richLogging++;
                    if (data.LoggingLevel == "plain") plainLogging++;
                }

                // Use the producer client to send the batch of messages to the Service Bus queue
                await sender.SendMessagesAsync(messageBatch);

                _logger.LogInformation($"{messageBatch.Count} messages sent...");

                _logger.LogDebug($"{highPriority} messages were HIGH PRIORITY");
                _logger.LogDebug($"{lowPriority} messages were LOW PRIORITY");
                _logger.LogDebug($"{richLogging} messages were RICH LOGGING");
                _logger.LogDebug($"{plainLogging} messages were PLAIN LOGGING");
            }
        }
    }
}
