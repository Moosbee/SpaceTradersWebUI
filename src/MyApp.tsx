import ErrorPage from "./components/ErrorPage";
import { Routes, Route } from "react-router-dom";
import Main from "./sites/main/Main";
import Agents from "./sites/agents/Agents";
import Fleet from "./sites/fleet/Fleet";
import Systems from "./sites/systems/Systems";
import Factions from "./sites/factions/Factions";
import Contracts from "./sites/contracts/Contracts";
import NewAgent from "./sites/newAgent/NewAgent";
import { Layout, theme, ConfigProvider, Button, App } from "antd";
import MySider from "./components/myHeader/mySider";
import { useState } from "react";
import SystemInfo from "./sites/systems/SystemInfo";
import WaypointInfo from "./sites/systems/WaypointInfo";

const { Header, Content, Sider } = Layout;

function MyApp() {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const { defaultAlgorithm, darkAlgorithm } = theme;
  const [isDarkMode, setIsDarkMode] = useState(true);
  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <App>
        <Layout>
          <Header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
            }}
          >
            <Button
              onClick={() => {
                setIsDarkMode(!isDarkMode);
              }}
            >
              {isDarkMode ? "Light" : "Dark"}-Mode
            </Button>
          </Header>
          <Layout>
            <Sider width={256} theme="light">
              <MySider></MySider>
            </Sider>
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
                  <Route path="/fleet" element={<Fleet></Fleet>} />
                  <Route path="/factions" element={<Factions></Factions>} />
                  <Route path="/contracts" element={<Contracts></Contracts>} />
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
                </Routes>
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </App>
    </ConfigProvider>
  );
}

export default MyApp;
