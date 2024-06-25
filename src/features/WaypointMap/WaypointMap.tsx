import { StarOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectSystem } from "../../app/spaceTraderAPI/redux/systemSlice";
import classes from "./WaypointMap.module.css";

function WaypointMap({ systemID }: { systemID: string }) {
  const system = useAppSelector((state) => selectSystem(state, systemID));

  const waypointsMp = useMemo(() => {
    if (!system) return [];

    const wpMinX = system.waypoints
      .map((w) => w.x)
      .reduce((acc, cur) => Math.min(acc, cur), 0);
    const wpMinY = system.waypoints
      .map((w) => w.y)
      .reduce((acc, cur) => Math.min(acc, cur), 0);

    const wpMaxX = system.waypoints
      .map((w) => w.x)
      .reduce((acc, cur) => Math.max(acc, cur), 0);
    const wpMaxY = system.waypoints
      .map((w) => w.y)
      .reduce((acc, cur) => Math.max(acc, cur), 0);

    const wbCalcX =
      Math.ceil(Math.max(Math.abs(wpMaxX), Math.abs(wpMinX)) / 100) * 100;
    const wbCalcY =
      Math.ceil(Math.max(Math.abs(wpMaxY), Math.abs(wpMinY)) / 100) * 100;

    return system.waypoints.map((w) => {
      return {
        ...w,
        xOne: scaleNum(w.x, -wbCalcX, wbCalcX, 0, 100),
        yOne: scaleNum(w.y, -wbCalcY, wbCalcY, 0, 100),
      };
    });
  }, [system]);

  const [zoom, setZoom] = useState(100);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);

  return (
    <div className={classes.root}>
      <div
        className={classes.waypointMapOut}
        style={
          {
            "--zoom": `${zoom}%`,
            "--top": `${top}%`,
            "--left": `${left}%`,
          } as React.CSSProperties
        }
      >
        <div className={classes.waypointMapIn}>
          {waypointsMp.map((w) => (
            <div
              key={w.symbol}
              style={{
                position: "absolute",
                left: w.xOne + "%",
                top: w.yOne + "%",
                translate: "-50% -50%",
              }}
            >
              <StarOutlined />
              {/* {w.x}, {w.y} */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Scales a number from one range to another.
 *
 * @param {number} number - The number to scale.
 * @param {number} inMin - The minimum value of the input range.
 * @param {number} inMax - The maximum value of the input range.
 * @param {number} outMin - The minimum value of the output range.
 * @param {number} outMax - The maximum value of the output range.
 * @returns {number} - The scaled number.
 */
function scaleNum(
  number: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export default WaypointMap;
