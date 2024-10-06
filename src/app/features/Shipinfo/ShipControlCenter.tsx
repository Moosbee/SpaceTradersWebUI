import {
  Button,
  Card,
  Flex,
  Input,
  Select,
  Space,
  Statistic,
  Tooltip,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type { Ship } from "../../spaceTraderAPI/api";
import { setMyAgent } from "../../spaceTraderAPI/redux/agentSlice";
import { selectAgentSymbol } from "../../spaceTraderAPI/redux/configSlice";
import { putContract } from "../../spaceTraderAPI/redux/contractSlice";
import {
  setShipCargo,
  setShipCooldown,
  setShipFuel,
  setShipNav,
} from "../../spaceTraderAPI/redux/fleetSlice";
import {
  addSurveys,
  pruneSurveys,
} from "../../spaceTraderAPI/redux/surveySlice";
import { selectSystem } from "../../spaceTraderAPI/redux/systemSlice";
import { addMarketTransaction } from "../../spaceTraderAPI/redux/tansactionSlice";
import { putWaypoints } from "../../spaceTraderAPI/redux/waypointSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import { ExtractSurvey } from "./ShipMountInfo";

function ShipControlCenter({
  ship,
  toGoWaypoint,
}: {
  ship: Ship;
  toGoWaypoint?: {
    systemSymbol: string;
    waypointSymbol: string;
  };
}) {
  const dispatch = useAppDispatch();

  const [selected, setSelected] = useState<boolean>(false);

  const [navWaypoint, setNavWaypoint] = useState<string>(
    toGoWaypoint?.waypointSymbol ?? "",
  );

  useEffect(() => {
    if (!toGoWaypoint || selected) {
      return;
    }
    setNavWaypoint(toGoWaypoint.waypointSymbol);
  }, [selected, toGoWaypoint, toGoWaypoint?.waypointSymbol]);

  const system = useAppSelector((state) =>
    selectSystem(state, ship.nav.systemSymbol),
  );

  const wayPoint = system?.waypoints.find(
    (x) => x.symbol === ship?.nav.waypointSymbol,
  );

  const agent = useAppSelector(selectAgentSymbol);

  const [jumpDestination, setJumpDestination] = useState<string>();

  return (
    <Card
      title={`${ship.symbol} Ship Actions`}
      extra={
        <Space>
          {ship.cooldown.totalSeconds !== ship.cooldown.remainingSeconds &&
            ship.cooldown.expiration && (
              <Statistic.Countdown
                title="Cooldown"
                value={new Date(ship.cooldown.expiration).getTime()}
              />
            )}
          {ship.nav.status === "IN_TRANSIT" && ship.nav.route.arrival && (
            <Statistic.Countdown
              title="Arrival"
              value={new Date(ship.nav.route.arrival).getTime()}
            />
          )}
        </Space>
      }
      style={{ width: "fit-content" }}
    >
      <Flex justify="space-between" align="middle" vertical gap={8}>
        <Space size="large">
          <span>General</span>
          <Button
            onClick={() => {
              spaceTraderClient.FleetClient.negotiateContract(ship.symbol).then(
                (value) => {
                  console.log("Contract Negotiation", value.data.data);
                  if (!agent) return;
                  dispatch(
                    putContract({
                      contract: value.data.data.contract,
                      agentSymbol: agent,
                    }),
                  );
                  message.success(
                    `Contract Negotiated ${value.data.data.contract.id}`,
                  );
                },
              );
            }}
          >
            Negotiate Contract
          </Button>
          <Button
            onClick={() => {
              spaceTraderClient.FleetClient.createChart(ship.symbol).then(
                (value) => {
                  console.log("createChart", value.data.data);
                  dispatch(
                    putWaypoints({
                      systemSymbol: value.data.data.waypoint.systemSymbol,
                      waypoints: [value.data.data.waypoint],
                    }),
                  );
                },
              );
            }}
          >
            Chart Waypoint
          </Button>
          {ship.nav.status === "DOCKED" && (
            <Button
              onClick={() => {
                spaceTraderClient.FleetClient.refuelShip(ship.symbol, {
                  fromCargo: false,
                  units: ship.fuel.capacity - ship.fuel.current,
                }).then((response) => {
                  dispatch(
                    setShipFuel({
                      symbol: ship.symbol,
                      fuel: response.data.data.fuel,
                    }),
                  );
                  dispatch(setMyAgent(response.data.data.agent));
                  dispatch(
                    addMarketTransaction(response.data.data.transaction),
                  );

                  message.success(
                    `Refueled ${response.data.data.transaction.totalPrice} credits`,
                  );
                });
              }}
            >
              Refuel
            </Button>
          )}
        </Space>
        <Space size="large">
          <span>Navigate</span>

          {ship.nav.status === "IN_ORBIT" && (
            <Space>
              <Select
                options={system?.waypoints.map((w) => {
                  return {
                    value: w.symbol,
                    label: <Tooltip title={w.type}>{w.symbol}</Tooltip>,
                  };
                })}
                showSearch
                style={{ width: 130 }}
                onChange={(value) => {
                  setNavWaypoint(value);
                  setSelected(true);
                }}
                value={navWaypoint}
                allowClear
                onClear={() => {
                  setTimeout(() => {
                    setSelected(false);
                    if (!toGoWaypoint) return;
                    setNavWaypoint(toGoWaypoint.waypointSymbol);
                  });
                }}
              />
              <Button
                onClick={() => {
                  console.log("Navigate Ship to", navWaypoint);
                  if (!navWaypoint) return;
                  spaceTraderClient.FleetClient.navigateShip(ship.symbol, {
                    waypointSymbol: navWaypoint,
                  }).then((value) => {
                    console.log("value", value);
                    setSelected(false);
                    setTimeout(() => {
                      dispatch(
                        setShipNav({
                          symbol: ship.symbol,
                          nav: value.data.data.nav,
                        }),
                      );
                      dispatch(
                        setShipFuel({
                          symbol: ship.symbol,
                          fuel: value.data.data.fuel,
                        }),
                      );
                    });
                  });
                }}
              >
                Navigate Ship to {navWaypoint}
              </Button>
            </Space>
          )}
          {wayPoint?.type === "JUMP_GATE" && ship.nav.status === "IN_ORBIT" && (
            <>
              {/* <Select style={{ width: 100 }} /> */}
              <Input
                placeholder="Jump"
                style={{ width: 100 }}
                value={jumpDestination}
                onChange={(e) => setJumpDestination(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (!jumpDestination) return;
                  spaceTraderClient.FleetClient.jumpShip(ship.symbol, {
                    waypointSymbol: jumpDestination,
                  }).then((value) => {
                    setTimeout(() => {
                      dispatch(
                        setShipNav({
                          symbol: ship.symbol,
                          nav: value.data.data.nav,
                        }),
                      );
                      dispatch(
                        setShipCooldown({
                          symbol: ship.symbol,
                          cooldown: value.data.data.cooldown,
                        }),
                      );
                      dispatch(setMyAgent(value.data.data.agent));
                      dispatch(
                        addMarketTransaction(value.data.data.transaction),
                      );
                    });
                  });
                }}
              >
                Jump Ship
              </Button>
            </>
          )}
          {ship.nav.status === "DOCKED" && (
            <Button
              onClick={() => {
                spaceTraderClient.FleetClient.orbitShip(ship.symbol).then(
                  (value) => {
                    dispatch(
                      setShipNav({
                        symbol: ship.symbol,
                        nav: value.data.data.nav,
                      }),
                    );
                    console.log("nav", value.data.data.nav);
                  },
                );
              }}
            >
              Undock Ship
            </Button>
          )}
          {ship.nav.status === "IN_ORBIT" && (
            <Button
              onClick={() => {
                spaceTraderClient.FleetClient.dockShip(ship.symbol).then(
                  (value) => {
                    dispatch(
                      setShipNav({
                        symbol: ship.symbol,
                        nav: value.data.data.nav,
                      }),
                    );
                    console.log("nav", value.data.data.nav);
                  },
                );
              }}
            >
              Dock Ship
            </Button>
          )}
          <Select
            defaultValue={ship.nav.flightMode}
            style={{ width: 120 }}
            onChange={(value) => {
              spaceTraderClient.FleetClient.patchShipNav(ship.symbol, {
                flightMode: value,
              }).then((value) => {
                dispatch(
                  setShipNav({ symbol: ship.symbol, nav: value.data.data }),
                );
              });
            }}
            options={[
              { value: "DRIFT" },
              { value: "STEALTH" },
              { value: "CRUISE" },
              { value: "BURN" },
            ]}
          />
        </Space>
        <Space size="large">
          <span>Mining</span>

          {ship.mounts.some(
            (value) =>
              value.symbol === "MOUNT_SURVEYOR_I" ||
              value.symbol === "MOUNT_SURVEYOR_II" ||
              value.symbol === "MOUNT_SURVEYOR_III",
          ) && (
            <Button
              onClick={() => {
                spaceTraderClient.FleetClient.createSurvey(ship.symbol).then(
                  (value) => {
                    console.log("value", value);
                    dispatch(addSurveys(value.data.data.surveys));
                    dispatch(pruneSurveys(Date.now()));
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
                  },
                );
              }}
            >
              Create Survey
            </Button>
          )}
          {ship.mounts.some(
            (value) =>
              value.symbol === "MOUNT_MINING_LASER_I" ||
              value.symbol === "MOUNT_MINING_LASER_II" ||
              value.symbol === "MOUNT_MINING_LASER_III",
          ) && (
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
          )}
          {ship.mounts.some(
            (value) =>
              value.symbol === "MOUNT_GAS_SIPHON_I" ||
              value.symbol === "MOUNT_GAS_SIPHON_II" ||
              value.symbol === "MOUNT_GAS_SIPHON_III",
          ) && (
            <Button
              onClick={() => {
                spaceTraderClient.FleetClient.siphonResources(ship.symbol).then(
                  (value) => {
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
                  },
                );
              }}
            >
              Siphon Resources
            </Button>
          )}
        </Space>
        <Space size="large">
          {ship.mounts.some(
            (value) =>
              value.symbol === "MOUNT_MINING_LASER_I" ||
              value.symbol === "MOUNT_MINING_LASER_II" ||
              value.symbol === "MOUNT_MINING_LASER_III",
          ) && (
            <>
              <span>Mining</span>

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
                        resolve(value.data.data.cooldown.remainingSeconds);
                      });
                    });
                  });
                }}
              ></ExtractSurvey>
            </>
          )}
        </Space>
      </Flex>
    </Card>
  );
}

export default ShipControlCenter;
