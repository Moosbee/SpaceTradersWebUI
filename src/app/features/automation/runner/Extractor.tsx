import {
  Badge,
  Button,
  Card,
  message,
  Select,
  Space,
  Switch,
  Tooltip,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import type { Ship } from "../../../spaceTraderAPI/api";
import {
  setShipCargo,
  setShipCooldown,
} from "../../../spaceTraderAPI/redux/fleetSlice";
import { selectSurveys } from "../../../spaceTraderAPI/redux/surveySlice";
import spaceTraderClient from "../../../spaceTraderAPI/spaceTraderClient";
import type { EventWorkerChannelData } from "../../../workers/eventWorker";

function Extractor({ ship }: { ship: Ship }) {
  const [running, setRunning] = useState(false);

  const [survey, setSurvey] = useState<string | undefined>(undefined);

  const surveys = useAppSelector(selectSurveys);

  const [type, setType] = useState<"siphon" | "extract">("extract");

  const [notify, setNotify] = useState(false);

  const dispatch = useAppDispatch();

  const action = useCallback(async () => {
    if (notify && ship.cargo.capacity === ship.cargo.units) {
      setRunning(false);
      new Notification("Extractor", {
        body: `Ship ${ship.symbol} is full`,
      });
      return;
    }
    if (type === "siphon") {
      const siphon = await spaceTraderClient.FleetClient.siphonResources(
        ship.symbol,
      );
      message.success(
        `Siphoned ${siphon.data.data.siphon.yield.units} ${siphon.data.data.siphon.yield.symbol}`,
      );
      dispatch(
        setShipCargo({
          symbol: ship.symbol,
          cargo: siphon.data.data.cargo,
        }),
      );
      dispatch(
        setShipCooldown({
          symbol: ship.symbol,
          cooldown: siphon.data.data.cooldown,
        }),
      );
      return;
    }
    const surveyI = surveys.find((w) => w.signature === survey);
    console.log("action", ship.symbol, survey, surveyI);
    const extract = surveyI
      ? await spaceTraderClient.FleetClient.extractResourcesWithSurvey(
          ship.symbol,
          surveyI,
        )
      : await spaceTraderClient.FleetClient.extractResources(ship.symbol);

    console.log("value", extract);
    await new Promise((resolve) => setTimeout(resolve, 0));
    message.success(
      `Extracted ${extract.data.data.extraction.yield.units} ${extract.data.data.extraction.yield.symbol}`,
    );
    dispatch(
      setShipCargo({
        symbol: ship.symbol,
        cargo: extract.data.data.cargo,
      }),
    );
    dispatch(
      setShipCooldown({
        symbol: ship.symbol,
        cooldown: extract.data.data.cooldown,
      }),
    );
  }, [
    dispatch,
    notify,
    ship.cargo.capacity,
    ship.cargo.units,
    ship.symbol,
    survey,
    surveys,
    type,
  ]);
  useEffect(() => {
    const bcc = new BroadcastChannel("EventWorkerChannel");
    bcc.addEventListener(
      "message",
      (event: MessageEvent<EventWorkerChannelData>) => {
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
        options={["siphon", "extract"].map((w) => {
          return {
            value: w,
            label: w,
          };
        })}
        showSearch
        style={{ width: 100 }}
        onChange={(value) => {
          setType(value);
        }}
        value={type}
      />
      <br />
      {type === "extract" && (
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
      )}
      <br />
      Notify and Shutdown on Storage Full:{" "}
      <Switch checked={notify} onChange={setNotify} />
    </Card>
  );
}

export default Extractor;
