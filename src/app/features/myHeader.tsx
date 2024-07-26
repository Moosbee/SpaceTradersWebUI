import { Avatar, Button, Space, theme } from "antd";
import { useEffect } from "react";
import type { AntHeaderHeader } from "../../MyApp";
import { useAppSelector, useAppDispatch } from "../hooks";
import { selectMyAgent, setMyAgent } from "../spaceTraderAPI/redux/agentSlice";
import {
  selectDarkMode,
  setDarkMode,
} from "../spaceTraderAPI/redux/configSlice";
import spaceTraderClient from "../spaceTraderAPI/spaceTraderClient";

function MyHeader({ Header }: { Header: typeof AntHeaderHeader }) {
  const isDarkMode = useAppSelector(selectDarkMode);
  const dispatch = useAppDispatch();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const myAgent = useAppSelector(selectMyAgent);

  useEffect(() => {
    spaceTraderClient.AgentsClient.getMyAgent().then((response) => {
      console.log("my response", response);
      dispatch(setMyAgent(response.data.data));
    });
  }, [dispatch]);

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
        <Avatar>{myAgent?.symbol.slice(0, 1)}</Avatar>
        {myAgent?.symbol}{" "}
        <span>Funds: {myAgent?.credits.toLocaleString()}</span>
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
