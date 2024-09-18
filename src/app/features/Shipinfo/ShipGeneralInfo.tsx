import type { DescriptionsProps } from "antd";
import { Space, Button, message, Statistic, Descriptions } from "antd";
import type { Ship } from "../../spaceTraderAPI/api";
import { setMyAgent } from "../../spaceTraderAPI/redux/agentSlice";
import { setShipFuel } from "../../spaceTraderAPI/redux/fleetSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import { useAppDispatch } from "../../hooks";

const { Countdown } = Statistic;

function ShipGeneralInfo({ ship }: { ship: Ship }) {
  const dispatch = useAppDispatch();

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

                  message.success(
                    `Refueled ${response.data.data.transaction.totalPrice} credits`,
                  );
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

  return (
    <Descriptions
      title="General Info"
      bordered
      items={itemsGeneral}
      layout="horizontal"
    ></Descriptions>
  );
}

export default ShipGeneralInfo;
