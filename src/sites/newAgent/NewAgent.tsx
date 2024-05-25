import { useId, useState } from "react";
import spaceTraderClient from "../../spaceTraderClient";
import { FactionSymbol, Register201ResponseData } from "../../components/api";
import AgentDisp from "../../components/agentDisp/AgentDisp";

function NewAgent() {
  const [newAgent, setNewAgent] = useState<Register201ResponseData | null>(
    null
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.target as HTMLFormElement);

    console.log(e, data);

    const callsign = data.get("callsign");
    const faction = data.get("faction");

    if (!callsign || !faction) {
      return;
    }

    spaceTraderClient.DefaultClient.register(
      {
        symbol: callsign?.toString(),
        faction: faction.toString() as FactionSymbol,
      },
      {
        transformRequest: (data, headers) => {
          delete headers["Authorization"];
          return data;
        },
      }
    ).then((answer) => {
      console.log(answer);
      setNewAgent(answer.data.data);
    });
  };

  const callsignID = useId();
  const factionID = useId();

  return (
    <div>
      <h2>Create NewAgent</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor={callsignID}>CALLSIGN</label>
        <br />
        <input type="text" name="callsign" id={callsignID} />
        <br />
        <label htmlFor={factionID}>Faction</label>
        <br />
        <select name="faction" id={factionID}>
          <option value="COSMIC">COSMIC</option>
          <option value="VOID">VOID</option>
          <option value="GALACTIC">GALACTIC</option>
          <option value="QUANTUM">QUANTUM</option>
          <option value="DOMINION">DOMINION</option>
          <option value="ASTRO">ASTRO</option>
          <option value="CORSAIRS">CORSAIRS</option>
          <option value="OBSIDIAN">OBSIDIAN</option>
          <option value="AEGIS">AEGIS</option>
          <option value="UNITED">UNITED</option>
          <option value="SOLITARY">SOLITARY</option>
          <option value="COBALT">COBALT</option>
          <option value="OMEGA">OMEGA</option>
          <option value="ECHO">ECHO</option>
          <option value="LORDS">LORDS</option>
          <option value="CULT">CULT</option>
          <option value="ANCIENTS">ANCIENTS</option>
          <option value="SHADOW">SHADOW</option>
          <option value="ETHEREAL">ETHEREAL</option>
        </select>
        <button type="submit">Log</button>
      </form>
      {newAgent == null ? (
        ""
      ) : (
        <div>
          <h2>New Agent</h2>
          {newAgent.token}
          <AgentDisp agent={newAgent.agent}></AgentDisp>
        </div>
      )}
    </div>
  );
}

export default NewAgent;
