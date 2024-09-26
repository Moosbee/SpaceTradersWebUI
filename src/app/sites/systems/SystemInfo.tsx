import type { DescriptionsProps, PaginationProps, SelectProps } from "antd";
import { Card, Descriptions, Flex, Pagination, Select, Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CachingSystemMarketsCard from "../../features/cachingCard/CachingSystemMarketsCard";
import CachingSystemShipyardsCard from "../../features/cachingCard/CachingSystemShipyardsCard";
import CachingSystemWaypointsCard from "../../features/cachingCard/CachingSystemWaypointsCard";
import WaypointDisp from "../../features/disp/WaypointDisp";
import PageTitle from "../../features/PageTitle";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type { WaypointType } from "../../spaceTraderAPI/api";
import { WaypointTraitSymbol } from "../../spaceTraderAPI/api";
import { selectSelectedSystemSymbol } from "../../spaceTraderAPI/redux/mapSlice";
import {
  putSystem,
  selectSystem,
} from "../../spaceTraderAPI/redux/systemSlice";
import { selectSystemWaypoints } from "../../spaceTraderAPI/redux/waypointSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";

const traitsOptions: SelectProps["options"] = Object.values(
  WaypointTraitSymbol,
).map((value) => {
  return { value: value };
});

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

  const [searchType, setSearchType] = useState<WaypointType>();
  const [searchTraits, setSearchTraits] = useState<WaypointTraitSymbol[]>([]);

  const waypoints = useMemo(() => {
    return Object.values(unfilteredWaypoints).filter((waypoint) => {
      const typeMatch = !searchType || waypoint.waypoint.type === searchType;
      const traitsMatch =
        searchTraits.length === 0 ||
        searchTraits.every((trait) =>
          waypoint.waypoint.traits.map((t) => t.symbol).includes(trait),
        );
      return typeMatch && traitsMatch;
    });
  }, [searchTraits, searchType, unfilteredWaypoints]);

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
        <Link to={"/system/selected/selected"}>Current</Link>

        <Flex justify="space-around" gap={8}>
          <Card style={{ width: "fit-content" }} title={"Search"}>
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
                setWaypointsPage(1);
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
              style={{ width: 400 }}
            />
          </Card>
          <CachingSystemWaypointsCard systemSymbol={systemID!} />
          <CachingSystemShipyardsCard systemSymbol={systemID!} />
          <CachingSystemMarketsCard systemSymbol={systemID!} />
        </Flex>

        <Pagination
          current={waypointsPage}
          onChange={onChange}
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
      </Spin>
    </div>
  );
}

export default SystemInfo;
