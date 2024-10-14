import {
  Button,
  Card,
  Divider,
  InputNumber,
  message,
  Select,
  Space,
  Table,
} from "antd";
import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import type { MarketTradeGood, Ship } from "../../../spaceTraderAPI/api";
import { setMyAgent } from "../../../spaceTraderAPI/redux/agentSlice";
import {
  selectShips,
  setShipCargo,
} from "../../../spaceTraderAPI/redux/fleetSlice";
import { addMarketTransaction } from "../../../spaceTraderAPI/redux/tansactionSlice";
import spaceTraderClient from "../../../spaceTraderAPI/spaceTraderClient";

function MarketStore({
  tradeGoods,
  marketSymbol,
}: {
  tradeGoods: Array<MarketTradeGood>;
  marketSymbol: string;
}) {
  const ships = useAppSelector(selectShips).filter(
    (value) => value.nav.waypointSymbol === marketSymbol,
  );
  const [shipName, setShipName] = useState<string>("");
  const ship = useMemo(
    () => ships.find((w) => w.symbol === shipName),
    [shipName, ships],
  );

  return (
    <Card title="Traded Goods" size="small" style={{ width: "fit-content" }}>
      Ship:{" "}
      <Select
        style={{ width: 140 }}
        onChange={(value) => setShipName(value)}
        value={shipName}
        options={ships.map((w) => ({ label: w.symbol, value: w.symbol }))}
      />
      <Divider />
      <Table
        bordered
        dataSource={tradeGoods
          .filter((tradeGood) => tradeGood.type !== "IMPORT")
          .map((tradeGood) => ({
            ...tradeGood,
            action: <TradeActionDisp tradeGood={tradeGood} ship={ship} />,
          }))}
        columns={[
          {
            title: "Symbol",
            dataIndex: "symbol",
            key: "symbol",
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
            title: "Trade Volume",
            dataIndex: "tradeVolume",
            key: "tradeVolume",
          },
          {
            title: "Purchase Price",
            dataIndex: "purchasePrice",
            key: "purchasePrice",
          },
          {
            title: "Action",
            dataIndex: "action",
            key: "action",
          },
        ]}
        rowKey="symbol"
      />
    </Card>
  );
}

function TradeActionDisp({
  tradeGood,
  ship,
}: {
  tradeGood: MarketTradeGood;
  ship?: Ship;
}) {
  const [count, setCount] = useState(1);
  const dispatch = useAppDispatch();

  return (
    <Space>
      <InputNumber
        min={1}
        max={Math.min(
          ship ? ship?.cargo.capacity - ship?.cargo.units : 0,
          tradeGood.tradeVolume,
        )}
        defaultValue={0}
        style={{ width: 60 }}
        onChange={(value) => setCount(value?.valueOf() ?? 1)}
        value={count}
        changeOnWheel
      />
      <Button
        onClick={() => {
          if (ship) {
            spaceTraderClient.FleetClient.purchaseCargo(ship.symbol, {
              symbol: tradeGood.symbol,
              units: count,
            }).then((data) => {
              message.success(
                `Purchased ${data.data.data.transaction.units} units of ${data.data.data.transaction.tradeSymbol} for ${data.data.data.transaction.totalPrice} credits`,
              );
              dispatch(
                setShipCargo({
                  symbol: ship.symbol,
                  cargo: data.data.data.cargo,
                }),
              );
              dispatch(setMyAgent(data.data.data.agent));
              dispatch(addMarketTransaction(data.data.data.transaction));
            });
          }
        }}
      >
        Buy for {tradeGood.purchasePrice * count}$
      </Button>
    </Space>
  );
}

export default MarketStore;
