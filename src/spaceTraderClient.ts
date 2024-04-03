import {
  FleetApi,
  AgentsApi,
  SystemsApi,
  FactionsApi,
  ContractsApi,
  DefaultApi,
} from "./components/api/api";
import { Configuration } from "./components/api/configuration";

const openapiConfig = new Configuration();
openapiConfig.baseOptions = {
  headers: {
    Authorization:
      "Bearer " + import.meta.env.VITE_SPACE_TRADERS_CLIENT_AGENT_TOKEN,
  },
};

const FleetClient = new FleetApi(openapiConfig);
const AgentsClient = new AgentsApi(openapiConfig);
const SystemsClient = new SystemsApi(openapiConfig);
const FactionsClient = new FactionsApi(openapiConfig);
const ContractsClient = new ContractsApi(openapiConfig);
const DefaultClient = new DefaultApi(openapiConfig);

export default {
  FleetClient: FleetClient,
  AgentsClient: AgentsClient,
  SystemsClient: SystemsClient,
  FactionsClient: FactionsClient,
  ContractsClient: ContractsClient,
  DefaultClient: DefaultClient,
};
