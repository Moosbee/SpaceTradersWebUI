import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type {
  Ship,
  ShipCargoItem,
  Survey,
  System,
  SystemWaypoint,
} from "../../spaceTraderAPI/api";
import type { DescriptionsProps } from "antd";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Dropdown,
  Flex,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Switch,
  Table,
  Tooltip,
} from "antd";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  addSurveys,
  pruneSurveys,
  selectSurveys,
} from "../../spaceTraderAPI/redux/surveySlice";
import { message } from "../../utils/antdMessage";

import {
  putContract,
  selectOpenContracts,
} from "../../spaceTraderAPI/redux/contractSlice";
import {
  selectShip,
  setShipFuel,
  setShipNav,
  setShipCargo,
  setShipCooldown,
  selectShips,
  setShip,
} from "../../spaceTraderAPI/redux/fleetSlice";
import {
  selectSystem,
  selectSystems,
} from "../../spaceTraderAPI/redux/systemSlice";
import {
  selectMyAgent,
  setMyAgent,
} from "../../spaceTraderAPI/redux/agentSlice";

const { Countdown } = Statistic;

function ShipInfo() {
  const { shipID } = useParams();
  // const [ship, setShip] = useState<Ship | undefined>(undefined);
  const [loadingShipNav, setLoadingShipNav] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const ship = useAppSelector((state) => selectShip(state, shipID));
  const agent = useAppSelector(selectMyAgent);
  const system = useAppSelector((state) =>
    selectSystem(state, ship?.nav.systemSymbol),
  );

  const [navWaypoint, setNavWaypoint] = useState<string>();

  const wayPoint = system?.waypoints.find(
    (x) => x.symbol === ship?.nav.waypointSymbol,
  );

  if (!ship) return <Spin spinning={true} fullscreen></Spin>;
  const itemsGeneral: DescriptionsProps["items"] = [
    {
      key: "symbol",
      label: "Symbol",
      children: <span>{ship.symbol}</span>,
    },
    {
      key: "role",
      label: "Role",
      children: <span>{ship.registration.role}</span>,
    },
  ];
  if (
    ship.cooldown.totalSeconds !== ship.cooldown.remainingSeconds &&
    ship.cooldown.expiration
  ) {
    itemsGeneral.push({
      key: "cooldown",
      label: "Cooldown",
      children: (
        <Space>
          <Countdown value={new Date(ship.cooldown.expiration).getTime()} /> /
          {ship.cooldown.totalSeconds}
        </Space>
      ),
    });
  }

  itemsGeneral.push(
    ...[
      {
        key: "fuel",
        label: "Fuel",
        children: (
          <Space>
            {ship.fuel.current}/{ship.fuel.capacity}
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

                  message.success(`Refueled`);
                });
              }}
            >
              Refuel
            </Button>
          </Space>
        ),
      },
      {
        key: "crew",
        label: "Crew",
        children: (
          <span>
            {ship.crew.current} / {ship.crew.capacity} (min {ship.crew.required}
            )
          </span>
        ),
      },
      {
        key: "registration",
        label: "Registration",
        children: <span>{ship.registration.factionSymbol}</span>,
      },
    ],
  );

  const itemsNavRoute: DescriptionsProps["items"] = [
    {
      key: "routeOrigin",
      label: "Route Origin",
      children: (
        <Link
          to={`/system/${ship.nav.route.origin.systemSymbol}/${ship.nav.route.origin.symbol}`}
        >
          {ship.nav.route.origin.symbol}
        </Link>
      ),
    },
    {
      key: "routeDestination",
      label: "Route Destination",
      children: (
        <Link
          to={`/system/${ship.nav.route.destination.systemSymbol}/${ship.nav.route.destination.symbol}`}
        >
          {ship.nav.route.destination.symbol}
        </Link>
      ),
    },
    {
      key: "routeDeparture",
      label: "Route Departure",
      children: (
        <span>{new Date(ship.nav.route.departureTime).toLocaleString()}</span>
      ),
    },
    {
      key: "routeArrival",
      label: "Route Arrival",
      children: (
        <span>{new Date(ship.nav.route.arrival).toLocaleString()}</span>
      ),
    },
    ...(ship.nav.status === "IN_TRANSIT"
      ? [
          {
            key: "countDown",
            label: "Remaining Time",
            children: (
              <span>
                <Countdown
                  value={new Date(ship.nav.route.arrival).getTime()}
                ></Countdown>
              </span>
            ),
          },
        ]
      : []),
  ];

  const itemsNav: DescriptionsProps["items"] = [
    {
      key: "navStatus",
      label: "Nav Status",
      children: (
        <Space>
          {ship.nav.status}
          {ship.nav.status === "DOCKED" && (
            <Button
              onClick={() => {
                if (!shipID) return;
                spaceTraderClient.FleetClient.orbitShip(shipID).then(
                  (value) => {
                    dispatch(
                      setShipNav({ symbol: shipID, nav: value.data.data.nav }),
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
                if (!shipID) return;
                spaceTraderClient.FleetClient.dockShip(shipID).then((value) => {
                  dispatch(
                    setShipNav({ symbol: shipID, nav: value.data.data.nav }),
                  );
                  console.log("nav", value.data.data.nav);
                });
              }}
            >
              Dock Ship
            </Button>
          )}
        </Space>
      ),
    },
    {
      key: "flightMode",
      label: "Flight Mode",
      children: (
        <Space>
          <Select
            defaultValue={ship.nav.flightMode}
            style={{ width: 120 }}
            onChange={(value) => {
              if (!shipID) return;
              setLoadingShipNav(true);
              spaceTraderClient.FleetClient.patchShipNav(shipID, {
                flightMode: value,
              }).then((value) => {
                dispatch(setShipNav({ symbol: shipID, nav: value.data.data }));
                setLoadingShipNav(false);
              });
            }}
            options={[
              { value: "DRIFT" },
              { value: "STEALTH" },
              { value: "CRUISE" },
              { value: "BURN" },
            ]}
          />
          <Spin spinning={loadingShipNav}></Spin>
        </Space>
      ),
    },
    {
      key: "navSystem",
      label: "Nav System",
      children: (
        <Link to={`/system/${ship.nav.systemSymbol}`}>
          {ship.nav.systemSymbol}
        </Link>
      ),
    },
    {
      key: "navWaypoint",
      label: "Nav Waypoint",
      children: (
        <Link
          to={`/system/${ship.nav.systemSymbol}/${ship.nav.waypointSymbol}`}
        >
          {ship.nav.waypointSymbol}
        </Link>
      ),
    },
    {
      key: "route",
      label: "Route",
      span: 2,

      children: (
        <Descriptions
          bordered
          items={itemsNavRoute}
          layout="vertical"
          column={2}
        ></Descriptions>
      ),
    },
    {
      key: "newRoute",
      label: "New Route",
      span: 2,

      children: (
        <Flex vertical gap={4}>
          <Space>
            {ship.nav.status === "IN_ORBIT" && (
              <>
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
                  }}
                  value={navWaypoint}
                />
                <Button
                  onClick={() => {
                    console.log("Navigate Ship to", navWaypoint);
                    if (!shipID || !navWaypoint) return;
                    spaceTraderClient.FleetClient.navigateShip(shipID, {
                      waypointSymbol: navWaypoint,
                    }).then((value) => {
                      console.log("value", value);
                      setTimeout(() => {
                        dispatch(
                          setShipNav({
                            symbol: shipID,
                            nav: value.data.data.nav,
                          }),
                        );
                        dispatch(
                          setShipFuel({
                            symbol: shipID,
                            fuel: value.data.data.fuel,
                          }),
                        );
                      });
                    });
                  }}
                >
                  Navigate Ship
                </Button>
              </>
            )}
          </Space>
          <br />
          <Space>
            {wayPoint?.type === "JUMP_GATE" &&
              ship.nav.status === "IN_ORBIT" && (
                <>
                  <Select style={{ width: 100 }} />
                  <Button>Jump Ship</Button>
                </>
              )}
          </Space>
          <br />
          {ship !== undefined &&
            ship.nav.status === "IN_ORBIT" &&
            ship.modules.some(
              (m) =>
                m.symbol === "MODULE_WARP_DRIVE_I" ||
                m.symbol === "MODULE_WARP_DRIVE_II" ||
                m.symbol === "MODULE_WARP_DRIVE_III",
            ) && <WarpShip ship={ship} />}
        </Flex>
      ),
    },
  ];

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
                      if (!shipID) return;
                      spaceTraderClient.FleetClient.extractResources(
                        shipID,
                      ).then((value) => {
                        console.log("value", value);
                        setTimeout(() => {
                          message.success(
                            `Extracted ${value.data.data.extraction.yield.units} ${value.data.data.extraction.yield.symbol}`,
                          );
                          dispatch(
                            setShipCargo({
                              symbol: shipID,
                              cargo: value.data.data.cargo,
                            }),
                          );
                          dispatch(
                            setShipCooldown({
                              symbol: shipID,
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
                      if (!shipID) return;
                      spaceTraderClient.FleetClient.siphonResources(
                        shipID,
                      ).then((value) => {
                        console.log("value", value);
                        setTimeout(() => {
                          message.success(
                            `Siphoned ${value.data.data.siphon.yield.units} ${value.data.data.siphon.yield.symbol}`,
                          );
                          dispatch(
                            setShipCargo({
                              symbol: shipID,
                              cargo: value.data.data.cargo,
                            }),
                          );
                          dispatch(
                            setShipCooldown({
                              symbol: shipID,
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
                      if (!shipID) return;
                      spaceTraderClient.FleetClient.createSurvey(shipID).then(
                        (value) => {
                          console.log("value", value);
                          dispatch(addSurveys(value.data.data.surveys));
                          dispatch(pruneSurveys());
                          dispatch(
                            setShipCooldown({
                              symbol: shipID,
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
                        },
                      );
                    });
                  }}
                  onExtraction={(survey) => {
                    return new Promise((resolve) => {
                      if (!shipID) return;
                      spaceTraderClient.FleetClient.extractResourcesWithSurvey(
                        shipID,
                        survey,
                      ).then((value) => {
                        console.log("value", value);
                        setTimeout(() => {
                          message.success(
                            `Extracted ${value.data.data.extraction.yield.units} ${value.data.data.extraction.yield.symbol}`,
                          );
                          dispatch(
                            setShipCargo({
                              symbol: shipID,
                              cargo: value.data.data.cargo,
                            }),
                          );
                          dispatch(
                            setShipCooldown({
                              symbol: shipID,
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
                              agentSymbol: agent.symbol,
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
  const itemsFrame: DescriptionsProps["items"] = [
    {
      key: "symbol",
      label: "Symbol",
      children: <span>{ship.frame.symbol}</span>,
      span: 2,
    },
    {
      key: "description",
      label: "Description",
      children: <span>{ship.frame.description}</span>,
    },
    {
      key: "name",
      label: "Name",
      children: <span>{ship.frame.name}</span>,
    },
    {
      key: "fuelCapacity",
      label: "Fuel Capacity",
      children: <span>{ship.frame.fuelCapacity}</span>,
    },
    {
      key: "condition",
      label: "Condition",
      children: <span>{ship.frame.condition}/1</span>,
    },
    {
      key: "integrity",
      label: "Integrity",
      children: <span>{ship.frame.integrity}/1</span>,
    },
    {
      key: "moduleSlots",
      label: "Module Slots",
      children: <span>{ship.frame.moduleSlots}</span>,
    },
    {
      key: "mountingPoints",
      label: "Mounting Points",
      children: <span>{ship.frame.mountingPoints}</span>,
    },
    {
      key: "requirements",
      label: "Requirements",
      children: (
        <span>
          {ship.frame.requirements.crew === undefined ? (
            ""
          ) : (
            <>
              Crew: {ship.frame.requirements.crew}
              <br />
            </>
          )}
          {ship.frame.requirements.power === undefined ? (
            ""
          ) : (
            <>
              Power: {ship.frame.requirements.power}
              <br />
            </>
          )}
          {ship.frame.requirements.slots === undefined ? (
            ""
          ) : (
            <>
              Slots: {ship.frame.requirements.slots}
              <br />
            </>
          )}
        </span>
      ),
    },
  ];

  const itemsEngine: DescriptionsProps["items"] = [
    {
      key: "symbol",
      label: "Symbol",
      children: <span>{ship.engine.symbol}</span>,
      span: 2,
    },
    {
      key: "description",
      label: "Description",
      children: <span>{ship.engine.description}</span>,
    },
    {
      key: "name",
      label: "Name",
      children: <span>{ship.engine.name}</span>,
    },
    {
      key: "speed",
      label: "Speed",
      children: <span>{ship.engine.speed}</span>,
    },
    {
      key: "condition",
      label: "Condition",
      children: <span>{ship.engine.condition}/1</span>,
    },
    {
      key: "integrity",
      label: "Integrity",
      children: <span>{ship.engine.integrity}/1</span>,
    },
    {
      key: "requirements",
      label: "Requirements",
      children: (
        <span>
          {ship.engine.requirements.crew === undefined ? (
            ""
          ) : (
            <>
              Crew: {ship.engine.requirements.crew}
              <br />
            </>
          )}
          {ship.engine.requirements.power === undefined ? (
            ""
          ) : (
            <>
              Power: {ship.engine.requirements.power}
              <br />
            </>
          )}
          {ship.engine.requirements.slots === undefined ? (
            ""
          ) : (
            <>
              Slots: {ship.engine.requirements.slots}
              <br />
            </>
          )}
        </span>
      ),
    },
  ];

  const itemsReactor: DescriptionsProps["items"] = [
    {
      key: "symbol",
      label: "Symbol",
      children: <span>{ship.reactor.symbol}</span>,
    },
    {
      key: "name",
      label: "Name",
      children: <span>{ship.reactor.name}</span>,
    },
    {
      key: "description",
      label: "Description",
      children: <span>{ship.reactor.description}</span>,
    },
    {
      key: "powerOutput",
      label: "Power Output",
      children: <span>{ship.reactor.powerOutput}</span>,
    },
    {
      key: "condition",
      label: "Condition",
      children: <span>{ship.reactor.condition}/1</span>,
    },
    {
      key: "integrity",
      label: "Integrity",
      children: <span>{ship.reactor.integrity}/1</span>,
    },
    {
      key: "requirements",
      label: "Requirements",
      children: (
        <span>
          {ship.reactor.requirements.crew === undefined ? (
            ""
          ) : (
            <>
              Crew: {ship.reactor.requirements.crew}
              <br />
            </>
          )}
          {ship.reactor.requirements.power === undefined ? (
            ""
          ) : (
            <>
              Power: {ship.reactor.requirements.power}
              <br />
            </>
          )}
          {ship.reactor.requirements.slots === undefined ? (
            ""
          ) : (
            <>
              Slots: {ship.reactor.requirements.slots}
              <br />
            </>
          )}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Card
        style={{ width: "fit-content" }}
        title={`Ship ${ship.symbol}`}
        extra={
          <Button
            onClick={() => {
              if (!shipID) return;
              spaceTraderClient.FleetClient.getMyShip(shipID).then(
                (response) => {
                  dispatch(setShip(response.data.data));

                  dispatch(pruneSurveys());
                },
              );
            }}
          >
            Reload
          </Button>
        }
      >
        <Row gutter={[16, 16]} style={{ width: "100%" }}>
          <Col span={24}>
            <Descriptions
              title="General Info"
              bordered
              items={itemsGeneral}
              layout="horizontal"
            ></Descriptions>
          </Col>
          <Col span={24}>
            <Flex wrap gap={8}>
              <Button>Ship Refine</Button>
              <Button>Create Chart</Button>
              <Button>Scan Systems</Button>
              <Button>Scan Waypoints</Button>
              <Button>Scan Ships</Button>
              <Button>Purchase Cargo</Button>
              <Button>Negotiate Contract</Button>
              <Button>Install Mount</Button>
              <Button>Remove Mount</Button>
              <Button>Scrap Ship</Button>
              <Button>Repair Ship</Button>
            </Flex>
          </Col>
          <Col span={12}>
            <Descriptions
              title="Nav Info"
              bordered
              items={itemsNav}
              column={2}
              layout="vertical"
            ></Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions
              title="Cargo Info"
              bordered
              items={itemsCargo}
              layout="vertical"
            ></Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions
              title="Frame Info"
              bordered
              items={itemsFrame}
              layout="vertical"
            ></Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions
              title="Engine Info"
              bordered
              items={itemsEngine}
              layout="vertical"
            ></Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions
              title="Reactor Info"
              bordered
              items={itemsReactor}
              layout="vertical"
            ></Descriptions>
          </Col>
          <Col span={12}></Col>
          <Col span={12}>
            <Flex wrap>
              {ship.mounts.map((value) => (
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
                              Slots:&nbsp;{ship.reactor.requirements.slots}
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
                            children: value.deposits?.map(
                              (value, index, array) => (
                                <span key={index}>
                                  {" "}
                                  {value}
                                  {index < array.length - 1 ? "," : ""}
                                </span>
                              ),
                            ),
                          },
                        ]
                      : []),
                  ]}
                  layout="horizontal"
                ></Descriptions>
              ))}
            </Flex>
          </Col>
          <Col span={12}>
            <Flex wrap>
              {ship.modules.map((value, index) => (
                <Descriptions
                  title="Modules Info"
                  bordered
                  key={index}
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
                    {
                      key: "description",
                      label: "Description",
                      children: value.description,
                    },
                    ...(value.capacity
                      ? [
                          {
                            key: "capacity",
                            label: "Capacity",
                            children: value.capacity,
                          },
                        ]
                      : []),
                    ...(value.range
                      ? [
                          {
                            key: "range",
                            label: "Range",
                            children: value.range,
                          },
                        ]
                      : []),
                    {
                      key: "requirements",
                      label: "Requirements",
                      children: (
                        <span>
                          {value.requirements.crew === undefined ? (
                            ""
                          ) : (
                            <>
                              Crew:{value.requirements.crew}
                              <br />
                            </>
                          )}
                          {value.requirements.power === undefined ? (
                            ""
                          ) : (
                            <>
                              Power:{value.requirements.power}
                              <br />
                            </>
                          )}
                          {value.requirements.slots === undefined ? (
                            ""
                          ) : (
                            <>
                              Slots:{ship.reactor.requirements.slots}
                              <br />
                            </>
                          )}
                        </span>
                      ),
                    },
                  ]}
                  layout="vertical"
                ></Descriptions>
              ))}
            </Flex>
          </Col>
        </Row>
      </Card>
    </div>
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

function WarpShip({ ship }: { ship: Ship }) {
  const [system, setSystem] = useState<System | undefined>(undefined);

  const [waypoint, setWaypoint] = useState<SystemWaypoint | undefined>(
    undefined,
  );

  const systems = useAppSelector(selectSystems);

  function handleChangeSystem(value: string) {
    // console.log(`selected`, value);
    setSystem(systems.find((w) => w.symbol === value));
    setWaypoint(undefined);
  }

  function handleChangeWaypoint(value: string) {
    // console.log(`selectedWay`, value);
    const potWaypoint = system?.waypoints.find((w) => w.symbol === value);
    setWaypoint(potWaypoint);
  }

  useEffect(() => {
    const info = systems.find((w) => w.symbol === ship.nav.systemSymbol);
    setSystem(info);
    setWaypoint(
      info?.waypoints.find((w) => w.symbol === ship.nav.waypointSymbol),
    );
  }, [ship.nav.systemSymbol, ship.nav.waypointSymbol, systems]);

  const dispatch = useAppDispatch();

  return (
    <Space style={{ padding: "24px 24px" }}>
      <Select
        options={systems.map((w) => {
          return { value: w.symbol, label: w.symbol };
        })}
        onChange={handleChangeSystem}
        style={{ width: 100 }}
        value={system?.symbol}
        showSearch
      />
      <Select
        options={system?.waypoints.map((w) => {
          return { value: w.symbol, label: w.symbol };
        })}
        onChange={handleChangeWaypoint}
        value={waypoint?.symbol}
        style={{ width: 150 }}
        showSearch
      />
      <Button
        onClick={() => {
          if (system && waypoint) {
            spaceTraderClient.FleetClient.warpShip(ship.symbol, {
              waypointSymbol: waypoint.symbol,
            })
              .then((data) => {
                console.log("data", data);
                dispatch(
                  setShipFuel({
                    symbol: ship.symbol,
                    fuel: data.data.data.fuel,
                  }),
                );
                dispatch(
                  setShipNav({ symbol: ship.symbol, nav: data.data.data.nav }),
                );
              })
              .catch((err) => {
                console.log("err", err);
              });
          }
        }}
      >
        Warp Ship
      </Button>
    </Space>
  );
}

export default ShipInfo;
