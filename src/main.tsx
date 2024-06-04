import React from "react";
import ReactDOM from "react-dom/client";
import MyApp from "./MyApp.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

import "antd/dist/reset.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MyApp />
    </BrowserRouter>
  </React.StrictMode>
);
