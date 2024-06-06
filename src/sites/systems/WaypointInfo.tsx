import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Waypoint } from "../../components/api";
import spaceTraderClient from "../../spaceTraderClient";
import WaypointDisp from "../../components/disp/WaypointDisp";

function WaypointInfo() {
  const { systemID } = useParams();
  const { waypointID } = useParams();
  const [waypoint, setWaypoint] = useState<Waypoint>({
    isUnderConstruction: false,
    orbitals: [],
    symbol: "",
    systemSymbol: "",
    traits: [],
    type: "ORBITAL_STATION",
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!systemID || !waypointID) return;

    spaceTraderClient.SystemsClient.getWaypoint(systemID, waypointID).then(
      (response) => {
        setWaypoint(response.data.data);
      }
    );
  }, [systemID, waypointID]);

  return (
    <div>
      <h2>
        Waypoint {waypointID} in {systemID}
      </h2>
      <WaypointDisp waypoint={waypoint}></WaypointDisp>
    </div>
  );
}

export default WaypointInfo;
