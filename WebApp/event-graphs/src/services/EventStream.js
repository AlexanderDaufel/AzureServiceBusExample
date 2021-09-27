export default class EventStream {

    static baseUrl = "https://httpqueuereader.azurewebsites.net/api";
    static code = "WNbpNDi5aelw0g4q1VOhry4EBdqORHvMg0zhzE3BH269NA6xsnPPtA==";

    static GetQueueData = (eventContainer, pageSize) =>
        new Promise((resolve, reject) => {
            fetch(
                `${this.baseUrl}/GetQueueData?code=${this.code}&eventContainerName=${eventContainer}&pageSize=${pageSize}`,
                {
                    method: "GET",
                    headers: new Headers({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .then((response) => resolve(response))
            .catch((error) => reject(error))
        });
}