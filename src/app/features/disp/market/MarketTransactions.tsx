import { Card, Table } from "antd";
import type { MarketTransaction } from "../../../spaceTraderAPI/api";

function MarketTransactions({
  transactions,
}: {
  transactions: MarketTransaction[];
}) {
  return (
    <Card title="Transaction History" size="small">
      <Table
        dataSource={transactions.toSorted(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )}
        rowKey={(transactions) =>
          transactions.timestamp + transactions.shipSymbol
        }
        columns={[
          // {
          //   title: "Waypoint Symbol",
          //   dataIndex: "waypointSymbol",
          //   key: "waypointSymbol",
          // },
          {
            title: "Ship Symbol",
            dataIndex: "shipSymbol",
            key: "shipSymbol",
          },
          {
            title: "Trade Symbol",
            dataIndex: "tradeSymbol",
            key: "tradeSymbol",
          },
          {
            title: "Transaction Type",
            dataIndex: "type",
            key: "type",
          },
          {
            title: "Units",
            dataIndex: "units",
            key: "units",
          },
          {
            title: "Price per Unit",
            dataIndex: "pricePerUnit",
            key: "pricePerUnit",
          },
          {
            title: "Total Price",
            dataIndex: "totalPrice",
            key: "totalPrice",
          },
          {
            title: "Timestamp",
            dataIndex: "timestamp",
            key: "timestamp",
            render: (timestamp) => new Date(timestamp).toLocaleString(),
          },
        ]}
      />
    </Card>
  );
}

export default MarketTransactions;
