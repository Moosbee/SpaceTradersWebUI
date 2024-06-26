import { StarOutlined } from "@ant-design/icons";
import { useMemo, useRef, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectSystem } from "../../app/spaceTraderAPI/redux/systemSlice";
import classes from "./WaypointMap.module.css";

const zoomMin = 10;
const zoomMax = 1000;

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

    const wbCalcX = Math.ceil(
      Math.max(Math.abs(wpMaxX), Math.abs(wpMinX)) * 1.05,
    );
    const wbCalcY = Math.ceil(
      Math.max(Math.abs(wpMaxY), Math.abs(wpMinY)) * 1.05,
    );

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

  const frameRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const onWheel = (e: React.WheelEvent) => {
    if (!frameRef.current || !rootRef.current) return;

    let newZoom;
    if (e.deltaY > 0) {
      newZoom = Math.max(zoom - 5, zoomMin);
    } else {
      newZoom = Math.min(zoom + 5, zoomMax);
    }

    // const zoomDiff = newZoom - zoom;

    setZoom(newZoom);
  };

  const [lastPosX, setLastPosX] = useState(0);
  const [lastPosY, setLastPosY] = useState(0);

  const onMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1 || !frameRef.current || !rootRef.current) {
      return;
    }

    let lastXPos = lastPosX;
    let lastYPos = lastPosY;

    // console.log(startRef.current);

    let diffX = e.clientX - lastXPos;
    let diffY = e.clientY - lastYPos;
    // let zoom = 50 / 100;

    setLastPosX(e.clientX);
    setLastPosY(e.clientY);

    console.log(diffX, diffY, zoom);

    // let bounding = rootRef.current.getBoundingClientRect();

    // bounding.width;

    // map the absolute div position to the relative one
    setLeft(left + scaleNum(diffX, 0, rootRef.current.clientWidth, 0, 100));
    setTop(top + scaleNum(diffY, 0, rootRef.current.clientHeight, 0, 100));
  };

  return (
    <div
      className={classes.root}
      ref={rootRef}
      onWheel={onWheel}
      onMouseMove={onMouseMove}
      onMouseDown={(e) => {
        setLastPosX(e.clientX);
        setLastPosY(e.clientY);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          setLeft((prev) => prev - 10);
        } else if (e.key === "ArrowRight") {
          setLeft((prev) => prev + 10);
        } else if (e.key === "ArrowUp") {
          setTop((prev) => prev - 10);
        } else if (e.key === "ArrowDown") {
          setTop((prev) => prev + 10);
        } else if (e.key === "r") {
          setZoom(100);
          setTop(0);
          setLeft(0);
          setTop(0);
          setLeft(0);
        }
      }}
      // for focus
      tabIndex={0}
    >
      <div
        className={classes.waypointMapOut}
        style={
          {
            "--zoom": `${zoom}%`,
            "--top": `${top}%`,
            "--left": `${left}%`,
          } as React.CSSProperties
        }
        ref={frameRef}
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
