import { Agent } from "../api";

function AgentDisp({ agent }: { agent: Agent }) {
  return (
    <div>
      <div>Symbol</div>
      <div>{agent.symbol}</div>
      {agent.accountId && (
        <>
          <div>Account Id</div>
          <div>{agent.accountId}</div>
        </>
      )}
      <div>Credits</div>
      <div>{agent.credits}</div>
      <div>Ship count</div>
      <div>{agent.shipCount}</div>
      <div>Headquarters</div>
      <div>{agent.headquarters}</div>
      <div>Starting Faction</div>
      <div>{agent.startingFaction}</div>
    </div>
  );
}

export default AgentDisp;
