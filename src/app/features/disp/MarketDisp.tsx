import {
  Button,
  Card,
  Col,
  Empty,
  InputNumber,
  List,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
} from "antd";
import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type { Market, MarketTradeGood } from "../../spaceTraderAPI/api";
import { setMyAgent } from "../../spaceTraderAPI/redux/agentSlice";
import {
  selectShips,
  setShipCargo,
} from "../../spaceTraderAPI/redux/fleetSlice";
import { addMarketTransaction } from "../../spaceTraderAPI/redux/tansactionSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import { message } from "../../utils/antdMessage";

function MarketDisp({ market }: { market: Market }) {
  return (
    <Card title={`Market Info ${market.symbol}`}>
      <Row justify="space-evenly" gutter={[8, 8]}>
        <Col span={8}>
          <Card title="Exchanges" size="small">
            <List
              size="small"
              bordered
              dataSource={market.exchange.map((ext) => (
                <Tooltip
                  key={ext.symbol}
                  title={`${ext.symbol} - ${ext.description}`}
                >
                  <span>{ext.name}</span>
                </Tooltip>
              ))}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Exports" size="small">
            <List
              size="small"
              bordered
              dataSource={market.exports.map((expo) => (
                <Tooltip
                  key={expo.symbol}
                  title={`${expo.symbol} - ${expo.description}`}
                >
                  <span>{expo.name}</span>
                </Tooltip>
              ))}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Imports" size="small">
            <List
              size="small"
              bordered
              dataSource={market.imports.map((imp) => (
                <Tooltip
                  key={imp.symbol}
                  title={`${imp.symbol} - ${imp.description}`}
                >
                  <span>{imp.name}</span>
                </Tooltip>
              ))}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </Col>
        {market.transactions && market.tradeGoods ? (
          <>
            <Col span={16}>
              <Card title="Traded Goods" size="small">
                <Table
                  dataSource={market.tradeGoods.map((tradeGood) => ({
                    ...tradeGood,
                    action: (
                      <TradeActionDisp
                        tradeGood={tradeGood}
                        marketSymbol={market.symbol}
                      />
                    ),
                  }))}
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
                    },
                    {
                      title: "Sell Price",
                      dataIndex: "sellPrice",
                      key: "sellPrice",
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
            </Col>
            <Col span={12}>
              <Card title="Transaction History" size="small">
                <Table
                  dataSource={market.transactions}
                  rowKey="timestamp"
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
                      render: (timestamp) =>
                        new Date(timestamp).toLocaleString(),
                    },
                  ]}
                />
              </Card>
            </Col>
          </>
        ) : (
          <Col span={24}>
            <Empty description="No ship nearby"></Empty>
          </Col>
        )}
      </Row>
    </Card>
  );
}

function TradeActionDisp({
  tradeGood,
  marketSymbol,
}: {
  tradeGood: MarketTradeGood;
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
  const [count, setCount] = useState(1);
  const dispatch = useAppDispatch();

  return (
    <Space>
      {(tradeGood.type === "EXCHANGE" || tradeGood.type === "EXPORT") && (
        <>
          <Select
            style={{ width: 140 }}
            onChange={(value) => setShipName(value)}
            value={shipName}
            options={ships.map((w) => ({ label: w.symbol, value: w.symbol }))}
          />
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
        </>
      )}
    </Space>
  );
}

export default MarketDisp;
