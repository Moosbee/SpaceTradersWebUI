import { useEffect } from "react";
import eventWorker from "./eventWorker?sharedworker";

function WorkerLoader() {
  useEffect(() => {
    // Create a new web worker
    const myWorker = new eventWorker();
    // Clean up the worker when the component unmounts
    return () => {
      myWorker.port.close();
    };
  }, []);
  return null;
}

export default WorkerLoader;
