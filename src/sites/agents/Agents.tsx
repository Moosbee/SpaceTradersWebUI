import { useState, useEffect } from "react";
import { Agent } from "../../components/api";
import spaceTraderClient from "../../spaceTraderClient";
import classes from "./Agents.module.css";
import AgentDisp from "../../components/agentDisp/AgentDisp";

function Agents() {
  const [myAgent, setMyAgent] = useState<Agent>({
    credits: 0,
    headquarters: "",
    shipCount: 0,
    startingFaction: "",
    symbol: "",
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsPage, setAgentsPage] = useState(1);
  const [agentsAll, setAgentsAll] = useState(0);
  const itemsPerPage = 20;
  useEffect(() => {
    spaceTraderClient.AgentsClient.getMyAgent().then((response) => {
      console.log("my response", response);
      setMyAgent(response.data.data);
      response.data.data;
    });
    return () => {};
  }, []);
  useEffect(() => {
    spaceTraderClient.AgentsClient.getAgents(agentsPage, itemsPerPage).then(
      (response) => {
        console.log("response", response);
        setAgents(response.data.data);
        response.data.data;
        setAgentsAll(response.data.meta.total);
      }
    );
    return () => {};
  }, [agentsPage]);

  return (
    <div className={classes.agents}>
      <h2>My Agents</h2>
      <AgentDisp agent={myAgent}></AgentDisp>
      <hr />
      <h2>All Agents</h2>
      <div className={classes.agentsListConfig}>
        <button
          onClick={(e) => {
            setAgentsPage(
              Math.max(
                agentsPage - (e.ctrlKey ? 10 : 1) * (e.altKey ? 10 : 1),
                1
              )
            );
          }}
        >
          Prev
        </button>
        <div>
          <div>
            Page: {agentsPage} / {Math.ceil(agentsAll / itemsPerPage)}
          </div>
          <div>
            Entry: {agentsPage * itemsPerPage - itemsPerPage + 1} -{" "}
            {Math.min(agentsPage * itemsPerPage, agentsAll)} / {agentsAll}
          </div>
        </div>

        <button
          onClick={(e) => {
            setAgentsPage(
              Math.min(
                Math.ceil(agentsAll / itemsPerPage),
                agentsPage + (e.ctrlKey ? 10 : 1) * (e.altKey ? 10 : 1)
              )
            );
          }}
        >
          Next
        </button>
      </div>
      <div className={classes.agentsList}>
        {agents.map((value) => {
          return <AgentDisp agent={value} key={value.symbol}></AgentDisp>;
        })}
      </div>
    </div>
  );
}

export default Agents;
