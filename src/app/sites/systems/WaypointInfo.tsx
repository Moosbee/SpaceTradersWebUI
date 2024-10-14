import { Badge, Button, Descriptions, Flex, List } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MarketDetail from "../../features/disp/market/MarketDetail";
import MarketSimple from "../../features/disp/market/MarketSimple";
import MarketStore from "../../features/disp/market/MarketStore";
import MarketTransactions from "../../features/disp/market/MarketTransactions";
import ShipyardDisp from "../../features/disp/ShipyardDisp";
import WaypointDisp from "../../features/disp/WaypointDisp";
import PageTitle from "../../features/PageTitle";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type { Construction, JumpGate } from "../../spaceTraderAPI/api";
import { selectShips } from "../../spaceTraderAPI/redux/fleetSlice";
import { selectSelectedWaypointSymbol } from "../../spaceTraderAPI/redux/mapSlice";
import {
  putMarkets,
  selectSystemMarket,
} from "../../spaceTraderAPI/redux/marketSlice";
import {
  putShipyards,
  putWaypoints,
  selectSystemWaypoints,
} from "../../spaceTraderAPI/redux/waypointSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";

function WaypointInfo() {
  const { systemID: urlSystemID } = useParams();
  const { waypointID: urlWaypointID } = useParams();
  const dispatch = useAppDispatch();

  const selectedWaypoint = useAppSelector(selectSelectedWaypointSymbol);

  const place = useMemo(() => {
    if (!urlSystemID || !urlWaypointID) return;

    let systemID = urlSystemID;
    let waypointID = urlWaypointID;

    if (urlSystemID === "selected" && urlWaypointID === "selected") {
      if (!selectedWaypoint) return;
      waypointID = selectedWaypoint.waypointSymbol;
      systemID = selectedWaypoint.systemSymbol;
    }

    return {
      systemID,
      waypointID,
    };
  }, [selectedWaypoint, urlSystemID, urlWaypointID]);

  const waypointSt = useAppSelector(
    (state) =>
      selectSystemWaypoints(state, place?.systemID || "")?.[
        place?.waypointID || ""
      ],
  );

  const waypoint = waypointSt.waypoint;

  const market = useAppSelector((state) =>
    selectSystemMarket(state, waypoint.systemSymbol, waypoint.symbol),
  );

  const shipyard = waypointSt.shipyard;

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

  const ships = useAppSelector(selectShips).filter(
    (value) => value.nav.waypointSymbol === waypoint.symbol,
  );

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title={waypoint.symbol} />
      <h2>
        Waypoint <b>{waypoint.symbol}</b> in <b>{waypoint.systemSymbol}</b>{" "}
        <Button
          onClick={() => {
            spaceTraderClient.SystemsClient.getWaypoint(
              waypoint.systemSymbol,
              waypoint.symbol,
            ).then((response) => {
              dispatch(
                putWaypoints({
                  systemSymbol: waypoint.systemSymbol,
                  waypoints: [response.data.data],
                }),
              );
            });
            spaceTraderClient.SystemsClient.getMarket(
              waypoint.systemSymbol,
              waypoint.symbol,
            ).then((response) => {
              dispatch(
                putMarkets({
                  systemSymbol: waypoint.systemSymbol,
                  markets: [response.data.data],
                  timestamp: Date.now(),
                }),
              );
            });
            spaceTraderClient.SystemsClient.getShipyard(
              waypoint.systemSymbol,
              waypoint.symbol,
            ).then((response) => {
              dispatch(
                putShipyards({
                  systemSymbol: waypoint.systemSymbol,
                  shipyards: [response.data.data],
                }),
              );
            });
          }}
        >
          Reload
        </Button>
      </h2>
      <Flex justify="space-between">
        <WaypointDisp waypoint={waypoint} moreInfo={true}></WaypointDisp>
        {market && market.tradeGoods.length > 0 && ships.length > 0 && (
          <MarketStore
            tradeGoods={
              market.tradeGoods[market.tradeGoods.length - 1].tradeGoods
            }
            marketSymbol={waypointSt.waypoint.symbol}
          />
        )}
      </Flex>

      {market && (
        <>
          <h3>Market</h3>
          <MarketSimple
            exchange={market.static.exchange}
            exports={market.static.exports}
            imports={market.static.imports}
          />
          <br />
          <MarketDetail tradeGoods={market.tradeGoods} />
          {/* <br />
          <MarketGraph
            tradeGoods={market.tradeGoods}
            transactions={market.transactions}
            type="sell"
          /> */}
          <br />
          <MarketTransactions transactions={market.transactions} />
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
                      <Link
                        to={`/system/${connection.split("-", 2).join("-")}/${
                          connection
                        }`}
                      >
                        {connection}
                      </Link>
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
