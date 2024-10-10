import { theme } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector } from "../../hooks";
import type { Ship } from "../../spaceTraderAPI/api";
import { selectShip, selectShips } from "../../spaceTraderAPI/redux/fleetSlice";
import {
  selectSelectedShipSymbol,
  selectSelectedWaypointSymbol,
} from "../../spaceTraderAPI/redux/mapSlice";
import { selectSystem } from "../../spaceTraderAPI/redux/systemSlice";
import { selectSystemWaypoints } from "../../spaceTraderAPI/redux/waypointSlice";
import { wpDijkstra } from "../../utils/tavelUtils";
import { cyrb53, scaleNum, seedShuffle } from "../../utils/utils";
import WaypointMapRoute from "../WaypointMapRoute/WaypointMapRoute";
import WaypointMapShip from "../WaypointMapShip/WaypointMapShip";
import WaypointMapShipOrbit from "../WaypointMapShipOrbit/WaypointMapShipOrbit";
import WaypointMapWaypoint from "../WaypointMapWaypoint/WaypointMapWaypoint";
import WaypointMapWaypointOrbit from "../WaypointMapWaypointOrbit/WaypointMapWaypointOrbit";
import classes from "./WaypointMap.module.css";

const baseDirections = [
  { wayX: 1, wayY: 0 },
  { wayX: 0, wayY: 1 },
  { wayX: -1, wayY: 1 },
  { wayX: -1, wayY: 0 },
  { wayX: 0, wayY: -1 },
  { wayX: 1, wayY: -1 },
  { wayX: 1, wayY: 0 },
  { wayX: 0, wayY: -1 },
];

