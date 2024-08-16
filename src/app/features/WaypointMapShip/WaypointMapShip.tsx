import type { Ship } from "../../spaceTraderAPI/api";
import {
  selectSelectedShipSymbol,
  setSelectedShipSymbol,
} from "../../spaceTraderAPI/redux/configSlice";
import { useAppDispatch, useAppSelector } from "../../hooks";

import classes from "./WaypointMapShip.module.css";
import FaIcon from "../FontAwsome/FaIcon";
import { useState, useRef, useEffect } from "react";

function WaypointMapShip({
  ship,
  xOne,
  yOne,
}: {
  ship: Ship;
  xOne: number;
  yOne: number;
}) {
  const [size, setSize] = useState(16);
  const textboxRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const selectedship = useAppSelector(selectSelectedShipSymbol);

  useEffect(() => {
    if (!textboxRef.current) return;
    const observe = new ResizeObserver(outputsize);
    observe.observe(textboxRef.current);

    return () => {
      observe.disconnect();
    };
  }, []);

  function outputsize() {
    if (!textboxRef.current) return;

    setSize(textboxRef.current.offsetWidth);
  }

  const color = "white";
  const shipIcon = <FaIcon type="solid" icon="fa-rocket" />;

  return (
    <div
      style={
        {
          left: xOne + "%",
          top: yOne + "%",
          "--ship-icon-size": `${Math.floor(size * 0.85)}px`,
          "--ship-icon-color": color,
        } as React.CSSProperties
      }
      className={`${classes.shipContainer} ${ship ? classes.ship : classes.star} ${selectedship === ship?.symbol && ship ? classes.active : ""}`}
      onClick={() => {
        if (ship) {
          if (selectedship === ship.symbol) {
            dispatch(setSelectedShipSymbol(undefined));
            return;
          }
          dispatch(setSelectedShipSymbol(ship.symbol));
        }
      }}
    >
      <div className={classes.shipIcon} ref={textboxRef}>
        {shipIcon}
      </div>
      <div className={classes.shipInfo}>
        {/* {ship.x}, {ship.y} */}
        {ship?.symbol}
        {/* <br />
        <div
          className={classes.shipInfoMore}
          style={
            {
              "--ship-icon-size": `${Math.floor(size * 0.85)}px`,
            } as React.CSSProperties
          }
        >
          {ship?.type}
        </div> */}
      </div>
    </div>
  );
}

export default WaypointMapShip;
