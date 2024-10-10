import { Badge, Button, Card, Space } from "antd";
import { useCallback, useEffect, useState } from "react";
import type { Ship } from "../../../spaceTraderAPI/api";
import { setShipCooldown } from "../../../spaceTraderAPI/redux/fleetSlice";
import {
  addSurveys,
  pruneSurveys,
} from "../../../spaceTraderAPI/redux/surveySlice";
import spaceTraderClient from "../../../spaceTraderAPI/spaceTraderClient";
import { store } from "../../../store";
import { message } from "../../../utils/antdMessage";
import type { EventWorkerChannelData } from "../../../workers/eventWorker";

function Surveyor({ ship }: { ship: Ship }) {
  const [running, setRunning] = useState(false);

  const action = useCallback(() => {
    spaceTraderClient.FleetClient.createSurvey(ship.symbol).then((value) => {
      console.log("value", value);
      store.dispatch(addSurveys(value.data.data.surveys));
      store.dispatch(pruneSurveys(Date.now()));
      store.dispatch(
        setShipCooldown({
          symbol: ship.symbol,
          cooldown: value.data.data.cooldown,
        }),
      );
      message.success(
        `Surveys Created\n ${value.data.data.surveys
          .map(
            (w) =>
              `${w.signature}(${
                w.size
              }) - (${w.deposits.map((w) => w.symbol)})`,
          )
          .join("\n")}`,
      );
    });
  }, [ship.symbol]);
  useEffect(() => {
    const bcc = new BroadcastChannel("EventWorkerChannel");
    console.log("bcc", bcc);
    bcc.addEventListener(
      "message",
      (event: MessageEvent<EventWorkerChannelData>) => {
        console.log("event", event);
        if (!running || event.data.type !== "cooldown") return;
        action();
      },
    );

    return () => {
      bcc.close();
    };
  }, [action, running]);

  return (
    <Card
      title={
        <Space>
          <Badge status={running ? "processing" : "default"} />
          Surveying
        </Space>
      }
      // title="Surveyor"
      extra={
        <Button
          onClick={() => {
            setRunning(!running);
            if (!running) {
              action();
            }
          }}
        >
          {running ? "Stop" : "Start"}
        </Button>
      }
    ></Card>
  );
}

export default Surveyor;
