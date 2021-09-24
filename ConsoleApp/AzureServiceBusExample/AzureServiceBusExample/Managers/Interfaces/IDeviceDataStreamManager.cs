using CloudNative.CloudEvents;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AzureServiceBusExample.Managers.Interfaces
{
    public interface IDeviceDataStreamManager
    {
        Task<List<CloudEvent>> SendDataStream();

    }
}