function WaypointMap({ systemID }: { systemID: string }) {
  const system = useAppSelector((state) => selectSystem(state, systemID));
  const ships = useAppSelector(selectShips);
  const directions = useMemo(() => {
    if (!system) return [];
    return seedShuffle(baseDirections, cyrb53(systemID, 8888));
  }, [system, systemID]);

  const {
    token: { colorBgElevated },
  } = theme.useToken();

  const [shipsMp, setShipsMp] = useState<
    {
      ship: Ship;
      xOne: number;
      yOne: number;
      posOrbitCenter?: { x: number; y: number };
      line?: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
      };
    }[]
  >([]);

  const waypoints = useAppSelector((state) =>
    selectSystemWaypoints(state, systemID),
  );

  const waypointsMp = useMemo(() => {
    if (!system) return [];

    console.log(waypoints);

    const waypointsArr = Object.values(waypoints);

    const wpMinX = Math.min(...waypointsArr.map((w) => w.waypoint.x));
    const wpMinY = Math.min(...waypointsArr.map((w) => w.waypoint.y));
    const wpMaxX = Math.max(...waypointsArr.map((w) => w.waypoint.x));
    const wpMaxY = Math.max(...waypointsArr.map((w) => w.waypoint.y));

    const wbCalcX = Math.ceil(
      Math.max(Math.abs(wpMaxX), Math.abs(wpMinX)) * 1.05,
    );
    const wbCalcY = Math.ceil(
      Math.max(Math.abs(wpMaxY), Math.abs(wpMinY)) * 1.05,
    );

    let orbitals = 0;

    return waypointsArr
      .toSorted((a, b) => a.waypoint.symbol.localeCompare(b.waypoint.symbol))
      .map((w) => {
        let xOne = scaleNum(w.waypoint.x, -wbCalcX, wbCalcX, 0, 100);
        let yOne = scaleNum(w.waypoint.y, -wbCalcY, wbCalcY, 0, 100);

        let xOneOrbitCenter = 50;
        let yOneOrbitCenter = 50;

        if (w.waypoint.orbits) {
          orbitals = orbitals + 1;

          xOneOrbitCenter = xOne;
          yOneOrbitCenter = yOne;

          const orbHash = orbitals;

          // const wayX = (cyrb53(w.symbol + w.x + w.y, 1111) % 3) - 1;
          // const wayY = (cyrb53(w.symbol + w.x + w.y, 3333) % 3) - 1;

          const index = orbHash % 8;
          const { wayX, wayY } = directions[index];

          const newX = w.waypoint.x + wbCalcX * 0.01 * wayX;
          const newY = w.waypoint.y + wbCalcY * 0.01 * wayY;

          xOne = scaleNum(newX, -wbCalcX, wbCalcX, 0, 100);
          yOne = scaleNum(newY, -wbCalcY, wbCalcY, 0, 100);
        }
        return {
          waypoint: w,
          xOne,
          yOne,
          xOneOrbitCenter,
          yOneOrbitCenter,
        };
      });
  }, [directions, system, waypoints]);

  useEffect(() => {
    // const shipsMp: {
    //   ship: Ship;
    //   xOne: number;
    //   yOne: number;
    //   posOrbitCenter?: { x: number; y: number };
    //   line?: {
    //     x1: number;
    //     y1: number;
    //     x2: number;
    //     y2: number;
    //   };
    // }[];
    const createShipMapPoints = (): {
      ship: Ship;
      xOne: number;
      yOne: number;
      posOrbitCenter?: { x: number; y: number };
      line?: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
      };
    }[] => {
      let orbitals = 0;

      return ships
        .filter((s) => s.nav.systemSymbol === systemID)
        .map((s) => {
          const navState = s.nav.status;
          const navWaypoint = s.nav.waypointSymbol;

          orbitals = orbitals + 1;

          switch (navState) {
            case "DOCKED": {
              const wp = waypointsMp.find(
                (w) => w.waypoint.waypoint.symbol === navWaypoint,
              );
              if (!wp) return undefined;
              const index = orbitals % 8;
              const { wayX, wayY } = directions[index];

              return {
                ship: s,
                xOne: wp.xOne + 0.2 * wayX,
                yOne: wp.yOne + 0.2 * wayY,
                posOrbitCenter: undefined,
                line: {
                  x1: wp.xOne,
                  y1: wp.yOne,
                  x2: wp.xOne + 0.2 * wayX,
                  y2: wp.yOne + 0.2 * wayY,
                },
              };
            }

            case "IN_ORBIT": {
              const wp = waypointsMp.find(
                (w) => w.waypoint.waypoint.symbol === navWaypoint,
              );
              if (!wp) return undefined;
              const index = orbitals % 7;
              const { wayX, wayY } = directions[index];

              return {
                ship: s,
                xOne: wp.xOne + 0.3 * wayX,
                yOne: wp.yOne + 0.3 * wayY,
                posOrbitCenter: {
                  x: wp.xOne,
                  y: wp.yOne,
                },
                line: undefined,
              };
            }

            case "IN_TRANSIT": {
              const wpStart = waypointsMp.find(
                (w) => w.waypoint.waypoint.symbol === s.nav.route.origin.symbol,
              );
              const wpEnd = waypointsMp.find(
                (w) =>
                  w.waypoint.waypoint.symbol === s.nav.route.destination.symbol,
              );

              if (!wpStart || !wpEnd) return undefined;

              const totalTime =
                new Date(s.nav.route.arrival).getTime() -
                new Date(s.nav.route.departureTime).getTime();

              const elapsedTime =
                new Date().getTime() -
                new Date(s.nav.route.departureTime).getTime();

              const travelPercent = Math.min(
                1.1,
                (elapsedTime / totalTime) * 1,
              );

              return {
                ship: s,
                xOne:
                  wpStart.xOne + travelPercent * (wpEnd.xOne - wpStart.xOne),
                yOne:
                  wpStart.yOne + travelPercent * (wpEnd.yOne - wpStart.yOne),
                posOrbitCenter: undefined,
                line: {
                  x1: wpStart.xOne,
                  y1: wpStart.yOne,
                  x2: wpEnd.xOne,
                  y2: wpEnd.yOne,
                },
              };
            }
            default:
              return undefined;
          }
        })
        .filter((s) => !!s)
        .map((s) => s!);
    };

    const intervalId = setInterval(() => {
      setShipsMp(createShipMapPoints());
    }, 100);
    return () => clearInterval(intervalId);
  }, [directions, ships, systemID, waypointsMp]);

  const selectedWaypoint = useAppSelector(selectSelectedWaypointSymbol);
  const selectedShip = useAppSelector(selectSelectedShipSymbol);
  const ship = useAppSelector((state) => selectShip(state, selectedShip));

  const routesMp = useMemo(() => {
    if (!waypointsMp || waypointsMp.length === 0 || !selectedWaypoint)
      return [];
    const connections = wpDijkstra(
      selectedWaypoint.waypointSymbol,
      waypointsMp.map((wp) => wp.waypoint.waypoint),
      {
        flightMode: "BURN-AND-CRUISE-AND-DRIFT",
        fuelInCargo: 0,
        maxFuel: ship?.fuel.capacity ?? 300,
      },
    );

    return connections
      .map((c) => {
        const wpStart = waypointsMp.find(
          (w) => w.waypoint.waypoint.symbol === c.origin,
        );
        const wpEnd = waypointsMp.find(
          (w) => w.waypoint.waypoint.symbol === c.destination,
        );
        if (!wpStart || !wpEnd) return undefined;
        return {
          x1: wpStart.xOne,
          y1: wpStart.yOne,
          x2: wpEnd.xOne,
          y2: wpEnd.yOne,
          distance: c.distance,
          wpSymbol: c.origin,
          destination: c.destination,
          mode: c.flightMode,
        };
      })
      .filter((c) => !!c);
  }, [selectedWaypoint, ship?.fuel.capacity, waypointsMp]);

  const [size, setSize] = useState(16);
  const textboxRef = useRef<SVGSVGElement>(null);

  function outputsize() {
    if (!textboxRef.current) return;

    setSize(textboxRef.current.clientWidth);
  }

  useEffect(() => {
    if (!textboxRef.current) return;
    const observe = new ResizeObserver(outputsize);
    observe.observe(textboxRef.current);

    return () => {
      observe.disconnect();
    };
  }, []);

  return (
    <>
      <svg
        ref={textboxRef}
        className={classes.waypointMapOrbits}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        stroke={colorBgElevated}
      >
        {waypointsMp.map((w) => (
          <WaypointMapWaypointOrbit
            key={w.waypoint.waypoint.symbol + "wayOrbit"}
            xOnePos={w.xOne}
            yOnePos={w.yOne}
            xOneOrbitCenter={w.xOneOrbitCenter}
            yOneOrbitCenter={w.yOneOrbitCenter}
            size={size}
          />
        ))}

        {shipsMp.map((s) => (
          <WaypointMapShipOrbit
            size={size}
            key={s.ship.symbol + "shipOrbit"}
            pos={{
              x: s.xOne,
              y: s.yOne,
            }}
            posOrbitCenter={s.posOrbitCenter}
            line={s.line}
            // WaypointMapShipOrbitProps
          />
        ))}
        {routesMp.map((r) => (
          <WaypointMapRoute
            size={size + 5 * r.distance}
            key={r.wpSymbol + r.destination + "route" + r.mode}
            line={{
              x1: r.x1,
              y1: r.y1,
              x2: r.x2,
              y2: r.y2,
            }}
            mode={r.mode}
          />
        ))}
      </svg>
      <div className={classes.waypointMapIn}>
        {waypointsMp.map((w) => (
          <WaypointMapWaypoint
            key={w.waypoint.waypoint.symbol + "way"}
            waypoint={w.waypoint.waypoint}
            system={system!}
            xOne={w.xOne}
            yOne={w.yOne}
          />
        ))}

        {shipsMp.map((s) => (
          <WaypointMapShip
            key={s.ship.symbol + "ship"}
            ship={s.ship}
            xOne={s.xOne}
            yOne={s.yOne}
          />
        ))}
        <WaypointMapWaypoint system={system!} xOne={50} yOne={50} />
      </div>
    </>
  );
}

export default WaypointMap;
