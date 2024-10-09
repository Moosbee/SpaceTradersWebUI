import type { EventWorkerChannelData } from "./eventWorker";

const work = () => {
  const bc = new BroadcastChannel("EventWorkerChannel");
  bc.onmessage = (event: MessageEvent<EventWorkerChannelData>) => {
    const title =
      event.data.type === "cooldown"
        ? `The Cooldown of ${event.data.shipName} has finished`
        : `Ship ${event.data.shipName} arrived`;
    const notifaication = new Notification(title);
  };
};

work();
