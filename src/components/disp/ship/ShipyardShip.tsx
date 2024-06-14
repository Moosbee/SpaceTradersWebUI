import { Button, Card, Descriptions, DescriptionsProps } from "antd";
import { ShipyardShip } from "../../../utils/api";

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
