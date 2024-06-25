import { Layout, theme, ConfigProvider, App } from "antd";
import { Routes, Route } from "react-router-dom";
import "./MyApp.css";
import Agents from "./sites/agents/Agents";
import Caching from "./sites/caching/caching";
import Contracts from "./sites/contracts/Contracts";
import Factions from "./sites/factions/Factions";
import Fleet from "./sites/fleet/Fleet";
import ShipInfo from "./sites/fleet/ShipInfo";
import Main from "./sites/main/Main";
import NewAgent from "./sites/newAgent/NewAgent";
import SystemInfo from "./sites/systems/SystemInfo";
import Systems from "./sites/systems/Systems";
import WaypointInfo from "./sites/systems/WaypointInfo";
import ErrorPage from "./sites/ErrorPage";
import MySider from "./features/mySider";
import Message from "./utils/message";
import { useAppSelector } from "./app/hooks";
import { selectDarkMode } from "./app/spaceTraderAPI/redux/configSlice";
import MyHeader from "./features/myHeader";
const { Header, Content, Sider } = Layout;

export { Sider as AntSiderSider };
export { Header as AntHeaderHeader };

function MyApp() {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const { defaultAlgorithm, darkAlgorithm } = theme;
  const isDarkMode = useAppSelector(selectDarkMode);
  return (
    <>
      <Message />
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        }}
      >
        <App>
          <Layout>
            <MyHeader Header={Header} />
            <Layout>
              <MySider Slider={Sider}></MySider>
              <Layout style={{ padding: "24px 24px" }}>
                <Content
                  style={{
                    padding: 24,
                    margin: 0,
                    minHeight: 280,
                    borderRadius: borderRadiusLG,
                  }}
                >
                  <Routes>
                    <Route
                      path="/"
                      element={<Main></Main>}
                      errorElement={<ErrorPage />}
                    />
                    <Route path="/agents" element={<Agents></Agents>} />
                    <Route
                      path="/fleet/:shipID"
                      element={<ShipInfo></ShipInfo>}
                    />
                    <Route path="/fleet" element={<Fleet></Fleet>} />
                    <Route path="/factions" element={<Factions></Factions>} />
                    <Route
                      path="/contracts"
                      element={<Contracts></Contracts>}
                    />
                    <Route path="/newAgent" element={<NewAgent></NewAgent>} />
                    <Route
                      path="/system/:systemID/:waypointID"
                      element={<WaypointInfo></WaypointInfo>}
                    />
                    <Route
                      path="/system/:systemID"
                      element={<SystemInfo></SystemInfo>}
                    />
                    <Route path="/systems" element={<Systems></Systems>} />
                    <Route path="/cache" element={<Caching></Caching>} />
                  </Routes>
                </Content>
              </Layout>
            </Layout>
          </Layout>
        </App>
      </ConfigProvider>
    </>
  );
}

export default MyApp;
