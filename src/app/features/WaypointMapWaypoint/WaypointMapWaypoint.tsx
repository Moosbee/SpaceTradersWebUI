import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type {
  System,
  SystemWaypoint,
  Waypoint,
} from "../../spaceTraderAPI/api";
import {
  selectSelectedSystemSymbol,
  selectSelectedWaypointSymbol,
  setSelectedSystemSymbol,
  setSelectedWaypointSymbol,
} from "../../spaceTraderAPI/redux/mapSlice";
import { systemIcons, waypointIcons } from "../../utils/waypointColors";
import classes from "./WaypointMapWaypoint.module.css";

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
