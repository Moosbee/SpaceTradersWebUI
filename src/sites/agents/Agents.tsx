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
  useEffect(() => {
    spaceTraderClient.AgentsClient.getMyAgent().then((response) => {
      console.log("response", response);
      setMyAgent(response.data.data);
      response.data.data;
    });
    return () => {};
  }, []);

  return (
    <div className={classes.agents}>
      <AgentDisp agent={myAgent}></AgentDisp>
    </div>
  );
}

export default Agents;
