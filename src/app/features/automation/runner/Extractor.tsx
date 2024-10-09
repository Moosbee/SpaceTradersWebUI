import { Badge, Button, Card, message, Select, Space, Tooltip } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import {
  selectShip,
  selectShips,
  setShipCargo,
  setShipCooldown,
} from "../../../spaceTraderAPI/redux/fleetSlice";
import { selectSurveys } from "../../../spaceTraderAPI/redux/surveySlice";
import spaceTraderClient from "../../../spaceTraderAPI/spaceTraderClient";
import type { EventWorkerChannelData } from "../../../workers/eventWorker";

function Extractor() {
  const ships = useAppSelector(selectShips);
  const [shipName, setShipName] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const ship = useAppSelector((state) => selectShip(state, shipName ?? ""));

  const [survey, setSurvey] = useState<string | undefined>(undefined);

  const surveys = useAppSelector(selectSurveys);

  const dispatch = useAppDispatch();

  const action = useCallback(() => {
    if (!shipName || !survey) return;
    const surveyI = surveys.find((w) => w.signature === survey);
    console.log("action", shipName, survey, surveyI);
    if (!surveyI) return;
    spaceTraderClient.FleetClient.extractResourcesWithSurvey(
      shipName,
      surveyI,
    ).then((value) => {
      console.log("value", value);
      setTimeout(() => {
        message.success(
          `Extracted ${value.data.data.extraction.yield.units} ${value.data.data.extraction.yield.symbol}`,
        );
        dispatch(
          setShipCargo({
            symbol: shipName,
            cargo: value.data.data.cargo,
          }),
        );
        dispatch(
          setShipCooldown({
            symbol: shipName,
            cooldown: value.data.data.cooldown,
          }),
        );
      });
    });
  }, [dispatch, shipName, survey, surveys]);
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
          Extractor
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
    >
      <Select
        style={{ width: 140 }}
        onChange={(value) => setShipName(value)}
        value={shipName}
        options={ships.map((w) => ({ label: w.symbol, value: w.symbol }))}
      />
      <Select
        options={surveys
          .filter((w) => w.symbol === ship?.nav.waypointSymbol)
          .map((w) => {
            return {
              value: w.signature,
              label: (
                <Tooltip
                  title={`${w.signature} - (${w.deposits
                    ?.map((w) => w.symbol)
                    .join(", ")})`}
                >
                  {w.signature}
                </Tooltip>
              ),
            };
          })}
        showSearch
        style={{ width: 180 }}
        onChange={(value) => {
          setSurvey(value);
        }}
        value={survey}
      />
    </Card>
  );
}

export default Extractor;
