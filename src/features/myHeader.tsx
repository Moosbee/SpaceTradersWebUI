import { Avatar, Button, Space, theme } from "antd";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  selectDarkMode,
  setDarkMode,
} from "../app/spaceTraderAPI/redux/configSlice";
import type { AntHeaderHeader } from "../MyApp";
import {
  selectMyAgent,
  setMyAgent,
} from "../app/spaceTraderAPI/redux/agentSlice";
import { useEffect } from "react";
import spaceTraderClient from "../app/spaceTraderAPI/spaceTraderClient";

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
