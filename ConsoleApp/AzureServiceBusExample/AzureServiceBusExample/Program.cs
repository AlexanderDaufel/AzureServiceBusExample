using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AzureServiceBusExample.Adapters;
using AzureServiceBusExample.Adapters.Interfaces;
using AzureServiceBusExample.Managers;
using AzureServiceBusExample.Managers.Interfaces;
using AzureServiceBusExample.Models;
using AzureServiceBusExample.Options;
using CloudNative.CloudEvents;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AzureServiceBusExample
{
    class Program
    {
        static async Task Main(string[] args)
        {
            //setup our DI           
            var serviceCollection = new ServiceCollection();
            ConfigureServices(serviceCollection);

            var serviceProvider = serviceCollection.BuildServiceProvider();

            var logger = serviceProvider
                .GetService<ILoggerFactory>()
                .CreateLogger<Program>();

            logger.LogInformation("Starting application\n");

            var distributorEvents = new List<CloudEvent>();
            var midmarkEvents = new List<CloudEvent>();
            var dataStreams = serviceProvider.GetService<IEnumerable<IDeviceDataStreamManager>>();

            var tasks = new List<Task>();
            foreach (var stream in dataStreams)
            {
                tasks.Add(Task.Run(async () => await stream.SendDataStream()));
            }
            await Task.WhenAll(tasks);

            logger.LogInformation("All done!");
        }

        private static void ConfigureServices(IServiceCollection services)
        {
            // build config
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false)
                .AddEnvironmentVariables()
                .Build();

            services.Configure<ConnectionStringsOptions>(configuration.GetSection("ConnectionStrings"));
            services.Configure<EventContainersOptions>(configuration.GetSection("EventContainers"));

            services
                .AddSingleton<ILoggerFactory, LoggerFactory>()
                .AddSingleton(typeof(ILogger<>), typeof(Logger<>))
                .AddLogging(option =>
                {
                    option.ClearProviders()
                        .AddConsole()
                        .AddDebug()
                        .SetMinimumLevel(LogLevel.Information);
                })
                .AddSingleton<IDeviceDataHelper, DeviceDataRandomizerHelper>()
                .AddSingleton<IServiceBusAdapter, AzureServiceBusAdapter>()
                .AddSingleton<IDeviceDataStreamManager, Company1DataStreamManager>()
                .AddSingleton<IDeviceDataStreamManager, Company2DataStreamManager>()
                .AddSingleton<IDeviceDataStreamManager, Company3DataStreamManager>();
        }
    }
}
