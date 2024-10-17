import type { SelectProps } from "antd";
import { AutoComplete, Card, Select, Space, Switch, Typography } from "antd";
import type {
  MarketTradeGoodTypeEnum,
  Shipyard,
  Waypoint,
} from "../../spaceTraderAPI/api";
import {
  ShipType,
  TradeSymbol,
  WaypointTraitSymbol,
  WaypointType,
} from "../../spaceTraderAPI/api";
import type { MarketState } from "../../spaceTraderAPI/redux/marketSlice";
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
  onlyInterestingMarket,
  setOnlyInterestingMarket,
}: {
  waypoints: string[];
  searchType: WaypointType[];
  setSearchType: (value: WaypointType[]) => void;
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
  onlyInterestingMarket: boolean;
  setOnlyInterestingMarket: (value: boolean) => void;
}) {
  return (
    <Card style={{ width: "fit-content" }} title={"Search"}>
      <Title level={5}>Waypoint</Title>
      <Space>
        <Select
          placeholder="Select Waypoint Type"
          style={{ width: 250 }}
          allowClear
          mode="multiple"
          options={[
            ...Object.values(WaypointType).map((value) => {
              return {
                value: value,
              };
            }),
          ]}
          onChange={(value) => {
            setSearchType(value as WaypointType[]);
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
          options={waypoints
            .filter((w) =>
              w.toLowerCase().includes(searchAutoComplete.toLowerCase()),
            )
            .map((value) => {
              return {
                label: value,
                value: value,
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
        Filter Fuel:
        <Switch
          title="Show Only interesting Markets"
          onChange={setOnlyInterestingMarket}
          checked={onlyInterestingMarket}
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
  searchType: WaypointType[],
  unfilteredWaypoints: {
    [key: string]: WaypointState;
  },
  unFilteredMarkets: { [key: string]: MarketState },
  shipTypes: ShipType[],
  onlyInterestingMarket: boolean,
): {
  filter: boolean;
  waypoint: Waypoint;
  market?: MarketState;
  shipyard?: Shipyard;
}[] {
  const unfiltered: {
    waypoint: Waypoint;
    market?: MarketState;
    shipyard?: Shipyard;
  }[] = [];
  for (const key in unfilteredWaypoints) {
    unfiltered.push({
      ...unfilteredWaypoints[key],
      market: unFilteredMarkets[key],
    });
  }

  return unfiltered.map((waypoint) => {
    const typeMatch =
      searchType.length === 0 || searchType.includes(waypoint.waypoint.type);
    const traitsMatch =
      searchTraits.length === 0 ||
      searchTraits.every((trait) =>
        waypoint.waypoint.traits.map((t) => t.symbol).includes(trait),
      );
    const nameMatch =
      searchAutoComplete === "" ||
      waypoint.waypoint.symbol
        .toLowerCase()
        .includes(searchAutoComplete.toLowerCase());
    const interestingMarketMatch =
      !onlyInterestingMarket ||
      (waypoint.market?.static.exports.length ?? 0) > 0 ||
      (waypoint.market?.static.imports.length ?? 0) > 0 ||
      (waypoint.market?.static.exchange.length ?? 0) > 1;
    const shipyardMatch =
      shipTypes.length === 0 ||
      waypoint.shipyard?.shipTypes.some((value) =>
        shipTypes.includes(value.type),
      );
    const marketMatch =
      marketItems.length === 0 ||
      (waypoint.market !== undefined &&
        (((marketItemTypes.length === 0 ||
          marketItemTypes.includes("EXCHANGE")) &&
          waypoint.market.static.exchange.some((value) =>
            marketItems.includes(value.symbol),
          )) ||
          ((marketItemTypes.length === 0 ||
            marketItemTypes.includes("EXPORT")) &&
            waypoint.market.static.exports.some((value) =>
              marketItems.includes(value.symbol),
            )) ||
          ((marketItemTypes.length === 0 ||
            marketItemTypes.includes("IMPORT")) &&
            waypoint.market.static.imports.some((value) =>
              marketItems.includes(value.symbol),
            ))));
    return {
      ...waypoint,
      filter:
        (typeMatch &&
          traitsMatch &&
          nameMatch &&
          interestingMarketMatch &&
          shipyardMatch &&
          marketMatch) ??
        false,
    };
  });
}
export { filterWps };
export default FilterCard;
