import { Card, Col, Empty, List, Row, Table, Tooltip } from "antd";
import type { Market } from "../../spaceTraderAPI/api";

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

export default MarketDisp;
