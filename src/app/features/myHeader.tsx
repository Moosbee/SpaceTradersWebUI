import type { MenuProps } from "antd";
import { Avatar, Badge, Button, Dropdown, Flex, Space, theme } from "antd";
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import type { AntHeaderHeader } from "../../MyApp";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  clearAgents,
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
import {
  selectSelectedShipSymbol,
  selectSelectedSystemSymbol,
  selectSelectedWaypointSymbol,
} from "../spaceTraderAPI/redux/mapSlice";
import spaceTraderClient from "../spaceTraderAPI/spaceTraderClient";
import { message } from "../utils/antdMessage";
import FaIcon from "./FontAwsome/FaIcon";

function MyHeader({ Header }: { Header: typeof AntHeaderHeader }) {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(selectDarkMode);
  const agents = useAppSelector(selectAgents);
  const myAgentSymbol = useAppSelector(selectAgentSymbol);
  const myAgent = useAppSelector((state) => selectAgent(state, myAgentSymbol));
  const shipSymbol = useAppSelector(selectSelectedShipSymbol);
  const waypointSymbol = useAppSelector(selectSelectedWaypointSymbol);
  const systemSymbol = useAppSelector(selectSelectedSystemSymbol);

  const {
    token: { colorBgContainer, colorTextDescription },
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
            dispatch(clearAgents());
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
          const text = JSON.stringify(
            agents.map((agent) => {
              return { symbol: agent.agent.symbol, token: agent.token };
            }),
          );
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

  const settingsItems: MenuProps["items"] = [
    {
      key: "darkMode",
      onClick: (e) => {
        e.domEvent.stopPropagation();
        e.domEvent.preventDefault();
        dispatch(setDarkMode(!isDarkMode));
      },
      label: `${isDarkMode ? "Light" : "Dark"}-Mode`,
      icon: <FaIcon type="solid" icon={isDarkMode ? "fa-moon" : "fa-sun"} />,
    },
    {
      key: "popUp",

      onClick: (e) => {
        e.domEvent.preventDefault();
        window.open(window.location.pathname, undefined, "popup:true");
      },
      label: "Pop Up",
      icon: <FaIcon type="solid" icon="fa-window-restore" />,
    },
  ];

  return (
    <Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        width: "100%",
        background: colorBgContainer,
        padding: "0 24px",
      }}
    >
      <Flex gap="middle" align="center" justify="space-between">
        <Dropdown menu={{ items }} trigger={["click"]}>
          {myAgent?.agent ? (
            <Space style={{ cursor: "pointer" }}>
              <Avatar>{myAgent.agent.symbol.slice(0, 1)}</Avatar>
              {myAgent.agent.symbol}
              <span>{myAgent.agent.credits.toLocaleString()}$</span>
            </Space>
          ) : (
            <Space style={{ cursor: "pointer" }}>Choose Agent</Space>
          )}
        </Dropdown>
        <div>
          {systemSymbol && (
            <span>
              <FaIcon
                type="solid"
                icon="fa-solar-system"
                style={{
                  color: colorTextDescription,
                }}
              />{" "}
              <b>{systemSymbol}</b>
            </span>
          )}
          {systemSymbol && waypointSymbol && `   `}
          {waypointSymbol && (
            <span>
              <FaIcon
                type="solid"
                icon="fa-planet-moon"
                style={{
                  color: colorTextDescription,
                }}
              />{" "}
              <b>
                {waypointSymbol.waypointSymbol.replace(systemSymbol || "", "")}
              </b>
            </span>
          )}
          {shipSymbol && waypointSymbol && `   `}
          {shipSymbol && (
            <span>
              <FaIcon
                type="solid"
                icon="fa-rocket-launch"
                style={{
                  color: colorTextDescription,
                }}
              />{" "}
              <b>{shipSymbol}</b>
            </span>
          )}
        </div>
        <Dropdown trigger={["click"]} menu={{ items: settingsItems }}>
          <Button>
            <FaIcon type="solid" icon="fa-gear" /> Settings
          </Button>
        </Dropdown>
      </Flex>
    </Header>
  );
}

export default MyHeader;
