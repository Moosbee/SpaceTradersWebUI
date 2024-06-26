import type {
  SystemWaypoint,
  Waypoint,
  WaypointType,
} from "../../app/spaceTraderAPI/api";
import classes from "./WaypointMapWaypoint.module.css";

const waypointIcons: Record<WaypointType, string> = {
  PLANET: "🌍",
  GAS_GIANT: "🪐",
  MOON: "🌕",
  ORBITAL_STATION: "🚀",
  JUMP_GATE: "🔄",
  ASTEROID_FIELD: "💫",
  ASTEROID: "🌑",
  ENGINEERED_ASTEROID: "🔧",
  ASTEROID_BASE: "🏠",
  NEBULA: "🌌",
  DEBRIS_FIELD: "🗑️",
  GRAVITY_WELL: "🌀",
  ARTIFICIAL_GRAVITY_WELL: "⚙️",
  FUEL_STATION: "⛽",
};

function WaypointMapWaypoint({
  waypoint,
  xOne,
  yOne,
}: {
  waypoint: Waypoint | SystemWaypoint;
  xOne: number;
  yOne: number;
}) {
  return (
    <div
      style={{
        left: xOne + "%",
        top: yOne + "%",
      }}
      className={classes.waypointContainer}
    >
      <div className={classes.waypointIcon}>{waypointIcons[waypoint.type]}</div>
      {/* {waypoint.x}, {waypoint.y} */}
    </div>
  );
}

export default WaypointMapWaypoint;
