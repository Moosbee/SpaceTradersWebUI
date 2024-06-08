import { Card, Row, Col, Descriptions, List, Flex, Divider, Table } from "antd";
import { Shipyard } from "../api";
import ShipDisp from "./ShipDisp";

function ShipyardDisp({ shipyard }: { shipyard: Shipyard }) {
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
        <Col span={24}>
          <Divider>Available Ships</Divider>
          <Row gutter={[8, 8]}>
            {shipyard.ships?.map((value) => {
              return (
                <Col span={12} key={value.name}>
                  <ShipDisp shipyardShip={value}></ShipDisp>
                </Col>
              );
            })}
          </Row>
        </Col>
        <Divider>Transaction History</Divider>

        <Col span={24}>
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
      </Row>
    </Card>
  );
}

export default ShipyardDisp;
