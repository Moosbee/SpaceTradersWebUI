import {
  Button,
  Descriptions,
  Flex,
  message,
  Select,
  Space,
  Tooltip,
} from "antd";
import type { Ship, ShipMount, Survey } from "../../spaceTraderAPI/api";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { useState } from "react";
import {
  setShipCargo,
  setShipCooldown,
} from "../../spaceTraderAPI/redux/fleetSlice";
import {
  addSurveys,
  pruneSurveys,
  selectSurveys,
} from "../../spaceTraderAPI/redux/surveySlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";

function ShipMountInfo({ value, ship }: { value: ShipMount; ship: Ship }) {
  const dispatch = useAppDispatch();

  return (
    <Descriptions
      title="Mount Info"
      bordered
      key={value.symbol}
      items={[
        {
          key: "symbol",
          label: "Symbol",
          children: value.symbol,
        },
        {
          key: "name",
          label: "Name",
          children: value.name,
        },
        ...(value.strength
          ? [
              {
                key: "strength",
                label: "Strength",
                children: value.strength,
              },
            ]
          : []),
        {
          key: "actions",
          label: "Actions",
          children: (
            <>
              {ship.nav.status === "IN_ORBIT" && (
                <Flex vertical gap={4}>
                  <Space>
                    {(value.symbol === "MOUNT_SURVEYOR_I" ||
                      value.symbol === "MOUNT_SURVEYOR_II" ||
                      value.symbol === "MOUNT_SURVEYOR_III") && (
                      <Button
                        onClick={() => {
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
                          });
                        }}
                      >
                        Create Survey
                      </Button>
                    )}
                    {(value.symbol === "MOUNT_MINING_LASER_I" ||
                      value.symbol === "MOUNT_MINING_LASER_II" ||
                      value.symbol === "MOUNT_MINING_LASER_III" ||
                      value.symbol === "MOUNT_GAS_SIPHON_I" ||
                      value.symbol === "MOUNT_GAS_SIPHON_II" ||
                      value.symbol === "MOUNT_GAS_SIPHON_III") && (
                      <>
                        <ExtractSurvey
                          waypoint={ship.nav.waypointSymbol}
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
                                  resolve(
                                    value.data.data.cooldown.remainingSeconds,
                                  );
                                });
                              });
                            });
                          }}
                        ></ExtractSurvey>
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
                      </>
                    )}
                    {(value.symbol === "MOUNT_GAS_SIPHON_I" ||
                      value.symbol === "MOUNT_GAS_SIPHON_II" ||
                      value.symbol === "MOUNT_GAS_SIPHON_III") && (
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
                    )}
                  </Space>
                </Flex>
              )}
            </>
          ),
          span: 3,
        },
        {
          key: "description",
          label: "Description",
          children: value.description,
          span: 3,
        },

        {
          key: "requirements",
          label: "Requirements",
          children: (
            <span>
              {value.requirements.crew === undefined ? (
                ""
              ) : (
                <span style={{ wordBreak: "keep-all" }}>
                  Crew:&nbsp;{value.requirements.crew}
                  <br />
                </span>
              )}
              {value.requirements.power === undefined ? (
                ""
              ) : (
                <span style={{ wordBreak: "keep-all" }}>
                  Power:&nbsp;{value.requirements.power}
                  <br />
                </span>
              )}
              {value.requirements.slots === undefined ? (
                ""
              ) : (
                <span style={{ wordBreak: "keep-all" }}>
                  Slots:&nbsp;{value.requirements.slots}
                  <br />
                </span>
              )}
            </span>
          ),
        },
        ...(value.deposits
          ? [
              {
                key: "deposits",
                label: "Deposits",
                children: value.deposits?.map((value, index, array) => (
                  <span key={index}>
                    {" "}
                    {value}
                    {index < array.length - 1 ? "," : ""}
                  </span>
                )),
              },
            ]
          : []),
      ]}
      layout="horizontal"
    ></Descriptions>
  );
}

export function ExtractSurvey({
  waypoint,
  onExtraction,
}: {
  waypoint: string;
  onExtraction: (survey: Survey) => Promise<number>;
}) {
  const [survey, setSurvey] = useState<string | undefined>(undefined);

  const surveys = useAppSelector(selectSurveys);

  if (surveys.length === 0) {
    return null;
  }

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
          onExtraction(surveys.find((w) => w.signature === survey)!);
        }}
      >
        Extract Resources with Survey
      </Button>
    </Space>
  );
}

export default ShipMountInfo;
