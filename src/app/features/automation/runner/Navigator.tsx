import {
  Badge,
  Button,
  Card,
  Flex,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import type { Ship } from "../../../spaceTraderAPI/api";
import { setMyAgent } from "../../../spaceTraderAPI/redux/agentSlice";
import {
  setShipFuel,
  setShipNav,
} from "../../../spaceTraderAPI/redux/fleetSlice";
import { addMarketTransaction } from "../../../spaceTraderAPI/redux/tansactionSlice";
import { selectSystemWaypoints } from "../../../spaceTraderAPI/redux/waypointSlice";
import spaceTraderClient from "../../../spaceTraderAPI/spaceTraderClient";
import { navModes, wpShortestPath } from "../../../utils/tavelUtils";
import type { EventWorkerChannelData } from "../../../workers/eventWorker";

const { Title } = Typography;

function Navigator({ ship }: { ship: Ship }) {
  const [running, setRunning] = useState(false);

  const [navWaypoint, setNavWaypoint] = useState<string>();

  const [navMode, setNavMode] = useState<navModes>("BURN-AND-CRUISE-AND-DRIFT");

  const waypoints = useAppSelector((state) =>
    selectSystemWaypoints(state, ship?.nav.systemSymbol ?? ""),
  );

  const columns = [
    {
      title: "origin",
      dataIndex: "origin",
      key: "origin",
    },
    {
      title: "destination",
      dataIndex: "destination",
      key: "destination",
    },
    {
      title: "fuelCost",
      dataIndex: "fuelCost",
      key: "fuelCost",
    },
    {
      title: "travelTime",
      dataIndex: "travelTime",
      key: "travelTime",
    },
    {
      title: "flightMode",
      dataIndex: "flightMode",
      key: "flightMode",
    },
  ];

  const dispatch = useAppDispatch();

  const route = useMemo(() => {
    if (!ship || !navWaypoint)
      return {
        routes: [],
        totalFuelCost: 0,
        totalTravelTime: 0,
      };

    try {
      const routes = wpShortestPath(
        ship.nav.waypointSymbol,
        navWaypoint,
        waypoints,
        navMode,
        ship,
        0,
      );
      return {
        routes,
        totalFuelCost: routes.reduce((acc, route) => {
          return acc + (route.fuelCost ?? 0);
        }, 0),
        totalTravelTime: routes.reduce((acc, route) => {
          return acc + (route.travelTime ?? 0) + 1;
        }, 0),
      };
    } catch (error) {
      return {
        routes: [],
        totalFuelCost: NaN,
        totalTravelTime: NaN,
      };
    }
  }, [navMode, navWaypoint, ship, waypoints]);

  const action = useCallback(async () => {
    if (!navWaypoint) return;
    if (ship?.nav.waypointSymbol === navWaypoint) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const notifaication = new Notification(
        `The Ship ${ship.symbol} has arrived at ${navWaypoint}`,
      );
      setRunning(false);
      return;
    }
    const nextDest = route.routes[0];
    console.log("nextWaypoint", nextDest);

    const patch = await spaceTraderClient.FleetClient.patchShipNav(
      ship.symbol,
      {
        flightMode: nextDest.flightMode,
      },
    );

    dispatch(
      setShipNav({
        symbol: ship.symbol,
        nav: patch.data.data,
      }),
    );

    const dock = await spaceTraderClient.FleetClient.dockShip(ship.symbol);
    dispatch(
      setShipNav({
        symbol: ship.symbol,
        nav: dock.data.data.nav,
      }),
    );
    try {
      const refuel = await spaceTraderClient.FleetClient.refuelShip(
        ship.symbol,
      );
      dispatch(
        setShipFuel({
          symbol: ship.symbol,
          fuel: refuel.data.data.fuel,
        }),
      );
      dispatch(setMyAgent(refuel.data.data.agent));
      dispatch(addMarketTransaction(refuel.data.data.transaction));
    } catch (error) {
      console.log("error", error);
    }
    const orbit = await spaceTraderClient.FleetClient.orbitShip(ship.symbol);
    dispatch(
      setShipNav({
        symbol: ship.symbol,
        nav: orbit.data.data.nav,
      }),
    );
    const nextNav = await spaceTraderClient.FleetClient.navigateShip(
      ship.symbol,
      {
        waypointSymbol: nextDest.destination,
      },
    );
    dispatch(
      setShipNav({
        symbol: ship.symbol,
        nav: nextNav.data.data.nav,
      }),
    );
    dispatch(
      setShipFuel({
        symbol: ship.symbol,
        fuel: nextNav.data.data.fuel,
      }),
    );
  }, [
    dispatch,
    navWaypoint,
    route.routes,
    ship?.nav.waypointSymbol,
    ship.symbol,
  ]);

  useEffect(() => {
    const bcc = new BroadcastChannel("EventWorkerChannel");
    console.log("bcc", bcc);
    bcc.addEventListener(
      "message",
      (event: MessageEvent<EventWorkerChannelData>) => {
        console.log("event", event);
        if (
          !running ||
          event.data.type !== "arrival" ||
          event.data.shipName !== ship.symbol
        )
          return;

        action();
      },
    );

    return () => {
      bcc.close();
    };
  }, [action, running, ship.symbol]);

  return (
    <Card
      title={
        <Space>
          <Badge status={running ? "processing" : "default"} />
          Navigator
        </Space>
      }
      // title="Surveyor"
      extra={
        <Button
          onClick={() => {
            setRunning(!running);
            if (!running) {
              action();
            }
          }}
        >
          {running ? "Stop" : "Start"}
        </Button>
      }
    >
      <Space>
        <Select
          options={Object.values(waypoints).map((w) => {
            return {
              value: w.waypoint.symbol,
              label: (
                <Tooltip title={w.waypoint.type}>{w.waypoint.symbol}</Tooltip>
              ),
            };
          })}
          showSearch
          style={{ width: 130 }}
          onChange={(value) => {
            setNavWaypoint(value);
          }}
          value={navWaypoint}
        />
        <Select
          options={Object.values(navModes).map((w) => {
            return {
              value: w,
              label: <Tooltip title={w}>{w}</Tooltip>,
            };
          })}
          showSearch
          style={{ width: 200 }}
          onChange={(value) => {
            setNavMode(value);
          }}
          value={navMode}
        />
      </Space>
      <Title level={5}>
        <Flex justify="space-between">
          <span>Route to {navWaypoint}</span>
          <span>
            {Math.floor((route.totalTravelTime ?? 1) / 60 / 60)
              .toString()
              .padStart(2, "0")}
            :
            {(Math.floor((route.totalTravelTime ?? 1) / 60) % 60)
              .toString()
              .padStart(2, "0")}
            :{((route.totalTravelTime ?? 1) % 60).toString().padStart(2, "0")}{" "}
            and {route.totalFuelCost} fuel
          </span>
        </Flex>
      </Title>
      <Table dataSource={route.routes} columns={columns} size="small" />
    </Card>
  );
}

export default Navigator;
