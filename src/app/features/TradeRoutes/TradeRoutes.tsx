// import classes from "./TradeRoutes.module.css";

import { Card, Select, Table } from "antd";
import { useMemo, useState } from "react";
import { useAppSelector } from "../../hooks";
import type { MarketTradeGood, TradeSymbol } from "../../spaceTraderAPI/api";
import { selectShips } from "../../spaceTraderAPI/redux/fleetSlice";
import type { MarketState } from "../../spaceTraderAPI/redux/marketSlice";
import type { WaypointState } from "../../spaceTraderAPI/redux/waypointSlice";
import { wpShortestPath } from "../../utils/tavelUtils";
import WaypointLink from "../WaypointLink";

function TradeRoutes({
  waypointsMarkets,
  waypoints,
}: {
  waypoints: {
    [key: string]: WaypointState;
  };
  waypointsMarkets: {
    [key: string]: MarketState;
  };
}) {
  const wps: {
    [key: string]: {
      tradeGoods: Array<MarketTradeGood>;
    };
  } = Object.keys(waypointsMarkets).reduce((a, b) => {
    if (waypointsMarkets[b].tradeGoods.length === 0)
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
          waypointsMarkets[b].tradeGoods[
            waypointsMarkets[b].tradeGoods.length - 1
          ].tradeGoods,
      },
    };
  }, {});

  return <TradeRoutesCard waypoints={wps} pathWps={waypoints} />;
}

export interface TradeRoute {
  tradeSymbol: TradeSymbol;
  purchasePrice: number;
  sellPrice: number;
  purchaseWaypoint: string;
  sellWaypoint: string;
  profit: number;
  tradeVolume: number;
  tradeMaxVolume: number;
  tripVolume: number;
  tripFuelCost: number;
  tripTravelTime: number;
  tripPurchaseCost: number;
  tripTotalCost: number;
  tripProfit: number;
  tripSellCost: number;
  tripYieldPerHour: number;
}

