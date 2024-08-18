import classes from "./WaypointMapShipOrbit.module.css";

function WaypointMapShipOrbit({
  pos,
  posOrbitCenter,
  line,
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
}) {
  return (
    <>
      {posOrbitCenter && (
        <WaypointMapShipOrbitCircle pos={pos} posOrbitCenter={posOrbitCenter} />
      )}
      {line && <WaypointMapShipOrbitLine line={line} />}
    </>
  );
}

function WaypointMapShipOrbitLine({
  line,
}: {
  line: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}) {
  return (
    <line
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
}: {
  pos: {
    x: number;
    y: number;
  };
  posOrbitCenter: {
    x: number;
    y: number;
  };
}) {
  const dx = pos.x - posOrbitCenter.x;
  const dy = pos.y - posOrbitCenter.y;
  const radius = Math.sqrt(dx * dx + dy * dy);

  return (
    <circle
      cx={posOrbitCenter.x}
      cy={posOrbitCenter.y}
      r={radius}
      className={classes.orbitCircle}
    ></circle>
  );
}

export default WaypointMapShipOrbit;
