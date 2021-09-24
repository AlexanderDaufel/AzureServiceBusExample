using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using HttpQueueReader.Adapters.Interfaces;
using System.Linq;
using HttpQueueReader.Models;

namespace HttpQueueReader
{
    public class GetQueueData
    {
        private readonly IServiceBusAdapter _serviceBusAdapter;

        public GetQueueData(IServiceBusAdapter serviceBusAdapter)
        {
            _serviceBusAdapter = serviceBusAdapter;
        }

        [FunctionName("GetQueueData")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            string eventContainerName = req.Query["eventContainerName"];

            var events = await _serviceBusAdapter.ReceiveMessages(eventContainerName);

            log.LogInformation($"C# HTTP trigger function responding with payload of {events.Count} events.");

            var response = events
                .Select(e => new
                    {
                        specversion = e.SpecVersion.VersionId,
                        id = e.Id,
                        type = e.Type,
                        source = e.Source.ToString(),
                        time = e.Time,
                        subject = e.Subject,
                        data = (e.Data as DeviceData)
                    })
                .ToList();

            return new OkObjectResult(response);
        }
    }
}
