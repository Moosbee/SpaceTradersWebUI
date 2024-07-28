import type { MenuProps } from "antd";
import { Avatar, Badge, Button, Dropdown, Space, theme } from "antd";
import { useEffect, useMemo } from "react";
import type { AntHeaderHeader } from "../../MyApp";
import { useAppSelector, useAppDispatch } from "../hooks";
import {
  removeAgent,
  selectAgents,
  selectMyAgent,
  setAgents,
  setMyAgent,
} from "../spaceTraderAPI/redux/agentSlice";
import {
  selectAgentToken,
  selectDarkMode,
  setAgentToken,
  setDarkMode,
} from "../spaceTraderAPI/redux/configSlice";
import spaceTraderClient from "../spaceTraderAPI/spaceTraderClient";
import { Link } from "react-router-dom";
import FaIcon from "./FontAwsome/FaIcon";
import { message } from "../utils/antdMessage";

function MyHeader({ Header }: { Header: typeof AntHeaderHeader }) {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(selectDarkMode);
  const agents = useAppSelector(selectAgents);
  const myAgent = useAppSelector(selectMyAgent);
  const token = useAppSelector(selectAgentToken);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    spaceTraderClient.AgentsClient.getMyAgent().then((response) => {
      console.log("my response", response);
      dispatch(setMyAgent(response.data.data));
    });
  }, [dispatch]);

  const items: MenuProps["items"] = useMemo<MenuProps["items"]>(() => {
    const items: MenuProps["items"] = agents.map((agent) => {
      return {
        key: agent.symbol + " " + agent.token + " lest",
        icon: <Badge status={agent.token === token ? "success" : "default"} />,
        label: (
          <span
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              spaceTraderClient.AgentsClient.getMyAgent({
                transformRequest: (data, headers) => {
                  headers["Authorization"] = `Bearer ${agent.token}`;
                  return data;
                },
              }).then((response) => {
                dispatch(setMyAgent(response.data.data));
                dispatch(setAgentToken(agent.token));
                message.info("Selected " + agent.symbol);
              });
            }}
          >
            {agent.symbol} {agent.token.slice(0, 3)}******
            {agent.token.slice(agent.token.length - 3)}&nbsp;&nbsp;
          </span>
        ),
        itemIcon: (
          <Button
            type="primary"
            danger
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              dispatch(removeAgent({ token: agent.token }));
              message.info("Removed " + agent.symbol);
            }}
          >
            <FaIcon type="solid" icon="fa-trash-can" />
          </Button>
        ),
      };
    });
    return items.concat([
      {
        type: "divider",
        key: "divider",
      },
      {
        key: "login",
        label: <Link to="/newAgent">Add Agent</Link>,
        itemIcon: <FaIcon type="solid" icon="fa-plus" />,
      },
      {
        onClick: () => {
          console.log("revalidate");
          Promise.all(
            agents.map((agent) => {
              return spaceTraderClient.AgentsClient.getMyAgent({
                transformRequest: (data, headers) => {
                  headers["Authorization"] = `Bearer ${agent.token}`;
                  return data;
                },
              }).then((response) => {
                if (response.status === 200) {
                  return {
                    symbol: agent.symbol,
                    token: agent.token,
                  };
                } else {
                  message.warning("Failed to revalidate " + agent.symbol);
                  return undefined;
                }
              });
            }),
          ).then((data) => {
            dispatch(setAgents(data.filter((agent) => agent !== undefined)));
            message.success("All agents revalidated");
          });
        },
        key: "revalidate",
        label: "Revalidate Agents",
        itemIcon: <FaIcon type="solid" icon="fa-rotate" />,
      },
    ]);
  }, [agents, dispatch, token]);

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
        <Dropdown menu={{ items }} trigger={["click"]}>
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
