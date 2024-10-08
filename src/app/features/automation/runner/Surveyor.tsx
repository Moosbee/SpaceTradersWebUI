import { Badge, Button, Card, Select, Space } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "../../../hooks";
import {
  selectShips,
  setShipCooldown,
} from "../../../spaceTraderAPI/redux/fleetSlice";
import {
  addSurveys,
  pruneSurveys,
} from "../../../spaceTraderAPI/redux/surveySlice";
import spaceTraderClient from "../../../spaceTraderAPI/spaceTraderClient";
import { store } from "../../../store";
import { message } from "../../../utils/antdMessage";

function Surveyor() {
  const ships = useAppSelector(selectShips);
  const [shipName, setShipName] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const action = useCallback(() => {
    if (!shipName) return;
    spaceTraderClient.FleetClient.createSurvey(shipName).then((value) => {
      console.log("value", value);
      store.dispatch(addSurveys(value.data.data.surveys));
      store.dispatch(pruneSurveys(Date.now()));
      store.dispatch(
        setShipCooldown({
          symbol: shipName,
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
  }, [shipName]);
  useEffect(() => {
    const bcc = new BroadcastChannel("EventWorkerChannel");
    console.log("bcc", bcc);
    bcc.addEventListener("message", (event) => {
      console.log("event", event);
      if (!running) return;
      action();
    });

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
            if (running) {
              action();
            }
          }}
        >
          {running ? "Stop" : "Start"}
        </Button>
      }
    >
      <Select
        style={{ width: 140 }}
        onChange={(value) => setShipName(value)}
        value={shipName}
        options={ships.map((w) => ({ label: w.symbol, value: w.symbol }))}
      />
    </Card>
  );
}

export default Surveyor;
