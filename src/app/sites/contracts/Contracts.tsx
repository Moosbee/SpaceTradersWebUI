import { Divider, Flex } from "antd";
import { useMemo } from "react";
import CachingContractsCard from "../../features/cachingCard/CachingContractsCard";
import ContractDisp from "../../features/disp/ContractDisp";
import PageTitle from "../../features/PageTitle";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { selectAgent, setMyAgent } from "../../spaceTraderAPI/redux/agentSlice";
import { selectAgentSymbol } from "../../spaceTraderAPI/redux/configSlice";
import {
  putContract,
  selectContracts,
} from "../../spaceTraderAPI/redux/contractSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";

function Contracts() {
  const dispatch = useAppDispatch();
  const contracts = useAppSelector(selectContracts);
  const agentSymbol = useAppSelector(selectAgentSymbol);
  const agent = useAppSelector((state) => selectAgent(state, agentSymbol));
  const myContracts = useMemo(
    () =>
      contracts
        .filter((value) => value.agentSymbol === agent?.agent.symbol)
        .map((w) => w.contract)
        .reverse(),
    [agent?.agent.symbol, contracts],
  );

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title={`Contracts`} />
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
