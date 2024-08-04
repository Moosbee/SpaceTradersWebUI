import { Descriptions } from "antd";
import type { ShipModule } from "../../spaceTraderAPI/api";

function ShipModuleInfo({ value }: { value: ShipModule }) {
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
