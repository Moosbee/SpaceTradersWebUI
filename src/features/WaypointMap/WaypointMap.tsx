import { useMemo, useRef, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectSystem } from "../../app/spaceTraderAPI/redux/systemSlice";
import classes from "./WaypointMap.module.css";
import WaypointMapWaypoint from "../WaypointMapWaypoint/WaypointMapWaypoint";

const zoomMin = 20;
const zoomMax = 1000;

function WaypointMap({ systemID }: { systemID: string }) {
  const system = useAppSelector((state) => selectSystem(state, systemID));

  const waypointsMp = useMemo(() => {
    if (!system) return [];

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

    return system.waypoints.map((w) => {
      return {
        waypoint: w,
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
    e.preventDefault();

    // let newZoom;
    // if (e.deltaY > 0) {
    //   newZoom = Math.max(zoom - 5, zoomMin);
    // } else {
    //   newZoom = Math.min(zoom + 5, zoomMax);
    // }

    const zoomFactor = 0.1;
    const newZoom = Math.min(
      Math.max(
        zoom + (e.deltaY > 0 ? -zoom * zoomFactor : zoom * zoomFactor),
        zoomMin,
      ),
      zoomMax,
    );
    // const zoomDiff = newZoom - zoom;

    setZoom(newZoom);

    const zoomDiff = newZoom - zoom;

    // newZoom=(Math.min(Math.max(zoom - e.deltaY / 100, zoomMin), zoomMax));

    const bounding = frameRef.current.getBoundingClientRect();
    // this is the position of the mouse relative to the frame 0 top of the frame 1 bottom of the frame
    const mausPercentPosY =
      (e.clientY - bounding.y) / frameRef.current.offsetHeight;
    // this is the position of the mouse relative to the frame 0 left of the frame 1 right of the frame
    const mausPercentPosX =
      (e.clientX - bounding.x) / frameRef.current.offsetWidth;

    // const mausPercentPosY = 0.5;
    // const mausPercentPosX = 0.5;

    const WdH = rootRef.current.clientWidth / rootRef.current.clientHeight;
    const HdW = rootRef.current.clientHeight / rootRef.current.clientWidth;

    console.log(
      rootRef.current.clientWidth,
      rootRef.current.clientHeight,
      WdH,
      HdW,
    );

    // this is the ammount to move the frame up or down to compensate the change in zoom
    const topDiff = zoomDiff * mausPercentPosY * Math.max(WdH, 1);
    // this is the ammount to move the frame left or right to compensate the change in zoom
    const leftDiff = zoomDiff * mausPercentPosX * Math.max(HdW, 1);

    const newTop = top - topDiff;
    const newLeft = left - leftDiff;

    setZoom(newZoom);
    setTop(Number.isFinite(newTop) ? newTop : 0);
    setLeft(Number.isFinite(newLeft) ? newLeft : 0);
  };

  const [lastPosX, setLastPosX] = useState(0);
  const [lastPosY, setLastPosY] = useState(0);

  const onMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1 || !frameRef.current || !rootRef.current) return;

    const diffX = e.clientX - lastPosX;
    const diffY = e.clientY - lastPosY;

    setLastPosX(e.clientX);
    setLastPosY(e.clientY);

    const newLeft =
      left + scaleNum(diffX, 0, rootRef.current.clientWidth, 0, 100);
    const newTop =
      top + scaleNum(diffY, 0, rootRef.current.clientHeight, 0, 100);

    setLeft(Number.isFinite(newLeft) ? newLeft : 0);
    setTop(Number.isFinite(newTop) ? newTop : 0);
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
            <WaypointMapWaypoint
              key={w.waypoint.symbol}
              waypoint={w.waypoint}
              xOne={w.xOne}
              yOne={w.yOne}
            >
              {/* {w.x}, {w.y} */}
            </WaypointMapWaypoint>
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
