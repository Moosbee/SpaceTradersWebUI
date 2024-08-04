import { Descriptions } from "antd";
import type { ShipMount } from "../../spaceTraderAPI/api";

function ShipMountInfo({ value }: { value: ShipMount }) {
  return (
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
                  Slots:&nbsp;{value.requirements.slots}
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
                children: value.deposits?.map((value, index, array) => (
                  <span key={index}>
                    {" "}
                    {value}
                    {index < array.length - 1 ? "," : ""}
                  </span>
                )),
              },
            ]
          : []),
      ]}
      layout="horizontal"
    ></Descriptions>
  );
}

export default ShipMountInfo;
