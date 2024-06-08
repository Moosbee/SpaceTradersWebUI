import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Construction, Market, Shipyard, Waypoint } from "../../components/api";
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

  const [market, setMarket] = useState<Market | undefined>(undefined);

  useEffect(() => {
    if (waypoint.traits.some((x) => x.symbol === "MARKETPLACE")) {
      spaceTraderClient.SystemsClient.getMarket(
        waypoint.systemSymbol,
        waypoint.symbol
      ).then((response) => {
        setMarket(response.data.data);
      });
    }
  }, [waypoint]);

  const [shipyard, setShipyard] = useState<Shipyard | undefined>(undefined);

  useEffect(() => {
    if (waypoint.traits.some((x) => x.symbol === "SHIPYARD")) {
      spaceTraderClient.SystemsClient.getShipyard(
        waypoint.systemSymbol,
        waypoint.symbol
      ).then((response) => {
        setShipyard(response.data.data);
      });
    }
  }, [waypoint]);

  const [jumpGate, setJumpGate] = useState<JumpGate | undefined>(undefined);

  useEffect(() => {
    if (waypoint.type === "JUMP_GATE") {
      spaceTraderClient.SystemsClient.getJumpGate(
        waypoint.systemSymbol,
        waypoint.symbol
      ).then((response) => {
        setJumpGate(response.data.data);
      });
    }
  }, [waypoint]);

  const [constructionSite, setConstructionSite] = useState<
    Construction | undefined
  >(undefined);

  useEffect(() => {
    if (waypoint.isUnderConstruction) {
      spaceTraderClient.SystemsClient.getConstruction(
        waypoint.systemSymbol,
        waypoint.symbol
      ).then((response) => {
        setConstructionSite(response.data.data);
      });
    }
  }, [waypoint]);

  return (
    <div>
      <h2>
        Waypoint <b>{waypointID}</b> in <b>{systemID}</b>
      </h2>
      <WaypointDisp waypoint={waypoint} moreInfo={true}></WaypointDisp>
    </div>
  );
}

export default WaypointInfo;
