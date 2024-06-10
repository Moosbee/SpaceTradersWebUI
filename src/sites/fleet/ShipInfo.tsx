import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Ship } from "../../components/api";
import spaceTraderClient from "../../spaceTraderClient";
import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsProps,
  Flex,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tooltip,
} from "antd";

function ShipInfo() {
  const { shipID } = useParams();
  const [ship, setShip] = useState<Ship | undefined>(undefined);
  const [reload, setReload] = useState<boolean>(false);
  const [loadingShipNav, setLoadingShipNav] = useState<boolean>(false);

  useEffect(() => {
    if (!shipID) return;
    spaceTraderClient.FleetClient.getMyShip(shipID).then((response) => {
      setShip(response.data.data);
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
  if (ship.cooldown.totalSeconds - ship.cooldown.remainingSeconds > 0) {
    itemsGeneral.push({
      key: "cooldown",
      label: "Cooldown",
      children: (
        <span>
          {ship.cooldown.remainingSeconds} / {ship.cooldown.totalSeconds}
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
      key: "routeDestination",
      label: "Route Destination",
      children: (
        <Link
          to={`/system/${ship.nav.route.destination.systemSymbol}/${ship.nav.route.destination.symbol}`}
        >
          {ship.nav.route.destination.symbol}
        </Link>
      ),
      span: 2,
    },
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
      span: 2,
    },
    {
      key: "routeArrival",
      label: "Route Arrival",
      children: (
        <span>{new Date(ship.nav.route.arrival).toLocaleString()}</span>
      ),
      span: 2,
    },
    {
      key: "routeDeparture",
      label: "Route Departure",
      children: (
        <span>{new Date(ship.nav.route.departureTime).toLocaleString()}</span>
      ),
      span: 2,
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
      span: 2,
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
      span: 2,
    },
    {
      key: "navSystem",
      label: "Nav System",
      children: (
        <Link to={`/system/${ship.nav.systemSymbol}`}>
          {ship.nav.systemSymbol}
        </Link>
      ),
      span: 2,
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
      span: 2,
    },
    {
      key: "route",
      label: "Route",
      children: (
        <Descriptions
          // title="Cargo Info"
          bordered
          items={itemsNavRoute}
          layout="vertical"
        ></Descriptions>
      ),
      span: 4,
    },
    {
      key: "newRoute",
      label: "New Route",
      children: (
        <Flex wrap gap={8}>
          <Button>Navigate Ship</Button>
          <Button>Jump Ship</Button>
          <Button>Warp Ship</Button>
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
      span: 3,
    },
    {
      key: "inventory",
      label: "Inventory",
      span: 3,

      children: (
        <Table
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              render(value, record) {
                return (
                  <Tooltip title={`${record.symbol} - ${record.description}`}>
                    <span>{value}</span>
                  </Tooltip>
                );
              },
            },
            { title: "Units", key: "units", dataIndex: "units" },
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
              <Button>Extract Resources</Button>
              <Button>Siphon Resources</Button>
              <Button>Extract Resources with Survey</Button>
              <Button>Jettison Cargo</Button>
              <Button>Sell Cargo</Button>
              <Button>Scan Systems</Button>
              <Button>Scan Waypoints</Button>
              <Button>Scan Ships</Button>
              <Button>Refuel Ship</Button>
              <Button>Purchase Cargo</Button>
              <Button>Transfer Cargo</Button>
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
                                <>
                                  {" "}
                                  {value}
                                  {index < array.length - 1 ? "," : ""}
                                </>
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
              {ship.modules.map((value) => (
                <Descriptions
                  title="Modules Info"
                  bordered
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

export default ShipInfo;
