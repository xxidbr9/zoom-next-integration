import axios from "axios";

export const serverAPI = axios.create({ baseURL: "/" })
export const zoomAPI = axios.create({ baseURL: "https://api.zoom.us/v2" })