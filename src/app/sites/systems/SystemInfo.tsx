import type { DescriptionsProps, PaginationProps } from "antd";
import { Descriptions, Divider, Flex, Pagination, Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CachingSystemMarketsCard from "../../features/cachingCard/CachingSystemMarketsCard";
import CachingSystemShipyardsCard from "../../features/cachingCard/CachingSystemShipyardsCard";
import CachingSystemWaypointsCard from "../../features/cachingCard/CachingSystemWaypointsCard";
import WaypointDisp from "../../features/disp/WaypointDisp";
import FilterCard, { filterWps } from "../../features/filterCard/FilterCard";
import PageTitle from "../../features/PageTitle";
import TradeRoutes from "../../features/TradeRoutes/TradeRoutes";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type {
  MarketTradeGoodTypeEnum,
  ShipType,
  TradeSymbol,
  WaypointTraitSymbol,
  WaypointType,
} from "../../spaceTraderAPI/api";
import { selectSelectedSystemSymbol } from "../../spaceTraderAPI/redux/mapSlice";
import { selectSystemMarkets } from "../../spaceTraderAPI/redux/marketSlice";
import {
  putSystem,
  selectSystem,
} from "../../spaceTraderAPI/redux/systemSlice";
import { selectSystemWaypoints } from "../../spaceTraderAPI/redux/waypointSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";

function SystemInfo() {
  const { systemID } = useParams();
  const selectedSystem = useAppSelector(selectSelectedSystemSymbol);
  const system = useAppSelector((state) =>
    selectSystem(state, systemID === "selected" ? selectedSystem : systemID),
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!systemID) return;
    spaceTraderClient.SystemsClient.getSystem(systemID).then((response) => {
      console.log("my responses", response);
      dispatch(
        putSystem({
          symbol: response.data.data.symbol,
          system: response.data.data,
        }),
      );
    });
  }, [dispatch, systemID]);

  const items: DescriptionsProps["items"] = [
    {
      key: "symbol",
      label: "Symbol",
      children: <p>{system?.symbol}</p>,
    },
    {
      key: "sectorSymbol",
      label: "Sector Symbol",
      children: <p>{system?.sectorSymbol}</p>,
    },
    {
      key: "type",
      label: "Type",
      children: <p>{system?.type}</p>,
    },
    {
      key: "coordinates",
      label: "Coordinates",
      children: (
        <p>
          X: {system?.x} Y: {system?.y}
        </p>
      ),
    },
    {
      key: "factions",
      label: "Factions",
      children: (
        <p>{system?.factions.map((value) => value.symbol).join(" - ")}</p>
      ),
    },
    {
      key: "waypointsCount",
      label: "Waypoints Count",
      children: <p>{system?.waypoints.length}</p>,
    },
  ];

  const unfilteredWaypoints = useAppSelector((state) =>
    selectSystemWaypoints(state, systemID!),
  );

  const unfilteredMarkets = useAppSelector((state) =>
    selectSystemMarkets(state, systemID!),
  );

  const [searchType, setSearchType] = useState<WaypointType>();
  const [searchTraits, setSearchTraits] = useState<WaypointTraitSymbol[]>([]);
  const [searchAutoComplete, setSearchAutoComplete] = useState<string>("");
  const [marketItems, setMarketItems] = useState<TradeSymbol[]>([]);
  const [marketItemTypes, setMarketItemTypes] = useState<
    MarketTradeGoodTypeEnum[]
  >([]);
  const [shipTypes, setShipTypes] = useState<ShipType[]>([]);

  const waypoints = useMemo(() => {
    return filterWps(
      marketItemTypes,
      marketItems,
      searchAutoComplete,
      searchTraits,
      searchType,
      unfilteredWaypoints,
      unfilteredMarkets,
      shipTypes,
    );
  }, [
    marketItemTypes,
    marketItems,
    searchAutoComplete,
    searchTraits,
    searchType,
    shipTypes,
    unfilteredMarkets,
    unfilteredWaypoints,
  ]);

  const [waypointsPage, setWaypointsPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const waypointsPaging = useMemo(() => {
    return waypoints.slice(
      (waypointsPage - 1) * itemsPerPage,
      waypointsPage * itemsPerPage,
    );
  }, [itemsPerPage, waypoints, waypointsPage]);

  const onChange: PaginationProps["onChange"] = (page, pageSize) => {
    console.log(page);
    setWaypointsPage(page);
    setItemsPerPage(pageSize);
  };

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title={`System ${systemID}`} />
      <Spin spinning={system?.symbol === ""}>
        <h2>System {systemID}</h2>
        <Descriptions
          bordered
          items={items}
          extra={<Link to={`/system/map/${systemID}`}>Map</Link>}
        />

        <h2>Waypoints</h2>

        <Flex justify="space-around" gap={8}>
          <FilterCard
            marketItemTypes={marketItemTypes}
            marketItems={marketItems}
            searchAutoComplete={searchAutoComplete}
            searchTraits={searchTraits}
            searchType={searchType}
            setMarketItemTypes={setMarketItemTypes}
            setMarketItems={setMarketItems}
            setSearchAutoComplete={setSearchAutoComplete}
            setSearchTraits={setSearchTraits}
            setSearchType={setSearchType}
            waypoints={waypoints}
            setShipTypes={setShipTypes}
            shipTypes={shipTypes}
          />
          <CachingSystemWaypointsCard systemSymbol={systemID!} />
          <CachingSystemShipyardsCard systemSymbol={systemID!} />
          <CachingSystemMarketsCard systemSymbol={systemID!} />
        </Flex>

        <Pagination
          current={waypointsPage}
          onChange={onChange}
          pageSize={itemsPerPage}
          total={waypoints.length}
          pageSizeOptions={[10, 25, 50, 75, 100]}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          style={{ padding: "16px", textAlign: "center" }}
        />

        <Flex wrap gap="middle" align="center" justify="space-evenly">
          {waypointsPaging.map((value) => {
            return (
              <WaypointDisp
                key={value.waypoint.symbol}
                waypoint={value.waypoint}
              ></WaypointDisp>
            );
          })}
        </Flex>
        <Divider />
        <TradeRoutes waypoints={unfilteredMarkets} />
      </Spin>
    </div>
  );
}

export default SystemInfo;
