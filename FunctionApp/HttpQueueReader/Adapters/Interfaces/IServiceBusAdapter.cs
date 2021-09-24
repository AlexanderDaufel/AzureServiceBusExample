using CloudNative.CloudEvents;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HttpQueueReader.Adapters.Interfaces
{
    public interface IServiceBusAdapter
    {
        Task<List<CloudEvent>> ReceiveMessages(string eventContainerName);
    }
}
