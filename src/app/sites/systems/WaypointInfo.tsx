import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type {
  Construction,
  JumpGate,
  Market,
  Shipyard,
  Waypoint,
} from "../../spaceTraderAPI/api";
import { Badge, Descriptions, List } from "antd";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import WaypointDisp from "../../features/disp/WaypointDisp";
import MarketDisp from "../../features/disp/MarketDisp";
import ShipyardDisp from "../../features/disp/ShipyardDisp";
import { useAppSelector } from "../../hooks";
import { selectSelectedWaypointSymbol } from "../../spaceTraderAPI/redux/mapSlice";
import PageTitle from "../../features/PageTitle";

function WaypointInfo() {
  const { systemID: urlSystemID } = useParams();
  const { waypointID: urlWaypointID } = useParams();

  const selectedWaypoint = useAppSelector(selectSelectedWaypointSymbol);

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
    if (!urlSystemID || !urlWaypointID) return;

    let systemID = urlSystemID;
    let waypointID = urlWaypointID;

    if (urlSystemID === "selected" && urlWaypointID === "selected") {
      if (!selectedWaypoint) return;
      waypointID = selectedWaypoint.waypointSymbol;
      systemID = selectedWaypoint.systemSymbol;
    }

    spaceTraderClient.SystemsClient.getWaypoint(systemID, waypointID).then(
      (response) => {
        setWaypoint(response.data.data);
      },
    );
  }, [selectedWaypoint, urlSystemID, urlWaypointID]);

  const [market, setMarket] = useState<Market | undefined>(undefined);

  useEffect(() => {
    if (waypoint.traits.some((x) => x.symbol === "MARKETPLACE")) {
      spaceTraderClient.SystemsClient.getMarket(
        waypoint.systemSymbol,
        waypoint.symbol,
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
        waypoint.symbol,
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
        waypoint.symbol,
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
        waypoint.symbol,
      ).then((response) => {
        setConstructionSite(response.data.data);
      });
    }
  }, [waypoint]);

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title={waypoint.symbol} />
      <h2>
        Waypoint <b>{waypoint.symbol}</b> in <b>{waypoint.systemSymbol}</b>
      </h2>
      <WaypointDisp waypoint={waypoint} moreInfo={true}></WaypointDisp>

      {market && (
        <>
          <h3>Market</h3>
          <MarketDisp market={market} />
        </>
      )}

      {shipyard && (
        <>
          <h3>Shipyard</h3>
          <ShipyardDisp shipyard={shipyard} />
        </>
      )}

      {jumpGate && (
        <>
          <h3>Jump Gate</h3>
          <Descriptions
            bordered
            layout="vertical"
            items={[
              {
                label: "Symbol",
                children: jumpGate.symbol,
                span: 3,
              },
              {
                label: "Connections",
                children: (
                  <List
                    size="small"
                    dataSource={jumpGate.connections.map((connection) => (
                      <Link to={`/systems/${connection}`}>{connection}</Link>
                    ))}
                    renderItem={(item) => <List.Item>{item}</List.Item>}
                  ></List>
                ),
              },
            ]}
          />
        </>
      )}

      {constructionSite && (
        <>
          <h3>Construction Site</h3>
          <Descriptions
            bordered
            // layout="vertical"

            items={[
              {
                label: "Symbol",
                children: constructionSite.symbol,
                span: 2,
              },
              {
                label: "Status",
                children: constructionSite.isComplete ? (
                  <Badge status="success" text="Complete" />
                ) : (
                  <Badge status="processing" text="In Progress" />
                ),
                span: 2,
              },
              {
                label: "Materials",
                children: (
                  <List
                    size="small"
                    dataSource={constructionSite.materials.map((material) => (
                      <span>
                        {material.tradeSymbol} {material.fulfilled}/
                        {material.required}
                      </span>
                    ))}
                    renderItem={(item) => <List.Item>{item}</List.Item>}
                  ></List>
                ),
                span: 3,
              },
            ]}
          />
        </>
      )}
    </div>
  );
}

export default WaypointInfo;
