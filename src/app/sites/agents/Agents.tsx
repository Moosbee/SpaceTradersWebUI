import type { PaginationProps } from "antd";
import { Divider, Flex, Pagination, Spin } from "antd";
import { useEffect, useState } from "react";
import AgentDisp from "../../features/disp/AgentDisp";
import PageTitle from "../../features/PageTitle";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type { PublicAgent } from "../../spaceTraderAPI/api";
import { selectAgent, setMyAgent } from "../../spaceTraderAPI/redux/agentSlice";
import { selectAgentSymbol } from "../../spaceTraderAPI/redux/configSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";

function Agents() {
  const [agents, setAgents] = useState<PublicAgent[]>([]);
  const [agentsPage, setAgentsPage] = useState(1);
  const [agentsAll, setAgentsAll] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);

  const dispatch = useAppDispatch();

  const agentSymbol = useAppSelector(selectAgentSymbol);
  const myAgent = useAppSelector((state) => selectAgent(state, agentSymbol));

  useEffect(() => {
    spaceTraderClient.AgentsClient.getMyAgent().then((response) => {
      console.log("my response", response);
      dispatch(setMyAgent(response.data.data));
    });
    return () => {};
  }, [dispatch]);
  useEffect(() => {
    setLoading(true);
    spaceTraderClient.AgentsClient.getAgents(agentsPage, itemsPerPage).then(
      (response) => {
        console.log("response", response);
        setAgents(response.data.data);
        setAgentsAll(response.data.meta.total);
        setLoading(false);
      },
    );
    return () => {};
  }, [agentsPage, itemsPerPage]);

  const onChange: PaginationProps["onChange"] = (page, pageSize) => {
    console.log(page);
    setAgentsPage(page);
    setItemsPerPage(pageSize);
  };

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title={`Agents`} />
      <h2>My Agent</h2>
      <Spin spinning={!myAgent}>
        {myAgent && <AgentDisp agent={myAgent.agent}></AgentDisp>}
      </Spin>
      <Divider />
      <h2>All Agents</h2>
      <Pagination
        current={agentsPage}
        onChange={onChange}
        total={agentsAll}
        pageSizeOptions={[5, 10, 15, 20]}
        showTotal={(total, range) =>
          `${range[0]}-${range[1]} of ${total} items`
        }
        style={{ padding: "16px", textAlign: "center" }}
      />
      <Spin spinning={loading}>
        <Flex wrap gap="middle" align="center" justify="space-evenly">
          {agents.map((value) => {
            return <AgentDisp agent={value} key={value.symbol}></AgentDisp>;
          })}
        </Flex>
      </Spin>
    </div>
  );
}

export default Agents;
