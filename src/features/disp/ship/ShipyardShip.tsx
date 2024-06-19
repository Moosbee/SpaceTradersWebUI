import type { DescriptionsProps } from "antd"
import { Card, Descriptions } from "antd"
import type { ShipyardShip } from "../../../utils/api"

function ShipyardShipDisp({ shipyardShip }: { shipyardShip: ShipyardShip }) {
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
  return (
    <Card style={{ width: "fit-content" }}>
      <Descriptions
        title="Ship Info"
        bordered
        items={items}
        layout="vertical"
      ></Descriptions>
    </Card>
  )
}

export default ShipyardShipDisp
