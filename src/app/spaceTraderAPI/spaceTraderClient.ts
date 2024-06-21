import type { Waypoint } from "./api/api";
import {
  FleetApi,
  AgentsApi,
  SystemsApi,
  FactionsApi,
  ContractsApi,
  DefaultApi,
} from "./api/api";
import { Configuration } from "./api/configuration";

import type { RawAxiosRequestConfig } from "axios";
import axios from "axios";
import { store } from "../store";
import { putSystems } from "./redux/systemSlice";

// Create an Axios instance
const axiosInstance = axios.create();

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Modify the request config here (e.g., add headers, modify data)
    // config.headers["Authorization"] = `Bearer your-token`;
    // console.log("axiosrequest", config);
    // Add any other transformations you need
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Modify the response here (e.g., convert data format)
    // console.log("axiosresponse", response);
    // Add any other transformations you need
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const openapiConfig = new Configuration();
if (import.meta.env.VITE_SPACE_TRADERS_CLIENT_AGENT_TOKEN) {
  openapiConfig.baseOptions = {
    headers: {
      Authorization:
        "Bearer " + import.meta.env.VITE_SPACE_TRADERS_CLIENT_AGENT_TOKEN,
      // Prefer: "dynamic=true",
    },
  };
}

const FleetClient = new FleetApi(openapiConfig, undefined, axiosInstance);
const AgentsClient = new AgentsApi(openapiConfig, undefined, axiosInstance);
const SystemsClient = new SystemsApi(openapiConfig, undefined, axiosInstance);
const FactionsClient = new FactionsApi(openapiConfig, undefined, axiosInstance);
const ContractsClient = new ContractsApi(
  openapiConfig,
  undefined,
  axiosInstance,
);
const DefaultClient = new DefaultApi(openapiConfig, undefined, axiosInstance);

const CrawlClient = {
  getSystemWaypoints: async (
    systemSymbol: string,
    onProgress?: (progress: number, total: number) => void,
    options?: RawAxiosRequestConfig,
  ) => {
    const limit = 20;
    let page = 1;
    let total = 0;

    let finished = false;

    let waypoints: Waypoint[] = [];

    while (!finished) {
      const response = await SystemsClient.getSystemWaypoints(
        systemSymbol,
        page,
        limit,
        undefined,
        undefined,
        options,
      );
      total = response.data.meta.total;

      waypoints = waypoints.concat(response.data.data);

      onProgress?.((page - 1) * limit + response.data.data.length, total);

      if (response.data.data.length === 0) {
        finished = true;
      }
      if (page * limit >= total) {
        finished = true;
      }
      page++;
    }
    return waypoints;
  },
  cacheSystems: async (
    onProgress?: (progress: number, total: number) => void,
  ) => {
    const limit = 20;
    let page = 1;
    let total = 0;
    let finished = false;
    while (!finished) {
      await new Promise((resolve) => setTimeout(resolve, 510)); // rate limiting :D
      const response = await SystemsClient.getSystems(page, limit);
      total = response.data.meta.total;
      store.dispatch(putSystems(response.data.data));

      onProgress?.((page - 1) * limit + response.data.data.length, total);
      if (response.data.data.length === 0) {
        finished = true;
      }
      if (page * limit >= total) {
        finished = true;
      }
      page++;
    }
  },
};

const spaceTraderClient = {
  FleetClient: FleetClient,
  AgentsClient: AgentsClient,
  SystemsClient: SystemsClient,
  FactionsClient: FactionsClient,
  ContractsClient: ContractsClient,
  DefaultClient: DefaultClient,
  CrawlClient: CrawlClient,
};

export default spaceTraderClient;
