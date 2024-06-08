import { Card, Descriptions, DescriptionsProps } from "antd";
import { Ship, ShipyardShip } from "../api";
import { Link } from "react-router-dom";

type Shipi = {
  ship: Ship;
  moreInfo?: boolean;
};
type ShipyardShipi = {
  shipyardShip: ShipyardShip;
  moreInfo?: boolean;
};

//TODO: refactor and make nicer + add "more info" option
function getZeShip(obj: Shipi | ShipyardShipi): Ship | undefined {
  if ("ship" in obj) {
    return obj.ship as Ship;
  }
  return undefined;
}

function getZeShipyardShip(
  obj: Shipi | ShipyardShipi
): ShipyardShip | undefined {
  if ("shipyardShip" in obj) {
    return obj.shipyardShip as ShipyardShip;
  }
  return undefined;
}

function ShipDisp(props: Shipi | ShipyardShipi) {
  const ship = getZeShip(props);
  const shipyardShip = getZeShipyardShip(props);

  const items: DescriptionsProps["items"] = [];

  if (ship) {
    items.push(
      ...[
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
              {ship.crew.current} / {ship.crew.capacity} (min{" "}
              {ship.crew.required})
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
      ]
    );
  } else if (shipyardShip) {
    items.push(
      ...[
        {
          key: "name",
          label: "Name",
          children: <span>{shipyardShip.name}</span>,
        },
        {
          key: "type",
          label: "Type",
          children: <span>{shipyardShip.type}</span>,
        },
        {
          key: "description",
          label: "Description",
          children: <span>{shipyardShip.description}</span>,
        },
        {
          key: "purchasePrice",
          label: "Purchase Price",
          children: <span>{shipyardShip.purchasePrice}</span>,
        },
        {
          key: "activity",
          label: "Activity",
          children: <span>{shipyardShip.activity}</span>,
        },
        {
          key: "supply",
          label: "Supply",
          children: <span>{shipyardShip.supply}</span>,
        },
        {
          key: "crew",
          label: "Crew",
          children: (
            <span>
              {shipyardShip.crew.required} - {shipyardShip.crew.capacity}
            </span>
          ),
        },

        {
          key: "engine",
          label: "Engine",
          children: (
            <span>
              {shipyardShip.engine.name} ({shipyardShip.engine.symbol})
            </span>
          ),
        },
        {
          key: "frame",
          label: "Frame",
          children: (
            <span>
              {shipyardShip.frame.name} ({shipyardShip.frame.symbol})
            </span>
          ),
        },
        {
          key: "modules",
          label: "Modules",
          children: <span>{shipyardShip.modules.length} installed</span>,
        },
        {
          key: "mounts",
          label: "Mounts",
          children: <span>{shipyardShip.mounts.length} installed</span>,
        },

        {
          key: "reactor",
          label: "Reactor",
          children: (
            <span>
              {shipyardShip.reactor.name} ({shipyardShip.reactor.symbol})
            </span>
          ),
        },
      ]
    );
  }

  return (
    <Card style={{ width: "fit-content" }}>
      <Descriptions
        title="Ship Info"
        bordered
        items={items}
        layout="vertical"
      ></Descriptions>
    </Card>
  );
}

export default ShipDisp;
