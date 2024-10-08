import classes from "./WaypointMapShipOrbit.module.css";

function WaypointMapShipOrbit({
  pos,
  posOrbitCenter,
  line,
  size,
}: {
  pos: {
    x: number;
    y: number;
  };
  posOrbitCenter?: {
    x: number;
    y: number;
  };
  line?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  size: number;
}) {
  return (
    <>
      {posOrbitCenter && (
        <WaypointMapShipOrbitCircle
          pos={pos}
          posOrbitCenter={posOrbitCenter}
          size={size}
        />
      )}
      {line && <WaypointMapShipOrbitLine line={line} size={size} />}
    </>
  );
}

function WaypointMapShipOrbitLine({
  line,
  size,
}: {
  line: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  size: number;
}) {
  return (
    <line
      style={
        {
          "--stroke-width": `${Math.min(0.2, 200 / size)}px`,
        } as React.CSSProperties
      }
      x1={line.x1}
      y1={line.y1}
      x2={line.x2}
      y2={line.y2}
      className={classes.orbitLine}
    ></line>
  );
}

function WaypointMapShipOrbitCircle({
  pos,
  posOrbitCenter,
  size,
}: {
  pos: {
    x: number;
    y: number;
  };
  posOrbitCenter: {
    x: number;
    y: number;
  };
  size: number;
}) {
  const dx = pos.x - posOrbitCenter.x;
  const dy = pos.y - posOrbitCenter.y;
  const radius = Math.sqrt(dx * dx + dy * dy);

  return (
    <circle
      style={
        {
          "--stroke-width": `${Math.min(0.2, 200 / size)}px`,
        } as React.CSSProperties
      }
      cx={posOrbitCenter.x}
      cy={posOrbitCenter.y}
      r={radius}
      className={classes.orbitCircle}
    ></circle>
  );
}

export default WaypointMapShipOrbit;
