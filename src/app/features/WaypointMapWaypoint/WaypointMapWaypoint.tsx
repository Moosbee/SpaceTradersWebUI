import { useEffect, useRef, useState, type ReactElement } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type {
  System,
  SystemType,
  SystemWaypoint,
  Waypoint,
  WaypointType,
} from "../../spaceTraderAPI/api";
import {
  selectSelectedSystemSymbol,
  selectSelectedWaypointSymbol,
  setSelectedSystemSymbol,
  setSelectedWaypointSymbol,
} from "../../spaceTraderAPI/redux/mapSlice";
import FaIcon from "../FontAwsome/FaIcon";
import NounIcon from "../FontAwsome/NounIcon";
import classes from "./WaypointMapWaypoint.module.css";

//TODO change color to antd color and dark/light mode

const waypointIcons: Record<
  WaypointType,
  { icon: ReactElement; color: string }
> = {
  PLANET: {
    icon: <FaIcon type="solid" icon="fa-earth-oceania" />,
    color: "brown",
  },
  GAS_GIANT: {
    icon: <FaIcon type="solid" icon="fa-planet-ringed" />,
    color: "lightblue",
  },
  MOON: {
    icon: <FaIcon type="solid" icon="fa-moon" />,
    color: "grey",
  },
  ORBITAL_STATION: {
    icon: <NounIcon name="space-station" />,
    color: "yellow",
  },
  JUMP_GATE: {
    icon: <FaIcon type="solid" icon="fa-bullseye-pointer" />,
    color: "yellow",
  },
  ASTEROID_FIELD: {
    icon: <NounIcon name="asteroid-field" />,
    color: "lightgrey",
  },
  ASTEROID: {
    icon: <NounIcon name="asteroid" />,
    color: "lightgrey",
  },
  ENGINEERED_ASTEROID: {
    icon: <NounIcon name="asteroid_2" />,
    color: "lightgrey",
  },
  ASTEROID_BASE: {
    icon: <FaIcon type="solid" icon="fa-planet-ringed" />,
    color: "yellow",
  },
  NEBULA: {
    icon: <NounIcon name="nebula" />,
    color: "currentColor",
  },
  DEBRIS_FIELD: {
    icon: <FaIcon type="solid" icon="fa-sparkles" />,
    color: "red",
  },
  GRAVITY_WELL: {
    icon: <FaIcon type="solid" icon="fa-arrows-minimize" />,
    color: "green",
  },
  ARTIFICIAL_GRAVITY_WELL: {
    icon: <FaIcon type="solid" icon="fa-arrows-to-circle" />,
    color: "yellowgreen",
  },
  FUEL_STATION: {
    icon: <FaIcon type="solid" icon="fa-gas-pump" />,
    color: "yellow",
  },
};

const systemIcons: Record<SystemType, { icon: ReactElement; color: string }> = {
  NEUTRON_STAR: {
    icon: <FaIcon type="solid" icon="fa-star-christmas" />,
    color: "currentColor",
  },
  RED_STAR: {
    icon: <FaIcon type="solid" icon="fa-sparkle" />,
    color: "red",
  },
  ORANGE_STAR: {
    icon: <FaIcon type="solid" icon="fa-star" />,
    color: "orange",
  },
  BLUE_STAR: {
    icon: <FaIcon type="solid" icon="fa-star-christmas" />,
    color: "blue",
  },
  YOUNG_STAR: {
    icon: <FaIcon type="solid" icon="fa-star-of-life" />,
    color: "lightgreen",
  },
  WHITE_DWARF: {
    icon: <FaIcon type="solid" icon="fa-period" />,
    color: "currentColor",
  },
  BLACK_HOLE: {
    icon: <FaIcon type="solid" icon="fa-atom" />,
    color: "currentColor",
  },
  HYPERGIANT: {
    icon: <FaIcon type="solid" icon="fa-certificate" />,
    color: "lightblue",
  },
  NEBULA: {
    icon: <NounIcon name="nebula" />,
    color: "currentColor",
  },
  UNSTABLE: {
    icon: <FaIcon type="solid" icon="fa-star-exclamation" />,
    color: "darkred",
  },
};

function WaypointMapWaypoint({
  waypoint,
  system,
  xOne,
  yOne,
}: {
  waypoint?: Waypoint | SystemWaypoint;
  system: System;
  xOne: number;
  yOne: number;
}) {
  const [size, setSize] = useState(16);
  const textboxRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const selectedWaypoint = useAppSelector(selectSelectedWaypointSymbol);
  const selectedSystem = useAppSelector(selectSelectedSystemSymbol);

  function outputsize() {
    if (!textboxRef.current) return;

    setSize(textboxRef.current.offsetWidth);
  }

  useEffect(() => {
    if (!textboxRef.current) return;
    const observe = new ResizeObserver(outputsize);
    observe.observe(textboxRef.current);

    return () => {
      observe.disconnect();
    };
  }, []);

  const color = waypoint
    ? waypointIcons[waypoint.type].color
    : systemIcons[system.type].color;
  const waypointIcon = waypoint
    ? waypointIcons[waypoint.type].icon
    : systemIcons[system.type].icon;

  return (
    <div
      style={
        {
          left: xOne + "%",
          top: yOne + "%",
          "--waypoint-icon-size": `${Math.floor(size * 0.85)}px`,
          "--waypoint-icon-color": color,
        } as React.CSSProperties
      }
      className={`${classes.waypointContainer} ${waypoint ? classes.waypoint : classes.star} ${selectedWaypoint?.waypointSymbol === waypoint?.symbol && waypoint ? classes.active : ""}`}
      onClick={() => {
        if (waypoint) {
          if (selectedWaypoint?.waypointSymbol === waypoint.symbol) {
            dispatch(setSelectedWaypointSymbol(undefined));
            return;
          }
          dispatch(
            setSelectedWaypointSymbol({
              waypointSymbol: waypoint.symbol,
              systemSymbol: system.symbol,
            }),
          );
        } else {
          if (selectedSystem === system.symbol) {
            dispatch(setSelectedSystemSymbol(undefined));
            return;
          }
          dispatch(setSelectedSystemSymbol(system.symbol));
        }
      }}
      onDoubleClick={() => {
        if (waypoint) {
          window.open(
            `/system/${system.symbol}/${waypoint.symbol}`,
            "_blank",
            // "popup:true",
          );
        } else {
          window.open(
            `/system/${system.symbol}`,
            "_blank",
            //  "popup:true"
          );
        }
      }}
    >
      <div className={classes.waypointIcon} ref={textboxRef}>
        {waypointIcon}
      </div>
      <div className={classes.waypointInfo}>
        {/* {waypoint.x}, {waypoint.y} */}
        {waypoint?.symbol.replace(system.symbol + "-", "")}
        {/* <br />
        <div
          className={classes.waypointInfoMore}
          style={
            {
              "--waypoint-icon-size": `${Math.floor(size * 0.85)}px`,
            } as React.CSSProperties
          }
        >
          {waypoint?.type}
        </div> */}
      </div>
    </div>
  );
}

export default WaypointMapWaypoint;
