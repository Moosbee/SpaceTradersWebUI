import { useMemo } from "react";
import { useAppSelector } from "../../hooks";
import { selectSystem } from "../../spaceTraderAPI/redux/systemSlice";
import classes from "./WaypointMap.module.css";
import WaypointMapWaypoint from "../WaypointMapWaypoint/WaypointMapWaypoint";
import WaypointMapWaypointOrbit from "../WaypointMapWaypointOrbit/WaypointMapWaypointOrbit";
import { cyrb53, scaleNum, seedShuffle } from "../../utils/utils";
import { theme } from "antd";
import { selectShips } from "../../spaceTraderAPI/redux/fleetSlice";
import WaypointMapShip from "../WaypointMapShip/WaypointMapShip";
import WaypointMapShipOrbit from "../WaypointMapShipOrbit/WaypointMapShipOrbit";
import type { Ship } from "../../spaceTraderAPI/api";

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

  const waypointsMp = useMemo(() => {
    if (!system) return [];

    console.log(system.waypoints);

    const wpMinX = Math.min(...system.waypoints.map((w) => w.x));
    const wpMinY = Math.min(...system.waypoints.map((w) => w.y));
    const wpMaxX = Math.max(...system.waypoints.map((w) => w.x));
    const wpMaxY = Math.max(...system.waypoints.map((w) => w.y));

    const wbCalcX = Math.ceil(
      Math.max(Math.abs(wpMaxX), Math.abs(wpMinX)) * 1.05,
    );
    const wbCalcY = Math.ceil(
      Math.max(Math.abs(wpMaxY), Math.abs(wpMinY)) * 1.05,
    );

    let orbitals = 0;

    return system.waypoints
      .toSorted((a, b) => a.symbol.localeCompare(b.symbol))
      .map((w) => {
        let xOne = scaleNum(w.x, -wbCalcX, wbCalcX, 0, 100);
        let yOne = scaleNum(w.y, -wbCalcY, wbCalcY, 0, 100);

        let xOneOrbitCenter = 50;
        let yOneOrbitCenter = 50;

        if (w.orbits) {
          orbitals = orbitals + 1;

          xOneOrbitCenter = xOne;
          yOneOrbitCenter = yOne;

          const orbHash = orbitals;

          // const wayX = (cyrb53(w.symbol + w.x + w.y, 1111) % 3) - 1;
          // const wayY = (cyrb53(w.symbol + w.x + w.y, 3333) % 3) - 1;

          const index = orbHash % 8;
          const { wayX, wayY } = directions[index];

          const newX = w.x + wbCalcX * 0.01 * wayX;
          const newY = w.y + wbCalcY * 0.01 * wayY;

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
  }, [directions, system]);

  const shipsMp: {
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
  }[] = useMemo(() => {
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
              (w) => w.waypoint.symbol === navWaypoint,
            );
            if (!wp) return undefined;
            const index = orbitals % 7;
            const { wayX, wayY } = directions.filter(
              (data) => !(data.wayX !== 0 && data.wayY !== 1),
            )[index];

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
              (w) => w.waypoint.symbol === navWaypoint,
            );
            if (!wp) return undefined;
            const index = orbitals % 7;
            const { wayX, wayY } = directions.filter(
              (data) => !(data.wayX !== 0 && data.wayY !== 1),
            )[index];

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
              (w) => w.waypoint.symbol === s.nav.route.origin.symbol,
            );
            const wpEnd = waypointsMp.find(
              (w) => w.waypoint.symbol === s.nav.route.destination.symbol,
            );
            const travelPercent =
              ((new Date(s.nav.route.arrival).getTime() -
                new Date(s.nav.route.departureTime).getTime()) *
                (1 -
                  (new Date().getTime() -
                    new Date(s.nav.route.departureTime).getTime()) /
                    (new Date(s.nav.route.arrival).getTime() -
                      new Date(s.nav.route.departureTime).getTime()))) /
              100;
            if (!wpStart || !wpEnd) return undefined;

            return {
              ship: s,
              xOne: wpStart.xOne + travelPercent * (wpEnd.xOne - wpStart.xOne),
              yOne: wpStart.yOne + travelPercent * (wpEnd.yOne - wpStart.yOne),
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
      .filter((s) => !!s);
  }, [directions, ships, systemID, waypointsMp]);

  return (
    <>
      <svg
        className={classes.waypointMapOrbits}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        stroke={colorBgElevated}
      >
        {waypointsMp.map((w) => (
          <WaypointMapWaypointOrbit
            key={w.waypoint.symbol}
            xOnePos={w.xOne}
            yOnePos={w.yOne}
            xOneOrbitCenter={w.xOneOrbitCenter}
            yOneOrbitCenter={w.yOneOrbitCenter}
          />
        ))}

        {shipsMp.map((s) => (
          <WaypointMapShipOrbit
            key={s.ship.symbol}
            pos={{
              x: s.xOne,
              y: s.yOne,
            }}
            posOrbitCenter={s.posOrbitCenter}
            line={s.line}
            // WaypointMapShipOrbitProps
          />
        ))}
      </svg>
      <div className={classes.waypointMapIn}>
        {waypointsMp.map((w) => (
          <WaypointMapWaypoint
            key={w.waypoint.symbol}
            waypoint={w.waypoint}
            system={system!}
            xOne={w.xOne}
            yOne={w.yOne}
          />
        ))}

        {shipsMp.map((s) => (
          <WaypointMapShip
            key={s.ship.symbol}
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
