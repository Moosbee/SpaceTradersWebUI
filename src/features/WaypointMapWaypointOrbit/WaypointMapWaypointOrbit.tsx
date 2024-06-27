import type {} from "../../app/spaceTraderAPI/api";
import classes from "./WaypointMapWaypointOrbit.module.css";

function WaypointMapWaypointOrbit({
  xOnePos,
  yOnePos,
  xOneOrbitCenter,
  yOneOrbitCenter,
}: {
  xOnePos: number;
  yOnePos: number;
  xOneOrbitCenter: number;
  yOneOrbitCenter: number;
}) {
  // const radius = Math.sqrt(
  //   Math.pow(xOne - xOneOrbitCenter, 2) + Math.pow(yOne - yOneOrbitCenter, 2),
  // );

  const dx = xOnePos - xOneOrbitCenter;
  const dy = yOnePos - yOneOrbitCenter;
  const radius = Math.sqrt(dx * dx + dy * dy);

  return (
    <circle
      cx={xOneOrbitCenter}
      cy={yOneOrbitCenter}
      r={radius}
      className={classes.orbit}
    ></circle>
  );
}

export default WaypointMapWaypointOrbit;
