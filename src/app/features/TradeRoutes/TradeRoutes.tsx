// import classes from "./TradeRoutes.module.css";

import { Card, Table } from "antd";
import type { MarketTradeGood, TradeSymbol } from "../../spaceTraderAPI/api";
import type { MarketState } from "../../spaceTraderAPI/redux/marketSlice";
import type { Prettify } from "../../utils/utils";

function TradeRoutes({
  waypoints,
}: {
  waypoints: {
    [key: string]: MarketState;
  };
}) {
  const wps: {
    [key: string]: {
      tradeGoods: Array<MarketTradeGood>;
    };
  } = Object.keys(waypoints).reduce((a, b) => {
    if (waypoints[b].tradeGoods.length === 0)
      return {
        ...a,
        [b]: {
          tradeGoods: [],
        },
      };
    return {
      ...a,
      [b]: {
        tradeGoods:
          waypoints[b].tradeGoods[waypoints[b].tradeGoods.length - 1]
            .tradeGoods,
      },
    };
  }, {});

  return <TradeRoutesCard waypoints={wps} />;
}

function TradeRoutesCard({
  waypoints,
}: {
  waypoints: {
    [key: string]: {
      tradeGoods: Array<MarketTradeGood>;
    };
  };
}) {
  const trades: Prettify<
    Partial<{
      [key in TradeSymbol]: {
        IMPORT: Array<{ symbol: string; price: number; tradeVolume: number }>;
        EXPORT: Array<{ symbol: string; price: number; tradeVolume: number }>;
      };
    }>
  > = {};

  for (const [symbol, { tradeGoods }] of Object.entries(waypoints)) {
    for (const {
      symbol: tradeSymbol,
      purchasePrice,
      sellPrice,
      type,
      tradeVolume,
    } of tradeGoods) {
      if (!trades[tradeSymbol]) {
        trades[tradeSymbol] = { IMPORT: [], EXPORT: [] };
      }
      if (type === "IMPORT" || type === "EXCHANGE")
        trades[tradeSymbol]?.IMPORT.push({
          symbol,
          price: sellPrice,
          tradeVolume,
        });
      if (type === "EXPORT" || type === "EXCHANGE")
        trades[tradeSymbol]?.EXPORT.push({
          symbol,
          price: purchasePrice,
          tradeVolume,
        });
    }
  }

  const data = Object.entries(trades).map(([key, value]) => ({
    key,
    ...value,
  }));

  const tradeRoutes: Array<{
    tradeSymbol: TradeSymbol;
    purchasePrice: number;
    sellPrice: number;
    purchaseWaypoint: string;
    sellWaypoint: string;
    profit: number;
    tradeVolume: number;
  }> = Object.entries(trades).flatMap(([key, value]) =>
    value.EXPORT.flatMap(
      ({
        symbol: exportSymbol,
        price: exportPrice,
        tradeVolume: exportVolume,
      }) =>
        value.IMPORT.flatMap(
          ({
            symbol: importSymbol,
            price: importPrice,
            tradeVolume: importVolume,
          }) => ({
            tradeSymbol: key as TradeSymbol,
            purchasePrice: exportPrice,
            sellPrice: importPrice,
            purchaseWaypoint: exportSymbol,
            sellWaypoint: importSymbol,
            profit: importPrice - exportPrice,
            tradeVolume: Math.min(exportVolume, importVolume),
          }),
        ),
    ),
  );

  return (
    <Card>
      <h2>Trade Routes</h2>

      <Table
        columns={[
          {
            title: "Trade Symbol",
            dataIndex: "tradeSymbol",
            key: "tradeSymbol",
          },
          {
            title: "Purchase Waypoint",
            dataIndex: "purchaseWaypoint",
            key: "purchaseWaypoint",
          },
          {
            title: "Purchase Price",
            dataIndex: "purchasePrice",
            key: "purchasePrice",
            sorter: (a, b) => a.purchasePrice - b.purchasePrice,
          },

          {
            title: "Sell Waypoint",
            dataIndex: "sellWaypoint",
            key: "sellWaypoint",
          },
          {
            title: "Sell Price",
            dataIndex: "sellPrice",
            key: "sellPrice",
            sorter: (a, b) => a.sellPrice - b.sellPrice,
          },

          {
            title: "Trade Volume",
            dataIndex: "tradeVolume",
            key: "tradeVolume",
            sorter: (a, b) => a.tradeVolume - b.tradeVolume,
          },
          {
            title: "Profit",
            dataIndex: "profit",
            key: "profit",
            sorter: (a, b) => a.profit - b.profit,
          },
        ]}
        dataSource={tradeRoutes}
      />
      <br />
      <Table
        columns={[
          {
            title: "Trade Symbol",
            dataIndex: "key",
            key: "key",
          },
          {
            title: "Export Buy Price",
            dataIndex: "EXPORT",
            key: "EXPORT",
            render(value, record) {
              return (
                <ul>
                  {record.EXPORT.map(({ symbol, price }) => (
                    <li key={symbol}>
                      {symbol} - {price}
                    </li>
                  ))}
                </ul>
              );
            },
          },
          {
            title: "Import Sell Price",
            dataIndex: "IMPORT",
            key: "IMPORT",
            render(value, record) {
              return (
                <ul>
                  {record.IMPORT.map(({ symbol, price }) => (
                    <li key={symbol}>
                      {symbol} - {price}
                    </li>
                  ))}
                </ul>
              );
            },
          },
        ]}
        dataSource={data}
      />
    </Card>
  );
}

export default TradeRoutes;
export { TradeRoutesCard };
