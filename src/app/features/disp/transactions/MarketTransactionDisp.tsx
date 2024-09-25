import type { DescriptionsProps } from "antd";
import { Card, Descriptions } from "antd";
import type { MarketTransaction } from "../../../spaceTraderAPI/api";

function MarketTransactionDisp({
  transaction,
}: {
  transaction: MarketTransaction;
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
      key: "tradeSymbol",
      label: "Trade Symbol",
      children: <p>{transaction.tradeSymbol}</p>,
    },
    {
      key: "type",
      label: "Type",
      children: <p>{transaction.type}</p>,
    },
    {
      key: "units",
      label: "Units",
      children: <p>{transaction.units}</p>,
    },
    {
      key: "pricePerUnit",
      label: "Price Per Unit",
      children: <p>{transaction.pricePerUnit}</p>,
    },
    {
      key: "totalPrice",
      label: "Total Price",
      children: <p>{transaction.totalPrice}</p>,
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
        title="Market Transaction Info"
        bordered
        items={items}
        layout="vertical"
      />
    </Card>
  );
}

export default MarketTransactionDisp;
