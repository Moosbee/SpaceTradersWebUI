import type { DescriptionsProps } from "antd";
import { Button, Card, Descriptions, Tooltip } from "antd";
import type { ShipyardShip } from "../../../spaceTraderAPI/api";

function ShipyardShipDisp({
  shipyardShip,
  onBuy,
}: {
  shipyardShip: ShipyardShip;
  onBuy: () => void;
}) {
  const items: DescriptionsProps["items"] = [
    {
      key: "name",
      label: "Name",
      children: (
        <Tooltip title={shipyardShip.description}>{shipyardShip.name}</Tooltip>
      ),
    },
    {
      key: "type",
      label: "Type",
      children: <span>{shipyardShip.type}</span>,
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
      key: "fuelCapacity",
      label: "Fuel Capacity",
      children: <span>{shipyardShip.frame.fuelCapacity}</span>,
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
        <Tooltip title={shipyardShip.engine.symbol}>
          {shipyardShip.engine.name} ({shipyardShip.engine.speed} speed)
        </Tooltip>
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
      children: (
        <span>
          {shipyardShip.modules.length} installed <br />(
          {shipyardShip.modules.map((m) => m.symbol).join(", ")})
        </span>
      ),
    },
    {
      key: "mounts",
      label: "Mounts",
      children: (
        <span>
          {shipyardShip.mounts.length} installed
          <br />({shipyardShip.mounts.map((m) => m.symbol).join(", ")})
        </span>
      ),
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
  ];
  return (
    <Card style={{ width: "fit-content" }}>
      <Descriptions
        title="Ship Info"
        bordered
        items={items}
        extra={<Button onClick={onBuy}>Buy {shipyardShip.name}</Button>}
        layout="vertical"
      ></Descriptions>
    </Card>
  );
}

export default ShipyardShipDisp;
