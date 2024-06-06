import { Card, Descriptions, DescriptionsProps } from "antd";
import { System } from "../api";
import { Link } from "react-router-dom";

function SystemDisp({ system }: { system: System }) {
  const items: DescriptionsProps["items"] = [
    {
      key: "symbol",
      label: "Symbol",
      children: <p>{system.symbol}</p>,
    },
    {
      key: "sectorSymbol",
      label: "Sector Symbol",
      children: <p>{system.sectorSymbol}</p>,
    },
    {
      key: "type",
      label: "Type",
      children: <p>{system.type}</p>,
    },
    {
      key: "coordinates",
      label: "Coordinates",
      children: (
        <p>
          X: {system.x} Y: {system.y}
        </p>
      ),
    },
    {
      key: "factions",
      label: "Factions",
      children: (
        <p>{system.factions.map((value) => value.symbol).join(" - ")}</p>
      ),
    },
    {
      key: "waypointsCount",
      label: "Waypoints Count",
      children: <p>{system.waypoints.length}</p>,
    },
  ];

  return (
    <div>
      <Card
        style={{ width: "fit-content" }}
        title="System Info"
        extra={<Link to={`/system/${system.symbol}`}>More</Link>}
      >
        <Descriptions bordered items={items} layout="vertical" />
      </Card>
    </div>
  );
}

export default SystemDisp;
