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
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type { Market, Ship, TradeGood } from "../../spaceTraderAPI/api";
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
                <TradeGoodDisp tradeGood={ext} marketSymbol={market.symbol} />
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
                <TradeGoodDisp tradeGood={expo} marketSymbol={market.symbol} />
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
                <TradeGoodDisp
                  tradeGood={imp}
                  canBuy={false}
                  marketSymbol={market.symbol}
                />
              ))}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </Col>
        {market.transactions && market.tradeGoods ? (
          <>
            <Col span={12}>
              <Card title="Traded Goods" size="small">
                <Table
                  dataSource={market.tradeGoods}
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

function TradeGoodDisp({
  tradeGood,
  marketSymbol,
  canBuy = true,
}: {
  tradeGood: TradeGood;
  marketSymbol: string;
  canBuy?: boolean;
}) {
  const ships = useAppSelector(selectShips).filter(
    (value) => value.nav.waypointSymbol === marketSymbol,
  );
  const [ship, setShip] = useState<Ship | null>(null);
  const [count, setCount] = useState(1);
  const dispatch = useAppDispatch();

  return (
    <Space>
      <Tooltip
        key={tradeGood.symbol}
        title={`${tradeGood.symbol} - ${tradeGood.description}`}
      >
        {tradeGood.name}
      </Tooltip>
      {canBuy && (
        <>
          <Select
            style={{ width: 140 }}
            onChange={(value) =>
              setShip(ships.find((w) => w.symbol === value) ?? null)
            }
            value={ship?.symbol}
            options={ships.map((w) => ({ label: w.symbol, value: w.symbol }))}
          />
          <InputNumber
            min={1}
            max={ship ? ship?.cargo.capacity - ship?.cargo.units : 0}
            defaultValue={1}
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
            Buy
          </Button>
        </>
      )}
    </Space>
  );
}

export default MarketDisp;
