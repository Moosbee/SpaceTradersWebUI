import type { TableProps } from "antd";
import { Table } from "antd";
import { Link } from "react-router-dom";
import {
  MarketTransactionTypeEnum,
  TradeSymbol,
  type MarketTransaction,
} from "../../spaceTraderAPI/api";
import MoneyDisplay from "../MonyDisplay";
import WaypointLink from "../WaypointLink";

export default function MarketTransactionTable({
  transactions,
}: {
  transactions: MarketTransaction[];
}) {
  const colums: TableProps<MarketTransaction>["columns"] = [
    {
      title: "Waypoint",
      dataIndex: "waypointSymbol",
      key: "waypointSymbol",
      render: (symbol: string) => (
        <WaypointLink waypoint={symbol}>{symbol}</WaypointLink>
      ),
      sorter: (a, b) => a.waypointSymbol.localeCompare(b.waypointSymbol),

      filters: [...new Set(transactions.map((t) => t.waypointSymbol))].map(
        (t) => ({
          text: t,
          value: t,
        }),
      ),
      onFilter: (value, record) => record.waypointSymbol === value,
    },
    {
      title: "Ship",
      dataIndex: "shipSymbol",
      key: "shipSymbol",
      render: (symbol: string) => <Link to={`/fleet/${symbol}`}>{symbol}</Link>,
      sorter: (a, b) => a.shipSymbol.localeCompare(b.shipSymbol),
    },
    {
      title: "Trade Symbol",
      dataIndex: "tradeSymbol",
      key: "tradeSymbol",
      sorter: (a, b) => a.tradeSymbol.localeCompare(b.tradeSymbol),
      filters: Object.values(TradeSymbol)
        .sort((a, b) => a.localeCompare(b))
        .map((type) => ({
          text: type,
          value: type,
        })),
      onFilter: (value, record) => record.tradeSymbol === value,
    },
    {
      title: "Transaction Type",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => a.type.localeCompare(b.type),
      filters: Object.values(MarketTransactionTypeEnum).map((type) => ({
        text: type,
        value: type,
      })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Units",
      dataIndex: "units",
      key: "units",
      align: "right",
      sorter: (a, b) => a.units - b.units,
    },
    {
      title: "Price Per Unit",
      dataIndex: "pricePerUnit",
      key: "pricePerUnit",
      render: (value) => <MoneyDisplay amount={value} />,
      align: "right",
      sorter: (a, b) => a.pricePerUnit - b.pricePerUnit,
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (value) => <MoneyDisplay amount={value} />,
      align: "right",
      sorter: (a, b) => a.totalPrice - b.totalPrice,
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (value) => new Date(value).toLocaleString(),
      align: "right",
      sorter: (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      defaultSortOrder: "descend",
    },
  ];

  return (
    <Table
      rowKey={(id) =>
        id.timestamp + id.shipSymbol + id.waypointSymbol + id.tradeSymbol
      }
      columns={colums}
      dataSource={transactions}
      pagination={{
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100", "200", "500", "1000"],
        defaultPageSize: 10,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
      }}
    />
  );
}
