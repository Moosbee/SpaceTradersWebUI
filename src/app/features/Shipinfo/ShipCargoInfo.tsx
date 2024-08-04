import type { DescriptionsProps } from "antd";
import {
  Flex,
  Space,
  Button,
  message,
  Table,
  Tooltip,
  Dropdown,
  InputNumber,
  Select,
  Switch,
  Descriptions,
} from "antd";
import {
  selectMyAgent,
  setMyAgent,
} from "../../spaceTraderAPI/redux/agentSlice";
import {
  putContract,
  selectOpenContracts,
} from "../../spaceTraderAPI/redux/contractSlice";
import {
  selectShips,
  setShipCargo,
  setShipCooldown,
} from "../../spaceTraderAPI/redux/fleetSlice";
import {
  addSurveys,
  pruneSurveys,
  selectSurveys,
} from "../../spaceTraderAPI/redux/surveySlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type { Ship, ShipCargoItem, Survey } from "../../spaceTraderAPI/api";
import { useState } from "react";

function ShipCargoInfo({ ship }: { ship: Ship }) {
  const dispatch = useAppDispatch();
  const myAgent = useAppSelector(selectMyAgent);

  const itemsCargo: DescriptionsProps["items"] = [
    {
      key: "cargo",
      label: "Cargo",
      children: (
        <span>
          {ship.cargo.units}/{ship.cargo.capacity}
        </span>
      ),
      span: ship.nav.status === "IN_ORBIT" ? 1 : 3,
    },
    ...(ship.nav.status === "IN_ORBIT"
      ? [
          {
            key: "extraction",
            label: "Extraction",
            children: (
              <Flex vertical gap={4}>
                <Space>
                  <Button
                    onClick={() => {
                      spaceTraderClient.FleetClient.extractResources(
                        ship.symbol,
                      ).then((value) => {
                        console.log("value", value);
                        setTimeout(() => {
                          message.success(
                            `Extracted ${value.data.data.extraction.yield.units} ${value.data.data.extraction.yield.symbol}`,
                          );
                          dispatch(
                            setShipCargo({
                              symbol: ship.symbol,
                              cargo: value.data.data.cargo,
                            }),
                          );
                          dispatch(
                            setShipCooldown({
                              symbol: ship.symbol,
                              cooldown: value.data.data.cooldown,
                            }),
                          );
                        });
                      });
                    }}
                  >
                    Extract Resources
                  </Button>
                  <Button
                    onClick={() => {
                      spaceTraderClient.FleetClient.siphonResources(
                        ship.symbol,
                      ).then((value) => {
                        console.log("value", value);
                        setTimeout(() => {
                          message.success(
                            `Siphoned ${value.data.data.siphon.yield.units} ${value.data.data.siphon.yield.symbol}`,
                          );
                          dispatch(
                            setShipCargo({
                              symbol: ship.symbol,
                              cargo: value.data.data.cargo,
                            }),
                          );
                          dispatch(
                            setShipCooldown({
                              symbol: ship.symbol,
                              cooldown: value.data.data.cooldown,
                            }),
                          );
                        });
                      });
                    }}
                  >
                    Siphon Resources
                  </Button>
                </Space>
                <ExtractSurvey
                  waypoint={ship.nav.waypointSymbol}
                  onSurvey={() => {
                    return new Promise((resolve) => {
                      spaceTraderClient.FleetClient.createSurvey(
                        ship.symbol,
                      ).then((value) => {
                        console.log("value", value);
                        dispatch(addSurveys(value.data.data.surveys));
                        dispatch(pruneSurveys());
                        dispatch(
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
                        resolve();
                      });
                    });
                  }}
                  onExtraction={(survey) => {
                    return new Promise((resolve) => {
                      spaceTraderClient.FleetClient.extractResourcesWithSurvey(
                        ship.symbol,
                        survey,
                      ).then((value) => {
                        console.log("value", value);
                        setTimeout(() => {
                          message.success(
                            `Extracted ${value.data.data.extraction.yield.units} ${value.data.data.extraction.yield.symbol}`,
                          );
                          dispatch(
                            setShipCargo({
                              symbol: ship.symbol,
                              cargo: value.data.data.cargo,
                            }),
                          );
                          dispatch(
                            setShipCooldown({
                              symbol: ship.symbol,
                              cooldown: value.data.data.cooldown,
                            }),
                          );
                          resolve(value.data.data.cooldown.remainingSeconds);
                        });
                      });
                    });
                  }}
                ></ExtractSurvey>
              </Flex>
            ),
            span: 2,
          },
        ]
      : []),
    {
      key: "inventory",
      label: "Inventory",
      span: 3,
      children: (
        <Table
          rowKey={(item) => item.symbol}
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              render(value, record) {
                return (
                  <Tooltip
                    key={record.symbol}
                    title={`${record.symbol} - ${record.description}`}
                  >
                    <span>{value}</span>
                  </Tooltip>
                );
              },
            },
            { title: "Units", key: "units", dataIndex: "units" },
            {
              title: "Action",
              key: "action",

              render(_value, record) {
                return (
                  <CargoActions
                    key={record.symbol}
                    item={record}
                    onJettison={(count, item) => {
                      console.log("Jettison", item, count);
                      spaceTraderClient.FleetClient.jettison(ship.symbol, {
                        symbol: record.symbol,
                        units: count,
                      }).then((value) => {
                        console.log("jett value", value);
                        setTimeout(() => {
                          message.success(`${count} ${item} jettisoned`);
                          dispatch(
                            setShipCargo({
                              symbol: ship.symbol,
                              cargo: value.data.data.cargo,
                            }),
                          );
                        });
                      });
                    }}
                    onSell={(count, item) => {
                      console.log("Sell", item, count);
                      spaceTraderClient.FleetClient.sellCargo(ship.symbol, {
                        symbol: record.symbol,
                        units: count,
                      }).then((value) => {
                        console.log("sell value", value);
                        setTimeout(() => {
                          message.success(
                            `${count} ${item} sold, new balance: ${value.data.data.agent.credits}`,
                          );
                          dispatch(
                            setShipCargo({
                              symbol: ship.symbol,
                              cargo: value.data.data.cargo,
                            }),
                          );
                          dispatch(setMyAgent(value.data.data.agent));
                        });
                      });
                    }}
                    onTransfer={(count, item, shipSymbol) => {
                      console.log("Transfer", item, count, shipSymbol);
                      spaceTraderClient.FleetClient.transferCargo(ship.symbol, {
                        shipSymbol,
                        tradeSymbol: record.symbol,
                        units: count,
                      }).then((value) => {
                        console.log("transfer value", value);
                        setTimeout(() => {
                          message.success(
                            `${count} ${item} transfered to ${shipSymbol}`,
                          );
                          dispatch(
                            setShipCargo({
                              symbol: ship.symbol,
                              cargo: value.data.data.cargo,
                            }),
                          );
                        });
                      });
                    }}
                    onFulfill={(count, item, contractID) => {
                      console.log("Deliver", item, count, contractID);
                      spaceTraderClient.ContractsClient.deliverContract(
                        contractID,
                        {
                          shipSymbol: ship.symbol,
                          tradeSymbol: record.symbol,
                          units: count,
                        },
                      ).then((value) => {
                        console.log("deliver value", value);
                        setTimeout(() => {
                          message.success(
                            `${count} ${item} delivered to ${contractID}`,
                          );
                          dispatch(
                            setShipCargo({
                              symbol: ship.symbol,
                              cargo: value.data.data.cargo,
                            }),
                          );
                          dispatch(
                            putContract({
                              contract: value.data.data.contract,
                              agentSymbol: myAgent.symbol,
                            }),
                          );
                        });
                      });
                    }}
                  ></CargoActions>
                );
              },
            },
          ]}
          dataSource={ship.cargo.inventory}
          // bordered
          size="small"
        />
      ),
    },
  ];

  return (
    <Descriptions
      title="Cargo Info"
      bordered
      items={itemsCargo}
      layout="vertical"
    ></Descriptions>
  );
}

