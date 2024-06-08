import { Card, Descriptions, DescriptionsProps } from "antd";
import { Ship } from "../../api";
import { Link } from "react-router-dom";

function ShipDisp({ ship }: { ship: Ship }) {
  const items: DescriptionsProps["items"] = [
    {
      key: "symbol",
      label: "Symbol",
      children: <span>{ship.symbol}</span>,
    },
    {
      key: "role",
      label: "Role",
      children: <span>{ship.registration.role}</span>,
    },
    {
      key: "cooldown",
      label: "Cooldown",
      children: (
        <span>
          {ship.cooldown.remainingSeconds} / {ship.cooldown.totalSeconds}
        </span>
      ),
    },
    {
      key: "navStatus",
      label: "Nav Status",
      children: <span>{ship.nav.status}</span>,
    },
    {
      key: "navSystem",
      label: "Nav System",
      children: (
        <Link to={`/system/${ship.nav.systemSymbol}`}>
          {ship.nav.systemSymbol}
        </Link>
      ),
    },
    {
      key: "navWaypoint",
      label: "Nav Waypoint",
      children: (
        <Link
          to={`/system/${ship.nav.systemSymbol}/${ship.nav.waypointSymbol}`}
        >
          {ship.nav.waypointSymbol}
        </Link>
      ),
    },
    {
      key: "fuel",
      label: "Fuel",
      children: (
        <span>
          {ship.fuel.current}/{ship.fuel.capacity}
        </span>
      ),
    },
    {
      key: "cargo",
      label: "Cargo",
      children: (
        <span>
          {ship.cargo.units}/{ship.cargo.capacity}
        </span>
      ),
    },
    {
      key: "crew",
      label: "Crew",
      children: (
        <span>
          {ship.crew.current} / {ship.crew.capacity} (min {ship.crew.required})
        </span>
      ),
    },
    {
      key: "mounts",
      label: "Mounts",
      children: <span>{ship.mounts.length} installed</span>,
    },
    {
      key: "modules",
      label: "Modules",
      children: <span>{ship.modules.length} installed</span>,
    },
    {
      key: "engine",
      label: "Engine",
      children: (
        <span>
          {ship.engine.name} ({ship.engine.symbol})
        </span>
      ),
    },
    {
      key: "reactor",
      label: "Reactor",
      children: (
        <span>
          {ship.reactor.name} ({ship.reactor.symbol})
        </span>
      ),
    },
    {
      key: "frame",
      label: "Frame",
      children: (
        <span>
          {ship.frame.name} ({ship.frame.symbol})
        </span>
      ),
    },
  ];

  return (
    <Card style={{ width: "fit-content" }}>
      <Descriptions
        title="Ship Info"
        bordered
        items={items}
        extra={<Link to={`/fleet/${ship.symbol}`}>More</Link>}
        layout="vertical"
      ></Descriptions>
    </Card>
  );
}

export default ShipDisp;
