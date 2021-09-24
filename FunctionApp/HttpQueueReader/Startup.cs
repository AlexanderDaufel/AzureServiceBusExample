using HttpQueueReader;
using HttpQueueReader.Adapters;
using HttpQueueReader.Adapters.Interfaces;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;

[assembly: FunctionsStartup(typeof(Startup))]
namespace HttpQueueReader
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services
                .AddSingleton<IServiceBusAdapter, AzureServiceBusAdapter>();
        }
    }
}