import { DeleteOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Divider,
  InputNumber,
  Select,
  Space,
  Switch,
  Table,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import type { Ship } from "../../../spaceTraderAPI/api";
import { TradeSymbol } from "../../../spaceTraderAPI/api";
import { setShipCooldown } from "../../../spaceTraderAPI/redux/fleetSlice";
import {
  addSurveys,
  pruneSurveys,
} from "../../../spaceTraderAPI/redux/surveySlice";
import spaceTraderClient from "../../../spaceTraderAPI/spaceTraderClient";
import { store } from "../../../store";
import { message } from "../../../utils/antdMessage";
import type { EventWorkerChannelData } from "../../../workers/eventWorker";

function calcRatios(deposits: Array<{ symbol: string }>): {
  [key in TradeSymbol]?: number;
} {
  const total = deposits.length;

  const depositsKeyed: { [key in TradeSymbol]?: number } = {};

  for (const { symbol } of deposits) {
    const w = symbol as TradeSymbol;

    depositsKeyed[w] = (depositsKeyed[w] ?? 0) + 1;
  }

  for (const w in depositsKeyed) {
    depositsKeyed[w as TradeSymbol] =
      ((depositsKeyed[w as TradeSymbol] ?? 0) / total) * 100;
  }

  return depositsKeyed;
}

function Surveyor({ ship }: { ship: Ship }) {
  const [running, setRunning] = useState(false);
  const [target, setTarget] = useState<{
    [key in TradeSymbol]?: number;
  }>({});
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
      for (const survey of value.data.data.surveys) {
        const odds = calcRatios(survey.deposits);

        message.success(
          `Survey Created ${survey.signature} - (${Object.entries(odds)
            .map(([key, value]) => {
              return `${key}: ${value.toFixed(2)}`;
            })
            .join(", ")})`,
        );

        let completed = true;
        for (const w in target) {
          const symbol = w as TradeSymbol;
          const num = target[symbol];
          if (num && (odds[symbol] ?? 0) < num) {
            completed = false;
          }
        }
        if (completed) {
          setRunning(false);
          new Notification("Surveyor", {
            body: `Survey Found ${survey.signature} - (${Object.entries(odds)
              .map(([key, value]) => {
                return `${key}: ${value.toFixed(2)}`;
              })
              .join(", ")})`,
          });
        }
      }
    });
  }, [ship.symbol, target]);
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

  const [notify, setNotify] = useState(false);

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
    >
      <Space>
        <span>Notify on completion:</span>
        <Switch
          checked={notify}
          onChange={(value) => {
            setNotify(value);
          }}
        />
        <Button
          onClick={() =>
            setTarget({
              ...target,
              [TradeSymbol.AdvancedCircuitry]: 10,
            })
          }
        >
          Add Targets
        </Button>
      </Space>
      <Divider></Divider>
      <Table
        dataSource={Object.keys(target).map((w) => ({
          symbol: w,
          percentage: target[w as TradeSymbol] ?? 0,
          delete: w,
        }))}
        rowKey={(symbol) => symbol.symbol}
        columns={[
          {
            title: "Symbol",
            dataIndex: "symbol",
            key: "symbol",
            render: (symbol) => (
              <Select
                style={{ width: 160 }}
                onChange={(value) => {
                  const newTarget = {
                    ...target,
                    [value]: target[symbol as TradeSymbol] ?? 0,
                  };
                  delete newTarget[symbol as TradeSymbol];
                  setTarget(newTarget);
                }}
                value={symbol}
                options={Object.values(TradeSymbol).map((w) => ({
                  label: w,
                  value: w,
                }))}
              ></Select>
            ),
          },
          {
            title: "Percentage",
            dataIndex: "percentage",
            key: "percentage",
            render: (percentage, { symbol }) => (
              <InputNumber
                value={percentage}
                min={0}
                max={100}
                style={{ width: 70 }}
                changeOnWheel
                formatter={(value) => `${value}%`}
                parser={(value) => value?.replace("%", "") as unknown as number}
                onChange={(value) => {
                  setTarget({
                    ...target,
                    [symbol]: value,
                  });
                }}
              />
            ),
          },
          {
            title: "Delete",
            dataIndex: "delete",
            key: "delete",
            render: (_symbol, { symbol }) => (
              <Button
                onClick={() => {
                  const newTarget = {
                    ...target,
                  };
                  delete newTarget[symbol as TradeSymbol];
                  setTarget(newTarget);
                }}
                danger
              >
                <DeleteOutlined />
              </Button>
            ),
          },
        ]}
      />
    </Card>
  );
}

export default Surveyor;
