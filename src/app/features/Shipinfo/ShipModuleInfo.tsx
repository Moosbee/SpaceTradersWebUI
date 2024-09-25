import { Button, Descriptions, Flex, Select, Space } from "antd";
import { useState } from "react";
import { useAppDispatch } from "../../hooks";
import type {
  Ship,
  ShipModule,
  ShipRefineRequestProduceEnum,
} from "../../spaceTraderAPI/api";
import {
  setShipCargo,
  setShipCooldown,
} from "../../spaceTraderAPI/redux/fleetSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import { message } from "../../utils/antdMessage";

function ShipModuleInfo({ value, ship }: { value: ShipModule; ship: Ship }) {
  const dispatch = useAppDispatch();
  const [refineType, setRefineType] =
    useState<ShipRefineRequestProduceEnum>("FUEL");

  return (
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
        {
          key: "actions",
          label: "Actions",
          children: (
            <Flex vertical gap={4}>
              {value.symbol === "MODULE_FUEL_REFINERY_I" ||
              value.symbol === "MODULE_ORE_REFINERY_I" ||
              value.symbol === "MODULE_MICRO_REFINERY_I" ? (
                <Space>
                  <Select
                    style={{ width: 120 }}
                    options={[
                      { value: "IRON" },
                      { value: "COPPER" },
                      { value: "SILVER" },
                      { value: "GOLD" },
                      { value: "ALUMINUM" },
                      { value: "PLATINUM" },
                      { value: "URANITE" },
                      { value: "MERITIUM" },
                      { value: "FUEL" },
                    ]}
                    value={refineType}
                    onChange={(value) => setRefineType(value)}
                  />
                  <Button
                    onClick={() => {
                      spaceTraderClient.FleetClient.shipRefine(ship.symbol, {
                        produce: refineType,
                      }).then((response) => {
                        dispatch(
                          setShipCargo({
                            symbol: ship.symbol,
                            cargo: response.data.data.cargo,
                          }),
                        );
                        dispatch(
                          setShipCooldown({
                            symbol: ship.symbol,
                            cooldown: response.data.data.cooldown,
                          }),
                        );
                        message.success(
                          `Refined ${response.data.data.consumed.length} items into ${response.data.data.produced.length} items`,
                        );
                        console.log("Refine", response);
                      });
                    }}
                  >
                    Refine
                  </Button>
                </Space>
              ) : (
                ""
              )}
            </Flex>
          ),
          span: 3,
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
                  Slots:{value.requirements.slots}
                  <br />
                </>
              )}
            </span>
          ),
        },
      ]}
      layout="vertical"
    ></Descriptions>
  );
}

export default ShipModuleInfo;
