import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  System,
  Waypoint,
  WaypointTraitSymbol,
  WaypointType,
} from "../../components/api";
import spaceTraderClient from "../../spaceTraderClient";
import {
  Col,
  Descriptions,
  DescriptionsProps,
  Flex,
  Pagination,
  PaginationProps,
  Row,
  Select,
  SelectProps,
  Spin,
} from "antd";
import WaypointDisp from "../../components/disp/WaypointDisp";

const traitsOptions: SelectProps["options"] = Object.values(
  WaypointTraitSymbol
).map((value) => {
  return { value: value };
});

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
  const [waypointsPage, setWaypointsPage] = useState(1);
  const [allWaypoints, setAllWaypoints] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<WaypointType>();
  const [traits, setTraits] = useState<WaypointTraitSymbol>();

  useEffect(() => {
    if (!systemID) return;
    console.log(type);
    setLoading(true);
    spaceTraderClient.SystemsClient.getSystemWaypoints(
      systemID,
      waypointsPage,
      itemsPerPage,
      type,
      traits
    ).then((response) => {
      console.log("my responses", response);
      setWaypoints(response.data.data);
      setAllWaypoints(response.data.meta.total);
      setLoading(false);
    });
  }, [itemsPerPage, systemID, traits, type, waypointsPage]);

  const onChange: PaginationProps["onChange"] = (page, pageSize) => {
    console.log(page);
    setWaypointsPage(page);
    setItemsPerPage(pageSize);
  };

  const handleTraitsChange = (value: string) => {
    console.log(`selected ${value}`);
    setTraits(value as WaypointTraitSymbol);
  };

  return (
    <Spin spinning={system.symbol === ""}>
      <h2>System {systemID}</h2>
      <Descriptions bordered items={items} />

      <h2>Waypoints</h2>
      {/* <Button
        type="primary"
        onClick={() => {
          if (!systemID) return;
          spaceTraderClient.CrawlClient.getSystemWaypoints(
            systemID,
            (progress, total) => {
              console.log("my progress", progress);
              console.log("my total", total);
            }
          ).then((response) => {
            console.log("my responses", response);
          });
        }}
      >
        Primary Button
      </Button> */}
      {/* !todo rewrite with crawler */}
      <Row align="middle">
        <Col span={6} style={{ textAlign: "center" }}>
          <Select
            placeholder="Select Waypoint Type"
            style={{ width: 250 }}
            allowClear
            options={[
              { value: "PLANET" },
              { value: "GAS_GIANT" },
              { value: "MOON" },
              { value: "ORBITAL_STATION" },
              { value: "JUMP_GATE" },
              { value: "ASTEROID_FIELD" },
              { value: "ASTEROID" },
              { value: "ENGINEERED_ASTEROID" },
              { value: "ASTEROID_BASE" },
              { value: "NEBULA" },
              { value: "DEBRIS_FIELD" },
              { value: "GRAVITY_WELL" },
              { value: "ARTIFICIAL_GRAVITY_WELL" },
              { value: "FUEL_STATION" },
            ]}
            onChange={(value) => {
              setType(value as WaypointType);
              setWaypointsPage(1);
            }}
          />
        </Col>
        <Col span={11}>
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
        </Col>
        <Col span={7}>
          <Select
            allowClear
            placeholder="Select Traits"
            onChange={handleTraitsChange}
            options={traitsOptions}
            style={{ width: 400 }}
          />
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Flex wrap gap="middle" align="center" justify="space-evenly">
          {waypoints.map((value) => {
            return (
              <WaypointDisp key={value.symbol} waypoint={value}></WaypointDisp>
            );
          })}
        </Flex>
      </Spin>
    </Spin>
  );
}

export default SystemInfo;