function ExtractSurvey({
  waypoint,
  onSurvey,
  onExtraction,
}: {
  waypoint: string;
  onSurvey: () => Promise<void>;
  onExtraction: (survey: Survey) => Promise<number>;
}) {
  const [survey, setSurvey] = useState<string | undefined>(undefined);

  const surveys = useAppSelector(selectSurveys);

  const [contin, setContin] = useState(false);

  const extract = async () => {
    if (!survey) {
      return;
    }
    onExtraction(surveys.find((w) => w.signature === survey)!).then((ret) => {
      if (contin) {
        setTimeout(
          () => {
            extract();
          },
          ret * 1000 + 1000,
        );
      }
    });
  };

  return (
    <Space>
      <Select
        options={surveys
          .filter((w) => w.symbol === waypoint)
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
      <Button
        onClick={() => {
          extract();
        }}
      >
        Extract Resources with Survey
      </Button>
      <Button onClick={onSurvey}>Create Survey</Button>
      <Switch
        checkedChildren="continue"
        unCheckedChildren="continue"
        checked={contin}
        onChange={setContin}
      />
    </Space>
  );
}

function CargoActions({
  item,
  onJettison,
  onSell,
  onTransfer,
  onFulfill,
}: {
  item: ShipCargoItem;
  onJettison: (count: number, item: string) => void;
  onSell: (count: number, item: string) => void;
  onTransfer: (count: number, item: string, shipSymbol: string) => void;
  onFulfill: (count: number, item: string, contractID: string) => void;
}) {
  const [count, setCount] = useState(1);
  const agent = useAppSelector(selectMyAgent);

  const items = useAppSelector(selectShips).map((w) => {
    return {
      key: w.symbol,
      label: w.symbol,
    };
  });

  const contracts = useAppSelector(selectOpenContracts)
    .filter((w) => w.agentSymbol === agent.symbol)
    .map((w) => {
      return {
        key: w.contract.id,
        label: w.contract.id,
      };
    });

  return (
    <Space>
      <InputNumber
        min={1}
        max={item.units}
        defaultValue={1}
        style={{ width: 60 }}
        onChange={(value) => setCount(value?.valueOf() ?? 1)}
        value={count}
      />
      <Button onClick={() => onJettison(count, item.symbol)}>Jettison</Button>
      <Button onClick={() => onSell(count, item.symbol)}>Sell</Button>
      <Dropdown
        menu={{
          items,
          onClick: ({ key }) => {
            onTransfer(count, item.symbol, key);
          },
        }}
        trigger={["click"]}
      >
        <Button>Transfer</Button>
      </Dropdown>
      <Dropdown
        menu={{
          items: contracts,
          onClick: ({ key }) => {
            onFulfill(count, item.symbol, key);
          },
        }}
        trigger={["click"]}
      >
        <Button>Fulfill Contr.</Button>
      </Dropdown>
    </Space>
  );
}

export default ShipCargoInfo;
