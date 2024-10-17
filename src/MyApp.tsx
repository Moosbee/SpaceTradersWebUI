import { App, ConfigProvider, Layout, theme } from "antd";
import { Route, Routes } from "react-router-dom";
import "./MyApp.css";
import MyHeader from "./app/features/myHeader";
import MySider from "./app/features/mySider";
import { useAppSelector } from "./app/hooks";
import ErrorPage from "./app/sites/ErrorPage";
import Agents from "./app/sites/agents/Agents";
import Automations from "./app/sites/automation/Automations";
import PageAutomationEditor from "./app/sites/automation/Editor";
import Caching from "./app/sites/caching/caching";
import Contracts from "./app/sites/contracts/Contracts";
import Factions from "./app/sites/factions/Factions";
import Fleet from "./app/sites/fleet/Fleet";
import ShipInfo from "./app/sites/fleet/ShipInfo";
import Main from "./app/sites/main/Main";
import MapConfig from "./app/sites/map/waypoint/mapConfig";
import WpMap from "./app/sites/map/waypoint/wpMap";
import NewAgent from "./app/sites/newAgent/NewAgent";
import Surveys from "./app/sites/surveys/Surveys";
import Markets from "./app/sites/systems/Markets";
import SystemInfo from "./app/sites/systems/SystemInfo";
import Systems from "./app/sites/systems/Systems";
import WaypointInfo from "./app/sites/systems/WaypointInfo";
import MarketTransaction from "./app/sites/tramsactions/MarketTransaction";
import { selectDarkMode } from "./app/spaceTraderAPI/redux/configSlice";
import Message from "./app/utils/message";
import WorkerLoader from "./app/workers/WorkerLoader";
const { Header, Content, Sider } = Layout;

export { Header as AntHeaderHeader, Sider as AntSiderSider };

function MyApp() {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const { defaultAlgorithm, darkAlgorithm } = theme;
  const isDarkMode = useAppSelector(selectDarkMode);
  return (
    <>
      <Message />
      <WorkerLoader />

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
                      path="/transactions/market"
                      element={<MarketTransaction></MarketTransaction>}
                    />
                    <Route
                      path="/system/:systemID/:waypointID"
                      element={<WaypointInfo></WaypointInfo>}
                    />

                    <Route
                      path="/system/:systemID"
                      element={<SystemInfo></SystemInfo>}
                    />
                    <Route
                      path="/system/markets/:systemID"
                      element={<Markets></Markets>}
                    />
                    <Route
                      path="/system/map/:systemID"
                      element={<WpMap></WpMap>}
                    />
                    <Route
                      path="/system/wpConfig"
                      element={<MapConfig></MapConfig>}
                    />
                    <Route path="/systems" element={<Systems></Systems>} />
                    <Route path="/cache" element={<Caching></Caching>} />
                    <Route path="/surveys" element={<Surveys />} />
                    <Route path="/automation" element={<Automations />} />
                    <Route
                      path="/automation/editor"
                      element={<PageAutomationEditor />}
                    />
                    <Route
                      path="/automation"
                      element={<PageAutomationEditor />}
                    />
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
