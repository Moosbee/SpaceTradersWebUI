import {
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  List,
  Row,
  Table,
} from "antd";
import { useAppDispatch } from "../../hooks";
import type { Shipyard } from "../../spaceTraderAPI/api";
import { setMyAgent } from "../../spaceTraderAPI/redux/agentSlice";
import { setShip } from "../../spaceTraderAPI/redux/fleetSlice";
import { addShipyardTransaction } from "../../spaceTraderAPI/redux/tansactionSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import ShipyardShipDisp from "./ship/ShipyardShip";

function ShipyardDisp({ shipyard }: { shipyard: Shipyard }) {
  const dispatch = useAppDispatch();

  return (
    <Card title={`Market Info ${shipyard.symbol}`}>
      <Row justify="space-evenly" gutter={[8, 8]}>
        <Col span={24}>
          <Descriptions
            title="Ship Info"
            bordered
            items={[
              {
                label: "Symbol",
                key: "symbol",
                children: shipyard.symbol,
              },
              {
                label: "modificationsFee",
                key: "Modifications Fee",
                children: shipyard.modificationsFee,
              },
              {
                label: "Ship Types",
                key: "Ship Types",
                children: (
                  <List
                    size="small"
                    dataSource={shipyard.shipTypes.map((ship) => (
                      <span>{ship.type}</span>
                    ))}
                    renderItem={(item) => <List.Item>{item}</List.Item>}
                  ></List>
                ),
              },
            ]}
          />
        </Col>
        {shipyard.ships && (
          <>
            <Col span={24}>
              <Divider>Available Ships</Divider>
              <Row gutter={[8, 8]}>
                {shipyard.ships?.map((value) => {
                  return (
                    <Col span={12} key={value.name}>
                      <ShipyardShipDisp
                        shipyardShip={value}
                        onBuy={() => {
                          spaceTraderClient.FleetClient.purchaseShip({
                            shipType: value.type,
                            waypointSymbol: shipyard.symbol,
                          }).then((data) => {
                            console.log("data", data);
                            dispatch(setMyAgent(data.data.data.agent));
                            dispatch(
                              addShipyardTransaction(
                                data.data.data.transaction,
                              ),
                            );
                            dispatch(setShip(data.data.data.ship));
                          });
                        }}
                      ></ShipyardShipDisp>
                    </Col>
                  );
                })}
              </Row>
            </Col>

            <Col span={24}>
              <Divider>Transaction History</Divider>
              <Table
                dataSource={shipyard.transactions}
                columns={[
                  {
                    title: "Ship Symbol",
                    dataIndex: "shipSymbol",
                    key: "shipSymbol",
                  },
                  {
                    title: "Ship Type",
                    dataIndex: "shipType",
                    key: "shipType",
                  },
                  {
                    title: "Price",
                    dataIndex: "price",
                    key: "price",
                  },
                  {
                    title: "Agent Symbol",
                    dataIndex: "agentSymbol",
                    key: "agentSymbol",
                  },
                  {
                    title: "Timestamp",
                    dataIndex: "timestamp",
                    key: "timestamp",
                    render: (timestamp) => new Date(timestamp).toLocaleString(),
                  },
                ]}
                rowKey="timestamp"
              />
            </Col>
          </>
        )}
        {shipyard.ships === undefined && (
          <Col span={24}>
            <Empty description="No ship nearby"></Empty>
          </Col>
        )}
      </Row>
    </Card>
  );
}

export default ShipyardDisp;
