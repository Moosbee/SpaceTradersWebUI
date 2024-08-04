import {
  FleetApi,
  AgentsApi,
  SystemsApi,
  FactionsApi,
  ContractsApi,
  DefaultApi,
} from "./api/api";
import { Configuration } from "./api/configuration";

import axios from "axios";
import { selectAgentToken } from "./redux/configSlice";
import { store } from "../store";

// Create an Axios instance
const axiosInstance = axios.create();

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Modify the request config here (e.g., add headers, modify data)
    // config.headers["Authorization"] = `Bearer your-token`;
    // console.log("axiosrequest", config);
    // Add any other transformations you need

    console.log("axiosrequest", config);
    return config;
  },
  (error) => {
    return error;
  },
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Modify the response here (e.g., convert data format)
    // console.log("axiosresponse", response);
    // Add any other transformations you need
    console.log("axiosresponse", response);
    return response;
  },
  (error) => {
    return error;
  },
);

const openapiConfig = new Configuration({
  accessToken: async () => {
    const token = selectAgentToken(store.getState());
    if (token) {
      return token;
    }
    return "";
  },
});
// if (import.meta.env.VITE_SPACE_TRADERS_CLIENT_AGENT_TOKEN) {
//   openapiConfig.baseOptions = {
//     headers: {
//       Authorization:
//         "Bearer " + import.meta.env.VITE_SPACE_TRADERS_CLIENT_AGENT_TOKEN,
//       // Prefer: "dynamic=true",
//     },
//   };
// }

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

const spaceTraderClient = {
  FleetClient: FleetClient,
  AgentsClient: AgentsClient,
  SystemsClient: SystemsClient,
  FactionsClient: FactionsClient,
  ContractsClient: ContractsClient,
  DefaultClient: DefaultClient,
};

export default spaceTraderClient;
