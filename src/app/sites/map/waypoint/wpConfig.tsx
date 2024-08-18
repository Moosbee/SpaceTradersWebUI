import { Button, Card, Select, Space, Statistic } from "antd";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import {
  selectSelectedShipSymbol,
  selectSelectedWaypointSymbol,
  selectSelectedSystemSymbol,
} from "../../../spaceTraderAPI/redux/mapSlice";
import {
  setShipNav,
  setShipFuel,
  selectShip,
} from "../../../spaceTraderAPI/redux/fleetSlice";
import spaceTraderClient from "../../../spaceTraderAPI/spaceTraderClient";
import PageTitle from "../../../features/PageTitle";

function WpConfig() {
  const dispatch = useAppDispatch();
  const shipSymbol = useAppSelector(selectSelectedShipSymbol);
  const waypointSymbol = useAppSelector(selectSelectedWaypointSymbol);
  const systemSymbol = useAppSelector(selectSelectedSystemSymbol);
  const ship = useAppSelector((state) => selectShip(state, shipSymbol));

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title="Waypoint Configuration" />
      {ship && (
        <Card
          title="Ship Actions"
          extra={
            ship.cooldown.totalSeconds !== ship.cooldown.remainingSeconds &&
            ship.cooldown.expiration && (
              <Statistic.Countdown
                value={new Date(ship.cooldown.expiration).getTime()}
              />
            )
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
        </Card>
      )}
    </div>
  );
}

export default WpConfig;
