import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { AgentsApi } from "./components/api/api";
import { Configuration } from "./components/api/configuration";

function App() {
  const [count, setCount] = useState(0);

  function test() {
    const openapiConfig = new Configuration();
    openapiConfig.baseOptions = {
      headers: {
        Authorization:
          "Bearer " + import.meta.env.VITE_SPACE_TRADERS_CLIENT_AGENT_TOKEN,
      },
    };
    const openapi = new AgentsApi(openapiConfig);
    setCount((count) => count + 1);

    openapi
      .getMyAgent()
      .then((value) => {
        console.log("value", value, value.data.data.symbol);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => test()}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
