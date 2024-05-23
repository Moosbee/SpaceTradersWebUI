import "./App.css";
import Header from "./components/header/Header";
import ErrorPage from "./components/ErrorPage";
import { Routes, Route } from "react-router-dom";
import Main from "./sites/main/Main";
import Agents from "./sites/agents/Agents";
import Fleet from "./sites/fleet/Fleet";
import Systems from "./sites/systems/Systems";
import Factions from "./sites/factions/Factions";
import Contracts from "./sites/contracts/Contracts";
import NewAgent from "./sites/newAgent/NewAgent";

function App() {
  return (
    <>
      <Header></Header>
      <main>
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
      </main>
    </>
  );
}

export default App;
