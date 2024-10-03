import type { SelectProps } from "antd";
import { AutoComplete, Card, Select, Space, Typography } from "antd";
import type {
  MarketTradeGoodTypeEnum,
  WaypointType,
} from "../../spaceTraderAPI/api";
import {
  ShipType,
  TradeSymbol,
  WaypointTraitSymbol,
} from "../../spaceTraderAPI/api";
import type { WaypointState } from "../../spaceTraderAPI/redux/waypointSlice";

const traitsOptions: SelectProps["options"] = Object.values(
  WaypointTraitSymbol,
).map((value) => {
  return { value: value };
});

const tradeGoodOptions: SelectProps["options"] = Object.values(TradeSymbol).map(
  (value) => {
    return { value: value };
  },
);

const shipTypeOptions: SelectProps["options"] = Object.values(ShipType).map(
  (value) => {
    return { value: value };
  },
);

const { Title } = Typography;

function FilterCard({
  waypoints,
  searchType,
  setSearchType,
  searchTraits,
  setSearchTraits,
  searchAutoComplete,
  setSearchAutoComplete,
  marketItems,
  setMarketItems,
  marketItemTypes,
  setMarketItemTypes,
  shipTypes,
  setShipTypes,
}: {
  waypoints: WaypointState[];
  searchType: WaypointType | undefined;
  setSearchType: (value: WaypointType) => void;
  searchTraits: WaypointTraitSymbol[];
  setSearchTraits: (value: WaypointTraitSymbol[]) => void;
  searchAutoComplete: string;
  setSearchAutoComplete: (value: string) => void;
  marketItems: TradeSymbol[];
  setMarketItems: (value: TradeSymbol[]) => void;
  marketItemTypes: MarketTradeGoodTypeEnum[];
  setMarketItemTypes: (value: MarketTradeGoodTypeEnum[]) => void;
  shipTypes: ShipType[];
  setShipTypes: (value: ShipType[]) => void;
}) {
  return (
    <Card style={{ width: "fit-content" }} title={"Search"}>
      <Title level={5}>Waypoint</Title>
      <Space>
        <Select
          placeholder="Select Waypoint Type"
          style={{ width: 250 }}
          allowClear
          options={[
            ...new Set(waypoints.map((value) => value.waypoint.type)),
          ].map((value) => {
            return {
              value: value,
            };
          })}
          onChange={(value) => {
            setSearchType(value as WaypointType);
            // setWaypointsPage(1);
          }}
        />
        <Select
          allowClear
          placeholder="Select Traits"
          mode="multiple"
          onChange={(value) => {
            console.log("selected", value);
            setSearchTraits(value as WaypointTraitSymbol[]);
          }}
          options={traitsOptions}
          style={{ width: 300 }}
        />
        <AutoComplete
          style={{ width: 200 }}
          value={searchAutoComplete}
          onChange={(value) => setSearchAutoComplete(value)}
          placeholder="Search..."
          options={waypoints.map((value) => {
            return {
              label: value.waypoint.symbol,
              value: value.waypoint.symbol,
            };
          })}
        />
      </Space>
      <Title level={5}>Markets</Title>
      <Space>
        <Select
          allowClear
          placeholder="Select Items"
          mode="multiple"
          onChange={(value) => {
            console.log("selected", value);
            setMarketItems(value as TradeSymbol[]);
          }}
          options={tradeGoodOptions}
          style={{ width: 300 }}
        />
        <Select
          allowClear
          placeholder="Select Where"
          mode="multiple"
          onChange={(value) => {
            console.log("selected", value);
            setMarketItemTypes(value as MarketTradeGoodTypeEnum[]);
          }}
          options={[
            {
              label: "Exchanges",
              value: "EXCHANGE",
            },
            {
              label: "Exports",
              value: "EXPORT",
            },
            {
              label: "Imports",
              value: "IMPORT",
            },
          ]}
          style={{ width: 300 }}
        />
      </Space>
      <Title level={5}>Shipyards</Title>
      <Select
        allowClear
        placeholder="Select Ships"
        mode="multiple"
        onChange={(value) => {
          console.log("selected", value);
          setShipTypes(value as ShipType[]);
        }}
        options={shipTypeOptions}
        style={{ width: 300 }}
      />
    </Card>
  );
}

function filterWps(
  marketItemTypes: MarketTradeGoodTypeEnum[],
  marketItems: TradeSymbol[],
  searchAutoComplete: string,
  searchTraits: WaypointTraitSymbol[],
  searchType: WaypointType | undefined,
  unfilteredWaypoints: WaypointState[],
  shipTypes: ShipType[],
) {
  return unfilteredWaypoints
    .filter((waypoint) => {
      const typeMatch = !searchType || waypoint.waypoint.type === searchType;
      const traitsMatch =
        searchTraits.length === 0 ||
        searchTraits.every((trait) =>
          waypoint.waypoint.traits.map((t) => t.symbol).includes(trait),
        );
      return typeMatch && traitsMatch;
    })
    .filter((waypoint) => {
      return (
        searchAutoComplete === "" ||
        waypoint.waypoint.symbol
          .toLowerCase()
          .includes(searchAutoComplete.toLowerCase())
      );
    })
    .filter((waypoint) => {
      if (marketItems.length === 0) return true;
      if (waypoint.market === undefined) return false;

      if (
        (marketItemTypes.length === 0 ||
          marketItemTypes.includes("EXCHANGE")) &&
        waypoint.market.exchange.some((value) =>
          marketItems.includes(value.symbol),
        )
      ) {
        return true;
      }

      if (
        (marketItemTypes.length === 0 || marketItemTypes.includes("EXPORT")) &&
        waypoint.market.exports.some((value) =>
          marketItems.includes(value.symbol),
        )
      ) {
        return true;
      }

      if (
        (marketItemTypes.length === 0 || marketItemTypes.includes("IMPORT")) &&
        waypoint.market.imports.some((value) =>
          marketItems.includes(value.symbol),
        )
      ) {
        return true;
      }

      return false;
    })
    .filter((waypoint) => {
      if (shipTypes.length === 0) return true;
      if (waypoint.shipyard === undefined) return false;
      return waypoint.shipyard.shipTypes.some((value) =>
        shipTypes.includes(value.type),
      );
    });
}
export { filterWps };
export default FilterCard;
