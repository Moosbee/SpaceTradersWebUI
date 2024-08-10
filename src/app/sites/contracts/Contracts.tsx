import { Divider, Flex } from "antd";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import ContractDisp from "../../features/disp/ContractDisp";
import {
  putContract,
  selectContracts,
} from "../../spaceTraderAPI/redux/contractSlice";
import { useAppDispatch, useAppSelector } from "../../hooks";
import CachingContractsCard from "../../features/cachingCard/CachingContractsCard";
import { selectAgent, setMyAgent } from "../../spaceTraderAPI/redux/agentSlice";
import { useMemo } from "react";
import { selectAgentSymbol } from "../../spaceTraderAPI/redux/configSlice";

function Contracts() {
  const dispatch = useAppDispatch();
  const contracts = useAppSelector(selectContracts);
  const agentSymbol = useAppSelector(selectAgentSymbol);
  const agent = useAppSelector((state) => selectAgent(state, agentSymbol));
  const myContracts = useMemo(
    () =>
      contracts
        .filter((value) => value.agentSymbol === agent?.agent.symbol)
        .map((w) => w.contract),
    [agent?.agent.symbol, contracts],
  );

  return (
    <div style={{ padding: "24px 24px" }}>
      <Flex justify="space-around">
        <h2>All Contracts</h2>
        <CachingContractsCard />
      </Flex>
      <Divider></Divider>
      <Flex wrap gap="middle" align="center" justify="space-evenly">
        {myContracts.map((value) => (
          <ContractDisp
            key={value.id}
            contract={value}
            onAccept={() => {
              spaceTraderClient.ContractsClient.acceptContract(value.id).then(
                (response) => {
                  console.log("response", response);
                  dispatch(
                    putContract({
                      contract: response.data.data.contract,
                      agentSymbol: response.data.data.agent.symbol,
                    }),
                  );
                  dispatch(setMyAgent(response.data.data.agent));
                },
              );
            }}
            onFulfill={() => {
              spaceTraderClient.ContractsClient.fulfillContract(value.id).then(
                (response) => {
                  console.log("response", response);
                  dispatch(
                    putContract({
                      contract: response.data.data.contract,
                      agentSymbol: response.data.data.agent.symbol,
                    }),
                  );
                  dispatch(setMyAgent(response.data.data.agent));
                },
              );
            }}
          ></ContractDisp>
        ))}
      </Flex>
    </div>
  );
}

export default Contracts;
