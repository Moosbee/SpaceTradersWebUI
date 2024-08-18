import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import MyApp from "./MyApp";
import { persistor, store } from "./app/store";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";

const container = document.getElementById("root");

if (container) {
  if (navigator.storage && navigator.storage.persist) {
    const persistent = await navigator.storage.persist();
    if (persistent) {
      console.log("Storage will not be cleared except by explicit user action");
    } else {
      console.log("Storage may be cleared by the UA under storage pressure.");
    }
  }

  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <MyApp />
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </React.StrictMode>,
  );
} else {
  throw new Error(
    "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
  );
}
