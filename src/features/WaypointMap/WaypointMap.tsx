import { useMemo } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectSystem } from "../../app/spaceTraderAPI/redux/systemSlice";
import classes from "./WaypointMap.module.css";
import WaypointMapWaypoint from "../WaypointMapWaypoint/WaypointMapWaypoint";
import WaypointMapWaypointOrbit from "../WaypointMapWaypointOrbit/WaypointMapWaypointOrbit";
import { scaleNum } from "../../utils/mathUtils";
import { theme } from "antd";

function WaypointMap({ systemID }: { systemID: string }) {
  const system = useAppSelector((state) => selectSystem(state, systemID));

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

    return system.waypoints.map((w) => {
      let xOne = scaleNum(w.x, -wbCalcX, wbCalcX, 0, 100);
      let yOne = scaleNum(w.y, -wbCalcY, wbCalcY, 0, 100);

      let xOneOrbitCenter = 50;
      let yOneOrbitCenter = 50;

      if (w.orbits) {
        orbitals = orbitals + 1;

        xOneOrbitCenter = xOne;
        yOneOrbitCenter = yOne;

        const wayX =
          orbitals % 8 === 0
            ? 1
            : orbitals % 8 === 1
              ? 0
              : orbitals % 8 === 2
                ? -1
                : orbitals % 8 === 3
                  ? -1
                  : orbitals % 8 === 4
                    ? 0
                    : orbitals % 8 === 5
                      ? 1
                      : orbitals % 8 === 6
                        ? 1
                        : orbitals % 8 === 7
                          ? 0
                          : 0;
        const wayY =
          orbitals % 8 === 0
            ? 0
            : orbitals % 8 === 1
              ? 1
              : orbitals % 8 === 2
                ? 1
                : orbitals % 8 === 3
                  ? 0
                  : orbitals % 8 === 4
                    ? -1
                    : orbitals % 8 === 5
                      ? -1
                      : orbitals % 8 === 6
                        ? 0
                        : orbitals % 8 === 7
                          ? -1
                          : 0;
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
  }, [system]);

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
        <WaypointMapWaypoint system={system!} xOne={50} yOne={50} />
      </div>
    </>
  );
}

export default WaypointMap;
