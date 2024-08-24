import { Button, Card, message, Select, Space, Statistic } from "antd";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import {
  selectSelectedShipSymbol,
  selectSelectedWaypointSymbol,
} from "../../../spaceTraderAPI/redux/mapSlice";
import {
  setShipNav,
  setShipFuel,
  selectShip,
  setShipCargo,
  setShipCooldown,
} from "../../../spaceTraderAPI/redux/fleetSlice";
import spaceTraderClient from "../../../spaceTraderAPI/spaceTraderClient";
import PageTitle from "../../../features/PageTitle";
import { ExtractSurvey } from "../../../features/Shipinfo/ShipMountInfo";

function WpConfig() {
  const dispatch = useAppDispatch();
  const shipSymbol = useAppSelector(selectSelectedShipSymbol);
  const waypointSymbol = useAppSelector(selectSelectedWaypointSymbol);
  // const systemSymbol = useAppSelector(selectSelectedSystemSymbol);
  const ship = useAppSelector((state) => selectShip(state, shipSymbol));

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title="Waypoint Configuration" />
      {ship && (
        <Card
          title="Ship Actions"
          extra={
            <span>
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
            </span>
          }
        >
          <Space>
            {waypointSymbol && ship.nav.status === "IN_ORBIT" && (
              <Button
                onClick={() => {
                  console.log(
                    "Navigate Ship to",
                    waypointSymbol.waypointSymbol,
                  );
                  if (!waypointSymbol) return;
                  spaceTraderClient.FleetClient.navigateShip(ship.symbol, {
                    waypointSymbol: waypointSymbol.waypointSymbol,
                  }).then((value) => {
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
                Navigate Ship to {waypointSymbol.waypointSymbol}
              </Button>
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
          <br />
          <br />
          <Space>
            {ship.mounts.some(
              (value) =>
                value.symbol === "MOUNT_MINING_LASER_I" ||
                value.symbol === "MOUNT_MINING_LASER_II" ||
                value.symbol === "MOUNT_MINING_LASER_III" ||
                value.symbol === "MOUNT_GAS_SIPHON_I" ||
                value.symbol === "MOUNT_GAS_SIPHON_II" ||
                value.symbol === "MOUNT_GAS_SIPHON_III",
            ) && (
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
                          resolve(value.data.data.cooldown.remainingSeconds);
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
          </Space>
        </Card>
      )}
    </div>
  );
}

export default WpConfig;
