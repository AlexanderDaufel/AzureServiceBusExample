export default class EventStream {

    static baseUrl = "https://httpqueuereader.azurewebsites.net/api";
    static code = "";

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
