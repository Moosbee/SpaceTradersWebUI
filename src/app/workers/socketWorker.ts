import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import type { ShipNav } from "../spaceTraderAPI/api";
import { BASE_PATH } from "../spaceTraderAPI/api/base";
import { selectAgent } from "../spaceTraderAPI/redux/agentSlice";
import { selectAgentSymbol } from "../spaceTraderAPI/redux/configSlice";
import { selectShips, setShipNav } from "../spaceTraderAPI/redux/fleetSlice";
import { store } from "../store";

const work = () => {
  // const bc = new BroadcastChannel("EventWorkerChannel");
  // bc.onmessage = (event: MessageEvent<EventWorkerChannelData>) => {};

  // store.subscribe(() => {
  //   const state = store.getState();
  // });

  let oldToken = "";

  console.log("Start socket worker");

  const onEvent = (eventName: string, args: any[]) => {
    console.log("eveent", eventName, args);
  };

  let sockets: Socket[] = [];

  store.subscribe(() => {
    const state = store.getState();

    const myAgentSymbol = selectAgentSymbol(state);
    const agent = selectAgent(state, myAgentSymbol);

    if (agent === undefined || agent.token === oldToken) {
      return;
    }
    oldToken = agent.token;

    const connString = BASE_PATH.replace("https://", "wss://").replace(
      "/v2",
      "",
    );
    console.log("ws token", agent, connString);

    let mySystems = selectShips(state)
      .filter((value) => value.symbol.startsWith(agent.agent.symbol))
      .map((ship) => ship.nav.systemSymbol)
      .filter((value, index, self) => self.indexOf(value) === index);

    if (sockets.length > 0) {
      sockets.forEach((socket) => {
        console.log("disconnect", socket.connected);
        socket.disconnect();
      });
    }

    sockets = mySystems.map((systemSymbol) => {
      const socket = io(connString, {
        transports: ["websocket"],
        path: "/v2/socket.io/",
        query: {
          token: agent.token,
          systemSymbol,
        },
      });
      socket.onAny((eventName, ...args) => {
        onEvent(eventName, args);
      });

      socket.on(
        `systems.${systemSymbol}.departure`,
        (shipName: string, nav: ShipNav) => {
          console.log("departurer", shipName, nav);
          store.dispatch(
            setShipNav({
              symbol: shipName,
              nav,
            }),
          );
        },
      );

      socket.on("connect", () => {
        console.log("connected");
      });

      socket.on("error", () => {
        console.log("error");
      });

      socket.connect();

      console.log("socket", socket);
      return socket;
    });
  });
};

work();
