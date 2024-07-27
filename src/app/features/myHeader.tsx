import type { DropdownProps } from "antd";
import { Avatar, Button, Dropdown, Space, theme } from "antd";
import { useEffect } from "react";
import type { AntHeaderHeader } from "../../MyApp";
import { useAppSelector, useAppDispatch } from "../hooks";
import {
  selectAgents,
  selectMyAgent,
  setMyAgent,
} from "../spaceTraderAPI/redux/agentSlice";
import {
  selectDarkMode,
  setDarkMode,
} from "../spaceTraderAPI/redux/configSlice";
import spaceTraderClient from "../spaceTraderAPI/spaceTraderClient";
import { Link } from "react-router-dom";

function LoginMenu() {
  return (
    <div>
      {agents.map((agent) => (
        <Button
          onClick={() => {
            spaceTraderClient.AgentsClient.getMyAgent().then((response) => {
              console.log("my response", response);
            });
          }}
        ></Button>
      ))}
    </div>
  );
}

function MyHeader({ Header }: { Header: typeof AntHeaderHeader }) {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(selectDarkMode);
  const agents = useAppSelector(selectAgents);
  const myAgent = useAppSelector(selectMyAgent);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    spaceTraderClient.AgentsClient.getMyAgent().then((response) => {
      console.log("my response", response);
      dispatch(setMyAgent(response.data.data));
    });
  }, [dispatch]);

  const items: DropdownProps["menu"] = agents
    .map((agent) => {
      return {
        key: agent.symbol + " " + agent.token + " lest",
        label: (
          <span>
            {agent.symbol} {agent.token.slice(0, 3)}******
            {agent.token.slice(agent.token.length - 3)}
          </span>
        ),
      };
    })
    .concat([
      {
        type: "divider",
      },
      {
        key: "login",
        label: <Link to="/newAgent">Add Agent</Link>,
      },
    ]);

  return (
    <Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: colorBgContainer,
      }}
    >
      <Space>
        <Dropdown menu={items} trigger={["click"]}>
          {myAgent.symbol !== "" ? (
            <div style={{ cursor: "pointer" }}>
              <Avatar>{myAgent.symbol.slice(0, 1)}</Avatar>
              {myAgent.symbol}{" "}
              <span>Funds: {myAgent.credits.toLocaleString()}</span>
            </div>
          ) : (
            <div style={{ cursor: "pointer" }}>Choose Agent</div>
          )}
        </Dropdown>
      </Space>
      <div>
        <Button
          onClick={() => {
            dispatch(setDarkMode(!isDarkMode));
          }}
        >
          {isDarkMode ? "Light" : "Dark"}-Mode
        </Button>
      </div>
    </Header>
  );
}

export default MyHeader;
