import { Layout, theme, ConfigProvider, App } from "antd";
import { Routes, Route } from "react-router-dom";
import "./MyApp.css";
import Agents from "./app/sites/agents/Agents";
import Caching from "./app/sites/caching/caching";
import Contracts from "./app/sites/contracts/Contracts";
import Factions from "./app/sites/factions/Factions";
import Fleet from "./app/sites/fleet/Fleet";
import ShipInfo from "./app/sites/fleet/ShipInfo";
import Main from "./app/sites/main/Main";
import NewAgent from "./app/sites/newAgent/NewAgent";
import SystemInfo from "./app/sites/systems/SystemInfo";
import Systems from "./app/sites/systems/Systems";
import WaypointInfo from "./app/sites/systems/WaypointInfo";
import ErrorPage from "./app/sites/ErrorPage";
import Message from "./app/utils/message";
import { useAppSelector } from "./app/hooks";
import { selectDarkMode } from "./app/spaceTraderAPI/redux/configSlice";
import MySider from "./app/features/mySider";
import MyHeader from "./app/features/myHeader";
import WpMap from "./app/sites/map/waypoint/wpMap";
import WpConfig from "./app/sites/map/waypoint/wpConfig";
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
              <Layout>
                <Content
                  style={{
                    padding: 0,
                    // padding: 24,
                    margin: 0,
                    minHeight: "calc(100vh - 64px)",
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
                    <Route
                      path="/system/map/:systemID"
                      element={<WpMap></WpMap>}
                    />
                    <Route
                      path="/system/wpConfig"
                      element={<WpConfig></WpConfig>}
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
