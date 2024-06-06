import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { System, Waypoint } from "../../components/api";
import spaceTraderClient from "../../spaceTraderClient";
import {
  Descriptions,
  DescriptionsProps,
  Flex,
  Pagination,
  PaginationProps,
  Spin,
} from "antd";
import WaypointDisp from "../../components/disp/WaypointDisp";

function SystemInfo() {
  const { systemID } = useParams();
  const [system, setSystem] = useState<System>({
    symbol: "",
    type: "WHITE_DWARF",
    x: 0,
    y: 0,
    factions: [],
    sectorSymbol: "",
    waypoints: [],
  });

  useEffect(() => {
    if (!systemID) return;
    spaceTraderClient.SystemsClient.getSystem(systemID).then((response) => {
      console.log("my responses", response);
      setSystem(response.data.data);
    });
    return () => {};
  }, [systemID]);

  const items: DescriptionsProps["items"] = [
    {
      key: "symbol",
      label: "Symbol",
      children: <p>{system.symbol}</p>,
    },
    {
      key: "sectorSymbol",
      label: "Sector Symbol",
      children: <p>{system.sectorSymbol}</p>,
    },
    {
      key: "type",
      label: "Type",
      children: <p>{system.type}</p>,
    },
    {
      key: "coordinates",
      label: "Coordinates",
      children: (
        <p>
          X: {system.x} Y: {system.y}
        </p>
      ),
    },
    {
      key: "factions",
      label: "Factions",
      children: (
        <p>{system.factions.map((value) => value.symbol).join(" - ")}</p>
      ),
    },
    {
      key: "waypointsCount",
      label: "Waypoints Count",
      children: <p>{system.waypoints.length}</p>,
    },
  ];

  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [waypointsPage, setShipsPage] = useState(1);
  const [allWaypoints, setAllWaypoints] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (!systemID) return;
    setLoading(true);
    spaceTraderClient.SystemsClient.getSystemWaypoints(
      systemID,
      waypointsPage,
      itemsPerPage
    ).then((response) => {
      console.log("my responses", response);
      setWaypoints(response.data.data);
      setAllWaypoints(response.data.meta.total);
      setLoading(false);
    });
    return () => {};
  }, [itemsPerPage, systemID, waypointsPage]);

  const onChange: PaginationProps["onChange"] = (page, pageSize) => {
    console.log(page);
    setShipsPage(page);
    setItemsPerPage(pageSize);
  };

  return (
    <div>
      <Spin spinning={system.symbol == ""} fullscreen />
      <h2>System {systemID}</h2>
      <Descriptions bordered items={items} />

      <h2>Waypoints</h2>
      <Pagination
        current={waypointsPage}
        onChange={onChange}
        total={allWaypoints}
        pageSizeOptions={[5, 10, 15, 20]}
        showTotal={(total, range) =>
          `${range[0]}-${range[1]} of ${total} items`
        }
        style={{ padding: "16px", textAlign: "center" }}
      />
      <Spin spinning={loading}>
        <Flex wrap gap="middle" align="center" justify="space-evenly">
          {waypoints.map((value) => {
            return (
              <WaypointDisp key={value.symbol} waypoint={value}></WaypointDisp>
            );
          })}
        </Flex>
      </Spin>
    </div>
  );
}

export default SystemInfo;