function TradeRoutesCard({
  waypoints,
  pathWps,
}: {
  waypoints: {
    [key: string]: {
      tradeGoods: Array<MarketTradeGood>;
    };
  };
  pathWps: Record<string, WaypointState>;
}) {
  const ships = useAppSelector(selectShips);
  const [shipName, setShipName] = useState<string>("");
  const ship = useMemo(
    () => ships.find((w) => w.symbol === shipName),
    [shipName, ships],
  );

  const [data, tradeRoutes] = useMemo(() => {
    const trades: Partial<
      Record<
        TradeSymbol,
        {
          IMPORT: Array<{ symbol: string; price: number; tradeVolume: number }>;
          EXPORT: Array<{ symbol: string; price: number; tradeVolume: number }>;
        }
      >
    > = {};

    // Populate trades from waypoints data
    Object.entries(waypoints).forEach(([symbol, { tradeGoods }]) => {
      tradeGoods.forEach(
        ({
          symbol: tradeSymbol,
          purchasePrice,
          sellPrice,
          type,
          tradeVolume,
        }) => {
          if (!trades[tradeSymbol]) {
            trades[tradeSymbol] = { IMPORT: [], EXPORT: [] };
          }
          if (type === "IMPORT" || type === "EXCHANGE") {
            trades[tradeSymbol]!.IMPORT.push({
              symbol,
              price: sellPrice,
              tradeVolume,
            });
          }
          if (type === "EXPORT" || type === "EXCHANGE") {
            trades[tradeSymbol]!.EXPORT.push({
              symbol,
              price: purchasePrice,
              tradeVolume,
            });
          }
        },
      );
    });

    // Data array
    const data = Object.entries(trades).map(([key, value]) => ({
      key,
      ...value,
    }));

    // Precompute common values to avoid redundant calculations inside loops
    const shipCapacity = ship?.cargo.capacity ?? 0;

    // Trade routes generation
    const tradeRoutes: Array<TradeRoute> = Object.entries(trades).flatMap(
      ([key, { EXPORT, IMPORT }]) => {
        if (key === "FUEL") return [];

        return EXPORT.flatMap(
          ({
            symbol: exportSymbol,
            price: exportPrice,
            tradeVolume: exportVolume,
          }) =>
            IMPORT.flatMap(
              ({
                symbol: importSymbol,
                price: importPrice,
                tradeVolume: importVolume,
              }) => {
                if (exportSymbol === importSymbol) return [];

                const tripVolume = Math.min(
                  shipCapacity,
                  Math.min(exportVolume, importVolume) * 2,
                );
                const routes = wpShortestPath(
                  exportSymbol,
                  importSymbol,
                  pathWps,
                  "BURN-AND-CRUISE-AND-DRIFT",
                  ship,
                  Math.max(0, shipCapacity - tripVolume),
                );

                // Calculate total fuel cost and travel time only once per route set
                const { totalFuelCost, totalTravelTime } = routes.reduce(
                  (acc, route) => {
                    acc.totalFuelCost += route.fuelCost ?? 0;
                    acc.totalTravelTime += route.travelTime ?? 0;
                    return acc;
                  },
                  { totalFuelCost: 0, totalTravelTime: 0 },
                );

                const fuelCost = ((totalFuelCost * 2) / 100) * 80;
                const totalProfit =
                  importPrice * tripVolume -
                  (exportPrice * tripVolume + fuelCost);

                return {
                  tradeSymbol: key as TradeSymbol,
                  purchasePrice: exportPrice,
                  sellPrice: importPrice,
                  purchaseWaypoint: exportSymbol,
                  sellWaypoint: importSymbol,
                  profit: importPrice - exportPrice,
                  tradeVolume: Math.min(exportVolume, importVolume),
                  tradeMaxVolume: Math.max(exportVolume, importVolume),
                  tripVolume,
                  tripFuelCost: fuelCost,
                  tripTravelTime: totalTravelTime * 2 + 1,
                  tripPurchaseCost: exportPrice * tripVolume,
                  tripTotalCost: exportPrice * tripVolume + fuelCost,
                  tripProfit: totalProfit,
                  tripSellCost: importPrice * tripVolume,
                  tripYieldPerHour:
                    (totalProfit / (totalTravelTime * 2 + 1)) * 3600,
                };
              },
            ),
        );
      },
    );

    return [data, tradeRoutes];
  }, [pathWps, ship, waypoints]);

  return (
    <Card>
      <h2>Trade Routes</h2>
      Ship:{" "}
      <Select
        style={{ width: 140 }}
        onChange={(value) => setShipName(value)}
        value={shipName}
        options={ships.map((w) => ({ label: w.symbol, value: w.symbol }))}
        allowClear
      />
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
            render: (value) => (
              <WaypointLink waypoint={value}> {value} </WaypointLink>
            ),
          },
          {
            title: "Purchase Price",
            dataIndex: "purchasePrice",
            key: "purchasePrice",
            sorter: (a, b) => a.purchasePrice - b.purchasePrice,

            render: (value) => `${Math.round(value).toLocaleString()}`,
          },

          {
            title: "Sell Waypoint",
            dataIndex: "sellWaypoint",
            key: "sellWaypoint",
            render: (value) => (
              <WaypointLink waypoint={value}> {value} </WaypointLink>
            ),
          },
          {
            title: "Sell Price",
            dataIndex: "sellPrice",
            key: "sellPrice",
            sorter: (a, b) => a.sellPrice - b.sellPrice,
            render: (value) => `${Math.round(value).toLocaleString()}`,
          },

          {
            title: "Trade Volume",
            dataIndex: "tradeVolume",
            key: "tradeVolume",
            sorter: (a, b) => a.tradeVolume - b.tradeVolume,
            render: (value) => `${Math.round(value).toLocaleString()}`,
          },
          {
            title: "Profit",
            dataIndex: "profit",
            key: "profit",
            sorter: (a, b) => a.profit - b.profit,
            render: (value) => `${Math.round(value).toLocaleString()}`,
          },
          {
            title: "Profit Per Hour",
            dataIndex: "tripYieldPerHour",
            key: "tripYieldPerHour",
            sorter: (a, b) => a.tripYieldPerHour - b.tripYieldPerHour,
            // render: (value) => `${value.toFixed(2)}`,
            render: (value) => `${Math.round(value).toLocaleString()}`,
          },
          {
            title: "Trip Volume",
            dataIndex: "tripVolume",
            key: "tripVolume",
            sorter: (a, b) => a.tripVolume - b.tripVolume,
            render: (value) => `${Math.round(value).toLocaleString()}`,
          },
          {
            title: "Trip Fuel Cost",
            dataIndex: "tripFuelCost",
            key: "tripFuelCost",
            sorter: (a, b) => a.tripFuelCost - b.tripFuelCost,
            // render: (value) => `${value.toFixed(2)}`,
            render: (value) => `${Math.round(value).toLocaleString()}`,
          },
          {
            title: "Trip Travel Time",
            dataIndex: "tripTravelTime",
            key: "tripTravelTime",
            sorter: (a, b) => a.tripTravelTime - b.tripTravelTime,
            render: (value) => `${Math.round(value).toLocaleString()}`,
          },
          {
            title: "Trip Purchase Cost",
            dataIndex: "tripPurchaseCost",
            key: "tripPurchaseCost",
            sorter: (a, b) => a.tripPurchaseCost - b.tripPurchaseCost,
            render: (value) => `${Math.round(value).toLocaleString()}`,
          },
          {
            title: "Trip Total Cost",
            dataIndex: "tripTotalCost",
            key: "tripTotalCost",
            sorter: (a, b) => a.tripTotalCost - b.tripTotalCost,
            render: (value) => `${Math.round(value).toLocaleString()}`,
          },
          {
            title: "Trip Profit",
            dataIndex: "tripProfit",
            key: "tripProfit",
            sorter: (a, b) => a.tripProfit - b.tripProfit,
            // render: (value) => `${value.toFixed(2)}`,
            render: (value) => `${Math.round(value).toLocaleString()}`,
          },
          {
            title: "Trip Sell Cost",
            dataIndex: "tripSellCost",
            key: "tripSellCost",
            sorter: (a, b) => a.tripSellCost - b.tripSellCost,
            render: (value) => `${Math.round(value).toLocaleString()}`,
          },

          {
            title: "Trade Max Volume",
            dataIndex: "tradeMaxVolume",
            key: "tradeMaxVolume",
            sorter: (a, b) => a.tradeMaxVolume - b.tradeMaxVolume,
            render: (value) => `${Math.round(value).toLocaleString()}`,
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
