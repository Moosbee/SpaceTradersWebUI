import { Card, Pagination, Table } from "antd";
import { useState } from "react";
import type { MarketTradeGood } from "../../../spaceTraderAPI/api";

function MarketDetail({
  tradeGoods,
}: {
  tradeGoods: Array<{
    timestamp: number;
    tradeGoods: Array<MarketTradeGood>;
  }>;
}) {
  const [page, setPage] = useState(1);

  if (!tradeGoods.length) {
    return null;
  }

  return (
    <Card
      title={`Goods on ${new Date(tradeGoods[tradeGoods.length - page].timestamp).toLocaleString()}`}
    >
      <Pagination
        total={tradeGoods.length}
        onChange={(page) => setPage(page)}
        current={page}
        pageSize={1}
      />
      <br />
      <Table
        pagination={false}
        dataSource={tradeGoods[tradeGoods.length - page].tradeGoods.map(
          (tradeGood) => ({
            ...tradeGood,
          }),
        )}
        columns={[
          {
            title: "Symbol",
            dataIndex: "symbol",
            key: "symbol",
          },
          {
            title: "Type",
            dataIndex: "type",
            key: "type",
          },
          {
            title: "Trade Volume",
            dataIndex: "tradeVolume",
            key: "tradeVolume",
          },
          {
            title: "Supply",
            dataIndex: "supply",
            key: "supply",
          },
          {
            title: "Activity",
            dataIndex: "activity",
            key: "activity",
            render: (activity) => activity || "N/A",
          },
          {
            title: "Purchase Price",
            dataIndex: "purchasePrice",
            key: "purchasePrice",
            render: (purchasePrice, data) =>
              data.type === "IMPORT" ? purchasePrice : <b>{purchasePrice}</b>,
          },
          {
            title: "Sell Price",
            dataIndex: "sellPrice",
            key: "sellPrice",
            render: (sellPrice, data) =>
              data.type === "EXPORT" ? sellPrice : <b>{sellPrice}</b>,
          },
        ]}
        rowKey="symbol"
      />
    </Card>
  );
}

export default MarketDetail;
