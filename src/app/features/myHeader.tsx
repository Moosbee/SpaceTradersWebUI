import type { MenuProps } from "antd";
import { Avatar, Badge, Button, Dropdown, Space, theme } from "antd";
import { useEffect, useMemo } from "react";
import type { AntHeaderHeader } from "../../MyApp";
import { useAppSelector, useAppDispatch } from "../hooks";
import {
  removeAgent,
  selectAgent,
  selectAgents,
  setAgents,
  setMyAgent,
} from "../spaceTraderAPI/redux/agentSlice";
import {
  selectAgentSymbol,
  selectDarkMode,
  setAgentSymbol,
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
  const myAgentSymbol = useAppSelector(selectAgentSymbol);
  const myAgent = useAppSelector((state) => selectAgent(state, myAgentSymbol));

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
        key: agent.agent.symbol + " " + agent.token + " lest",
        icon: (
          <Badge
            status={
              agent.agent.symbol === myAgentSymbol ? "success" : "default"
            }
          />
        ),
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
                dispatch(setAgentSymbol(agent.agent.symbol));
                message.info("Selected " + agent.agent.symbol);
              });
            }}
          >
            {agent.agent.symbol} {agent.token.slice(0, 3)}******
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
              dispatch(removeAgent({ symbol: agent.agent.symbol }));
              message.info("Removed " + agent.agent.symbol);
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
            agents.map(async (agent) => {
              const response = await spaceTraderClient.AgentsClient.getMyAgent({
                transformRequest: (data_1, headers) => {
                  headers["Authorization"] = `Bearer ${agent.token}`;
                  return data_1;
                },
              });
              if (response.status === 200) {
                return {
                  agent: response.data.data,
                  token: agent.token,
                };
              } else {
                message.warning("Failed to revalidate " + agent.agent.symbol);
                return undefined;
              }
            }),
          ).then((data) => {
            dispatch(
              setAgents(
                data
                  .filter((agent) => agent !== undefined)
                  .map((agent) => agent!),
              ),
            );
            message.success("All agents revalidated");
          });
        },
        key: "revalidate",
        label: "Revalidate Agents",
        itemIcon: <FaIcon type="solid" icon="fa-rotate" />,
      },
      {
        key: "download",
        label: "Download",
        itemIcon: <FaIcon type="solid" icon="fa-download" />,
        onClick: () => {
          const text = JSON.stringify(agents);
          const element = document.createElement("a");
          const file = new Blob([text], {
            type: "text/plain",
          });
          element.href = URL.createObjectURL(file);
          element.download = "agents.json";
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        },
      },
    ]);
  }, [agents, dispatch, myAgentSymbol]);

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
      <Dropdown menu={{ items }} trigger={["click"]}>
        {myAgent?.agent ? (
          <Space style={{ cursor: "pointer" }}>
            <Avatar>{myAgent.agent.symbol.slice(0, 1)}</Avatar>
            {myAgent.agent.symbol}
            <span>Funds: {myAgent.agent.credits.toLocaleString()}</span>
          </Space>
        ) : (
          <Space style={{ cursor: "pointer" }}>Choose Agent</Space>
        )}
      </Dropdown>
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
