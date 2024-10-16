import type { Ship } from "../spaceTraderAPI/api";
import { store } from "../store";

export type EventWorkerChannelData = {
  type: "cooldown" | "arrival";
  shipName: string;
  timeDiff: number;
};

const bc = new BroadcastChannel("EventWorkerChannel");
let timeOut: { [key: string]: NodeJS.Timeout } = {};
console.log("timeOut", timeOut);

store.subscribe(() => {
  const state = store.getState();

  const cooldownCalc = (ship: Ship) => {
    if (!ship?.cooldown?.expiration) return;
    const timeDiff =
      new Date(ship.cooldown.expiration).getTime() - new Date().getTime();

    console.log("cooldown timeDiff", timeDiff);

    if (timeOut["Cooldown" + ship.symbol])
      clearTimeout(timeOut["Cooldown" + ship.symbol]);
    delete timeOut["Cooldown" + ship.symbol];

    if (timeDiff < 0) return;
    timeOut["Cooldown" + ship.symbol] = setTimeout(() => {
      console.log("cooldown", ship.symbol, timeDiff);
      bc.postMessage({
        type: "cooldown",
        shipName: ship.symbol,
        timeDiff,
      });
    }, timeDiff + 100);
  };

  const arrivalCalc = (ship: Ship) => {
    const timeDiff =
      new Date(ship.nav.route.arrival).getTime() - new Date().getTime();

    // console.log("arrival timeDiff", timeDiff);

    if (timeOut["Arrival" + ship.symbol])
      clearTimeout(timeOut["Arrival" + ship.symbol]);
    delete timeOut["Arrival" + ship.symbol];

    if (timeDiff < 0) return;
    timeOut["Arrival" + ship.symbol] = setTimeout(() => {
      console.log("arrival", ship.symbol, timeDiff);
      bc.postMessage({
        type: "arrival",
        shipName: ship.symbol,
        timeDiff,
      });
    }, timeDiff + 100);
  };

  Object.keys(state.fleet.ships).forEach((shipName) => {
    const ship = state.fleet.ships[shipName];
    if (!ship) return;

    cooldownCalc(ship);
    arrivalCalc(ship);
  });
});
