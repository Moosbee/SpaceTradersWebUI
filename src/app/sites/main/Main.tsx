import type { DescriptionsProps } from "antd";
import {
  Card,
  Col,
  Descriptions,
  Divider,
  Flex,
  Menu,
  Row,
  Spin,
  Table,
} from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { GetStatus200Response } from "../../spaceTraderAPI/api";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";

function Main() {
  const [status, setStatus] = useState<GetStatus200Response | null>(null);
  useEffect(() => {
    spaceTraderClient.DefaultClient.getStatus().then((response) => {
      console.log("response", response);
      setStatus(response.data);
    });
  }, []);

  const items: DescriptionsProps["items"] = [
    {
      key: 1,
      label: "Description",
      children: status?.description,
      span: { xs: 2, sm: 3, md: 4, lg: 4, xl: 3, xxl: 3 },
    },
    {
      key: 2,
      label: "Status",
      children: status?.status,
    },
    {
      key: 3,
      label: "Version",
      children: status?.version,
    },
    {
      key: 4,
      label: "Last reset",
      children: new Date(status ? status.resetDate : 0).toLocaleDateString(),
    },
    {
      key: 5,
      label: "Next reset",
      children: new Date(
        status ? status?.serverResets.next : 0,
      ).toLocaleDateString(),
    },
    {
      key: 6,
      label: "Frequency",
      children: status?.serverResets.frequency,
    },
    {
      key: 7,
      label: "Agents",
      children: status?.stats.agents.toLocaleString(),
    },
    {
      key: 8,
      label: "Ships",
      children: status?.stats.ships.toLocaleString(),
    },
    {
      key: 9,
      label: "Systems",
      children: status?.stats.systems.toLocaleString(),
    },
    {
      key: 10,
      label: "Waypoints",
      children: status?.stats.waypoints.toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: "24px 24px" }}>
      <Spin spinning={status === null}>
        <h2>Announcements</h2>
        <Flex gap="14px">
          {status?.announcements.map((value) => {
            return (
              <Card key={value.title} title={value.title}>
                <p>{value.body}</p>
              </Card>
            );
          })}
        </Flex>
        <Divider />

        <h2>Information</h2>
        <Descriptions items={items} bordered />
        <h2>Leaderboards</h2>
        <Divider />
        <Row gutter={16}>
          <Col span={12}>
            <h3>Most Credits</h3>

            <Divider />
            <Table
              pagination={false}
              dataSource={status?.leaderboards.mostCredits.map((value) => {
                return {
                  key: value.agentSymbol,
                  agentSymbol: value.agentSymbol,
                  credits: value.credits.toLocaleString() + "$",
                };
              })}
              columns={[
                {
                  title: "Agent Symbol",
                  dataIndex: "agentSymbol",
                  key: "agentSymbol",
                },
                {
                  title: "Credits",
                  dataIndex: "credits",
                  key: "credits",
                },
              ]}
            />
          </Col>
          <Col span={12}>
            <h3>Most Submitted Charts</h3>
            <Divider />
            <Table
              dataSource={status?.leaderboards.mostSubmittedCharts.map(
                (value) => {
                  return {
                    key: value.agentSymbol,
                    agentSymbol: value.agentSymbol,
                    chartCount: value.chartCount.toLocaleString(),
                  };
                },
              )}
              columns={[
                {
                  title: "Agent Symbol",
                  dataIndex: "agentSymbol",
                  key: "agentSymbol",
                },
                {
                  title: "Chart Count",
                  dataIndex: "chartCount",
                  key: "chartCount",
                },
              ]}
            />
          </Col>
        </Row>
        <br />
        <Menu
          mode="horizontal"
          items={status?.links.map((value) => {
            return {
              key: value.name,
              label: <Link to={value.url}>{value.name}</Link>,
            };
          })}
        ></Menu>
      </Spin>
    </div>
  );
}

export default Main;
