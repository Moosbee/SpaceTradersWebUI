import type { DescriptionsProps } from "antd";
import {
  Space,
  Button,
  Select,
  Spin,
  Descriptions,
  Flex,
  Tooltip,
  Statistic,
} from "antd";
import { Link } from "react-router-dom";
import { setShipNav, setShipFuel } from "../../spaceTraderAPI/redux/fleetSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import type { Ship, System, SystemWaypoint } from "../../spaceTraderAPI/api";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { useEffect, useMemo, useState } from "react";
import {
  selectSystem,
  selectSystems,
} from "../../spaceTraderAPI/redux/systemSlice";
import { putSystemWaypoints } from "../../spaceTraderAPI/redux/waypointSlice";
import { putContract } from "../../spaceTraderAPI/redux/contractSlice";
import { selectAgentSymbol } from "../../spaceTraderAPI/redux/configSlice";

const { Countdown } = Statistic;

function ShipNavInfo({ ship }: { ship: Ship }) {
  const dispatch = useAppDispatch();
  const [loadingShipNav, setLoadingShipNav] = useState<boolean>(false);

  const [navWaypoint, setNavWaypoint] = useState<string>();

  const system = useAppSelector((state) =>
    selectSystem(state, ship.nav.systemSymbol),
  );

  const wayPoint = system?.waypoints.find(
    (x) => x.symbol === ship?.nav.waypointSymbol,
  );

  const agent = useAppSelector(selectAgentSymbol);

  const itemsNavMem = useMemo<DescriptionsProps["items"]>(() => {
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
                setLoadingShipNav(true);
                spaceTraderClient.FleetClient.patchShipNav(ship.symbol, {
                  flightMode: value,
                }).then((value) => {
                  dispatch(
                    setShipNav({ symbol: ship.symbol, nav: value.data.data }),
                  );
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
          <Space>
            <Link to={`/system/${ship.nav.systemSymbol}`}>
              {ship.nav.systemSymbol}
            </Link>
            <Button
              onClick={() => {
                spaceTraderClient.FleetClient.negotiateContract(
                  ship.symbol,
                ).then((value) => {
                  console.log("createChart", value.data.data);
                  if (!agent) return;
                  dispatch(
                    putContract({
                      contract: value.data.data.contract,
                      agentSymbol: agent,
                    }),
                  );
                });
              }}
            >
              Negotiate Contract
            </Button>
          </Space>
        ),
      },
      {
        key: "navWaypoint",
        label: "Nav Waypoint",
        children: (
          <Space>
            <Link
              to={`/system/${ship.nav.systemSymbol}/${ship.nav.waypointSymbol}`}
            >
              {ship.nav.waypointSymbol}
            </Link>
            <Button
              onClick={() => {
                spaceTraderClient.FleetClient.createChart(ship.symbol).then(
                  (value) => {
                    console.log("createChart", value.data.data);
                    dispatch(
                      putSystemWaypoints({
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
          </Space>
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
    ];
    if (ship.nav.status === "IN_ORBIT") {
      return itemsNav.concat([
        {
          key: "newRoute",
          label: "New Route",
          span: 2,

          children: (
            <Flex vertical gap={4}>
              <Space>
                {
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
                        if (!navWaypoint) return;
                        spaceTraderClient.FleetClient.navigateShip(
                          ship.symbol,
                          {
                            waypointSymbol: navWaypoint,
                          },
                        ).then((value) => {
                          console.log("value", value);
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
                      Navigate Ship
                    </Button>
                  </>
                }
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
      ]);
    }
    return itemsNav;
  }, [
    agent,
    dispatch,
    loadingShipNav,
    navWaypoint,
    ship,
    system?.waypoints,
    wayPoint?.type,
  ]);

  return (
    <Descriptions
      title="Nav Info"
      bordered
      items={itemsNavMem}
      column={2}
      layout="vertical"
    ></Descriptions>
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

export default ShipNavInfo;
