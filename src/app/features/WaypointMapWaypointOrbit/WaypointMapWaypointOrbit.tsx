import type {} from "../../spaceTraderAPI/api";
import classes from "./WaypointMapWaypointOrbit.module.css";

function WaypointMapWaypointOrbit({
  xOnePos,
  yOnePos,
  xOneOrbitCenter,
  yOneOrbitCenter,
  size,
}: {
  xOnePos: number;
  yOnePos: number;
  xOneOrbitCenter: number;
  yOneOrbitCenter: number;
  size: number;
}) {
  // const radius = Math.sqrt(
  //   Math.pow(xOne - xOneOrbitCenter, 2) + Math.pow(yOne - yOneOrbitCenter, 2),
  // );

  const dx = xOnePos - xOneOrbitCenter;
  const dy = yOnePos - yOneOrbitCenter;
  const radius = Math.sqrt(dx * dx + dy * dy);

  return (
    <circle
      style={
        {
          "--stroke-width": `${Math.min(0.2, 200 / size)}px`,
        } as React.CSSProperties
      }
      cx={xOneOrbitCenter}
      cy={yOneOrbitCenter}
      r={radius}
      className={classes.orbit}
    ></circle>
  );
}

export default WaypointMapWaypointOrbit;
