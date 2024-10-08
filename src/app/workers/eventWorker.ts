import { store } from "../store";

export type EventWorkerChannelData = {
  type: "cooldown";
  shipName: string;
  timeDiff: number;
};

const bc = new BroadcastChannel("EventWorkerChannel");
let timeOut: { [key: string]: NodeJS.Timeout } = {};
console.log("timeOut", timeOut);

store.subscribe(() => {
  const state = store.getState();

  Object.keys(state.fleet.ships).forEach((shipName) => {
    if (!state.fleet.ships[shipName]?.cooldown?.expiration) return;
    const timeDiff =
      new Date(state.fleet.ships[shipName].cooldown.expiration).getTime() -
      new Date().getTime();

    console.log("timeDiff", timeDiff);

    if (timeOut[shipName]) clearTimeout(timeOut[shipName]);
    delete timeOut[shipName];

    if (timeDiff < 0) return;
    timeOut[shipName] = setTimeout(() => {
      console.log("cooldown", shipName, timeDiff);
      bc.postMessage({
        type: "cooldown",
        shipName,
        timeDiff,
      });
    }, timeDiff + 100);
  });
});
