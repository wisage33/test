import axios from "axios";
import env from "#config/env/env.js";

const WB_API_TOKEN = env.WB_API_TOKEN;

export class WbTarrifsParser {
    constructor(private readonly wbUrl: string = "https://common-api.wildberries.ru/api/v1/tariffs/box") {}

    async parse() {
        const response = await axios.get(this.wbUrl, {
            headers: {
                Authorization: `Bearer ${WB_API_TOKEN}`,
            },
            params: {
                date: new Date().toISOString().split("T")[0],
            },
        });
        console.log("Fetched end");
        return response.data.response.data;
    }
}
