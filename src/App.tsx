import ErrorPage from "./components/ErrorPage";
import { Routes, Route } from "react-router-dom";
import Main from "./sites/main/Main";
import Agents from "./sites/agents/Agents";
import Fleet from "./sites/fleet/Fleet";
import Systems from "./sites/systems/Systems";
import Factions from "./sites/factions/Factions";
import Contracts from "./sites/contracts/Contracts";
import NewAgent from "./sites/newAgent/NewAgent";
import { Layout, theme, ConfigProvider, Button } from "antd";
import MySider from "./components/myHeader/mySider";
import { useState } from "react";

const { Header, Content, Sider } = Layout;

function App() {
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
                <Route path="/systems" element={<Systems></Systems>} />
                <Route path="/factions" element={<Factions></Factions>} />
                <Route path="/contracts" element={<Contracts></Contracts>} />
                <Route path="/newAgent" element={<NewAgent></NewAgent>} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
