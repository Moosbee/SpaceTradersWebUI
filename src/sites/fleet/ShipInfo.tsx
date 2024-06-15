import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Ship, ShipCargoItem, System, SystemWaypoint } from "../../utils/api";
import spaceTraderClient from "../../utils/spaceTraderClient";
import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsProps,
  Flex,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  // Table,
  Tooltip,
  message,
} from "antd";

const { Countdown } = Statistic;

function ShipInfo() {
  const { shipID } = useParams();
  const [ship, setShip] = useState<Ship | undefined>(undefined);
  const [reload, setReload] = useState<boolean>(false);
  const [loadingShipNav, setLoadingShipNav] = useState<boolean>(false);

  const [navWaypoint, setNavWaypoint] = useState<string>();

  const [system, setSystem] = useState<System>({
    symbol: "",
    type: "WHITE_DWARF",
    x: 0,
    y: 0,
    waypoints: [],
    factions: [],
    sectorSymbol: "",
  });

  const wayPoint = system?.waypoints.find(
    (x) => x.symbol === ship?.nav.waypointSymbol
  );

  useEffect(() => {
    if (!shipID) return;
    spaceTraderClient.FleetClient.getMyShip(shipID).then((response) => {
      setShip(response.data.data);
      spaceTraderClient.LocalCache.getSystem(
        response.data.data.nav.systemSymbol
      ).then((response) => {
        setSystem(response);
      });
    });
  }, [shipID]);

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
    ship.cooldown.totalSeconds != ship.cooldown.remainingSeconds &&
    ship.cooldown.expiration
  ) {
    itemsGeneral.push({
      key: "cooldown",
      label: "Cooldown",
      children: (
        <span>
          <Countdown value={new Date(ship.cooldown.expiration).getTime()} /> /{" "}
          {ship.cooldown.totalSeconds}
        </span>
      ),
    });
  }

  itemsGeneral.push(
    ...[
      {
        key: "fuel",
        label: "Fuel",
        children: (
          <span>
            {ship.fuel.current}/{ship.fuel.capacity}
          </span>
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
    ]
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
  ];

  const itemsNav: DescriptionsProps["items"] = [
    {
      key: "navStatus",
      label: "Nav Status",
      children: (
        <Space>
          {ship.nav.status}
          {ship.nav.status == "DOCKED" && (
            <Button
              onClick={() => {
                if (!shipID) return;
                spaceTraderClient.FleetClient.orbitShip(shipID).then(
                  (value) => {
                    const shp = ship;
                    shp.nav = value.data.data.nav;
                    console.log("nav", value.data.data.nav);
                    setReload(!reload);
                    setShip(shp);
                  }
                );
              }}
            >
              Undock Ship
            </Button>
          )}
          {ship.nav.status == "IN_ORBIT" && (
            <Button
              onClick={() => {
                if (!shipID) return;
                spaceTraderClient.FleetClient.dockShip(shipID).then((value) => {
                  const shp = ship;
                  shp.nav = value.data.data.nav;
                  console.log("nav", value.data.data.nav, shp.nav);
                  setReload(!reload);
                  setShip(shp);
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
                const shp = ship;
                shp.nav = value.data.data;
                setShip(shp);
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
            {ship.nav.status == "IN_ORBIT" && (
              <>
                <Select
                  options={system.waypoints.map((w) => {
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
                        const shp = ship;
                        shp.nav = value.data.data.nav;

                        shp.fuel = value.data.data.fuel;
                        setReload(!reload);
                        setShip(shp);
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
            {wayPoint?.type == "JUMP_GATE" && ship.nav.status == "IN_ORBIT" && (
              <>
                <Select style={{ width: 100 }} />
                <Button>Jump Ship</Button>
              </>
            )}
          </Space>
          <br />
          {ship != undefined &&
            ship.nav.status == "IN_ORBIT" &&
            ship.modules.some(
              (m) =>
                m.symbol == "MODULE_WARP_DRIVE_I" ||
                m.symbol == "MODULE_WARP_DRIVE_II" ||
                m.symbol == "MODULE_WARP_DRIVE_III"
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
      span: ship.nav.status == "IN_ORBIT" ? 1 : 3,
    },
    ...(ship.nav.status == "IN_ORBIT"
      ? [
          {
            key: "extraction",
            label: "Extraction",
            children: (
              <Space>
                <Button
                  onClick={() => {
                    if (!shipID) return;
                    spaceTraderClient.FleetClient.extractResources(shipID).then(
                      (value) => {
                        console.log("value", value);
                        setTimeout(() => {
                          message.success(
                            `Extracted ${value.data.data.extraction.yield.units} ${value.data.data.extraction.yield.symbol}`
                          );
                          const shp = ship;
                          shp.cargo = value.data.data.cargo;
                          shp.cooldown = value.data.data.cooldown;
                          setReload(!reload);
                          setShip(shp);
                        });
                      }
                    );
                  }}
                >
                  Extract Resources
                </Button>
                <Button
                  onClick={() => {
                    if (!shipID) return;
                    spaceTraderClient.FleetClient.siphonResources(shipID).then(
                      (value) => {
                        console.log("value", value);
                        setTimeout(() => {
                          message.success(
                            `Siphoned ${value.data.data.siphon.yield.units} ${value.data.data.siphon.yield.symbol}`
                          );
                          const shp = ship;
                          shp.cargo = value.data.data.cargo;
                          shp.cooldown = value.data.data.cooldown;
                          setReload(!reload);
                          setShip(shp);
                        });
                      }
                    );
                  }}
                >
                  Siphon Resources
                </Button>
                <Button>Extract Resources with Survey</Button>
              </Space>
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
                          const shp = ship;
                          shp.cargo = value.data.data.cargo;
                          message.success(`${count} ${item} jettisoned`);
                          setReload(!reload);
                          setShip(shp);
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
                          const shp = ship;
                          shp.cargo = value.data.data.cargo;
                          message.success(
                            `${count} ${item} sold, new balance: ${value.data.data.agent.credits}`
                          );

                          setReload(!reload);
                          setShip(shp);
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
          {ship.frame.requirements.crew && (
            <>
              Crew: {ship.frame.requirements.crew}
              <br />
            </>
          )}
          {ship.frame.requirements.power && (
            <>
              Power: {ship.frame.requirements.power}
              <br />
            </>
          )}
          {ship.frame.requirements.slots && (
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
          {ship.engine.requirements.crew && (
            <>
              Crew: {ship.engine.requirements.crew}
              <br />
            </>
          )}
          {ship.engine.requirements.power && (
            <>
              Power: {ship.engine.requirements.power}
              <br />
            </>
          )}
          {ship.engine.requirements.slots && (
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
          {ship.reactor.requirements.crew && (
            <>
              Crew: {ship.reactor.requirements.crew}
              <br />
            </>
          )}
          {ship.reactor.requirements.power && (
            <>
              Power: {ship.reactor.requirements.power}
              <br />
            </>
          )}
          {ship.reactor.requirements.slots && (
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
      <Card style={{ width: "fit-content" }} title={`Ship ${ship.symbol}`}>
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
              <Button>Create Survey</Button>
              <Button>Transfer Cargo</Button>
              <Button>Scan Systems</Button>
              <Button>Scan Waypoints</Button>
              <Button>Scan Ships</Button>
              <Button>Refuel Ship</Button>
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
                          {value.requirements.crew && (
                            <span style={{ wordBreak: "keep-all" }}>
                              Crew:&nbsp;{value.requirements.crew}
                              <br />
                            </span>
                          )}
                          {value.requirements.power && (
                            <span style={{ wordBreak: "keep-all" }}>
                              Power:&nbsp;{value.requirements.power}
                              <br />
                            </span>
                          )}
                          {value.requirements.slots && (
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
                              )
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
                          {value.requirements.crew && (
                            <>
                              Crew:{value.requirements.crew}
                              <br />
                            </>
                          )}
                          {value.requirements.power && (
                            <>
                              Power:{value.requirements.power}
                              <br />
                            </>
                          )}
                          {value.requirements.slots && (
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

function CargoActions({
  item,
  onJettison,
  onSell,
}: {
  item: ShipCargoItem;
  onJettison: (count: number, item: string) => void;
  onSell: (count: number, item: string) => void;
}) {
  const [count, setCount] = useState(1);

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
    </Space>
  );
}

function WarpShip({ ship }: { ship: Ship }) {
  const [systems, setSystems] = useState<System[]>([]);
  const [system, setSystem] = useState<System | undefined>(undefined);

  const [waypoint, setWaypoint] = useState<SystemWaypoint | undefined>(
    undefined
  );

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
    spaceTraderClient.LocalCache.getSystems().then((data) => {
      setSystems(data);
      const info = data.find((w) => w.symbol === ship.nav.systemSymbol);
      setSystem(info);
      setWaypoint(
        info?.waypoints.find((w) => w.symbol === ship.nav.waypointSymbol)
      );
    });
  }, [ship.nav.systemSymbol, ship.nav.waypointSymbol]);

  return (
    <Space>
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
