import type { DescriptionsProps } from "antd";
import { Card, Descriptions } from "antd";
import type { ShipyardTransaction } from "../../../spaceTraderAPI/api";

function ShipyardTransactionDisp({
  transaction,
}: {
  transaction: ShipyardTransaction;
}) {
  const items: DescriptionsProps["items"] = [
    {
      key: "waypointSymbol",
      label: "Waypoint Symbol",
      children: <p>{transaction.waypointSymbol}</p>,
    },
    {
      key: "shipSymbol",
      label: "Ship Symbol",
      children: <p>{transaction.shipSymbol}</p>,
    },
    {
      key: "shipType",
      label: "Ship Type",
      children: <p>{transaction.shipType}</p>,
    },
    {
      key: "price",
      label: "Price",
      children: <p>{transaction.price}</p>,
    },
    {
      key: "agentSymbol",
      label: "Agent Symbol",
      children: <p>{transaction.agentSymbol}</p>,
    },
    {
      key: "timestamp",
      label: "Timestamp",
      children: <p>{transaction.timestamp}</p>,
    },
  ];

  return (
    <Card style={{ width: "fit-content" }}>
      <Descriptions
        title="Shipyard Transaction Info"
        bordered
        items={items}
        layout="vertical"
      />
    </Card>
  );
}

export default ShipyardTransactionDisp;
