import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import spaceTraderClient from "./spaceTraderClient";

function App() {
  const [count, setCount] = useState(0);

  async function test() {
    setCount((count) => count + 1);
    console.log("test", await spaceTraderClient.AgentsClient.getMyAgent());
  }

  return (
    <>
      <button onClick={() => test()}>count is {count}</button>
    </>
  );
}

export default App;
