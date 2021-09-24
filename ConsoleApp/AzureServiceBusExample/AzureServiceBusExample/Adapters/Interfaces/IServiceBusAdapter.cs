using CloudNative.CloudEvents;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AzureServiceBusExample.Adapters.Interfaces
{
    public interface IServiceBusAdapter
    {
        Task SendMessages(string eventContainersName, List<CloudEvent> events);

        void ReceiverMessage();
    }
}
