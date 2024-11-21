import { useEffect } from "react";
import eventWorker from "./eventWorker?sharedworker";
import socketWorker from "./socketWorker?sharedworker";

function WorkerLoader() {
  useEffect(() => {
    // Create a new web worker
    const myWorker = new eventWorker();
    // const notification = new notificationWorker();
    const socket = new socketWorker();
    // Clean up the worker when the component unmounts
    return () => {
      myWorker.port.close();
      // notification.port.close();
      socket.port.close();
    };
  }, []);
  return null;
}

export default WorkerLoader;
