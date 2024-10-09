import type { ShipNavFlightMode } from "../../spaceTraderAPI/api";
import classes from "./WaypointMapRoute.module.css";

function WaypointMapRoute({
  line,
  size,
  mode,
}: {
  line: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  size: number;
  mode: ShipNavFlightMode;
}) {
  return (
    <line
      style={
        {
          "--stroke-width": `${Math.min(0.2, 200 / size)}px`,
          color: mode === "CRUISE" ? "lightgreen" : "yellow",
        } as React.CSSProperties
      }
      x1={line.x1}
      y1={line.y1}
      x2={line.x2}
      y2={line.y2}
      className={classes.route}
    ></line>
  );
}

export default WaypointMapRoute;
