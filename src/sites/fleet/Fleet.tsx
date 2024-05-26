import { useEffect, useState } from "react";
import spaceTraderClient from "../../spaceTraderClient";
import { Ship } from "../../components/api";
import { Card, Descriptions, Flex, Pagination, PaginationProps } from "antd";

function Fleet() {
  const [ships, setShips] = useState<Ship[]>([]);
  const [shipsPage, setShipsPage] = useState(1);
  const [allShips, setAllShips] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    spaceTraderClient.FleetClient.getMyShips(shipsPage, itemsPerPage).then(
      (response) => {
        console.log("my responses", response);
        setShips(response.data.data);
        setAllShips(response.data.meta.total);
      }
    );
    return () => {};
  }, [itemsPerPage, shipsPage]);

  const onChange: PaginationProps["onChange"] = (page, pageSize) => {
    console.log(page);
    setShipsPage(page);
    setItemsPerPage(pageSize);
  };

  return (
    <div>
      <h2>All Ships</h2>
      <Pagination
        current={shipsPage}
        onChange={onChange}
        total={allShips}
        pageSizeOptions={[5, 10, 15, 20]}
        showTotal={(total, range) =>
          `${range[0]}-${range[1]} of ${total} items`
        }
        style={{ padding: "16px", textAlign: "center" }}
      />
      <Flex wrap gap="middle" align="center" justify="space-evenly">
        {ships.map((value) => {
          return (
            <Card key={value.symbol} style={{ width: "fit-content" }}>
              <Descriptions
                title="Details"
                bordered
                items={[
                  {
                    key: "symbol",
                    label: "Symbol",
                    children: <span>{value.symbol}</span>,
                  },
                  {
                    key: "role",
                    label: "Role",
                    children: <span>{value.registration.role}</span>,
                  },
                  {
                    key: "cooldown",
                    label: "Cooldown",
                    children: (
                      <span>
                        {value.cooldown.remainingSeconds} /{" "}
                        {value.cooldown.totalSeconds}
                      </span>
                    ),
                  },
                  {
                    key: "navStatus",
                    label: "Nav Status",
                    children: <span>{value.nav.status}</span>,
                  },
                  {
                    key: "navSystem",
                    label: "Nav System",
                    children: <span>{value.nav.systemSymbol}</span>,
                  },
                  {
                    key: "navWaypoint",
                    label: "Nav Waypoint",
                    children: <span>{value.nav.waypointSymbol}</span>,
                  },
                  {
                    key: "fuel",
                    label: "Fuel",
                    children: (
                      <span>
                        {value.fuel.current}/{value.fuel.capacity}
                      </span>
                    ),
                  },
                  {
                    key: "cargo",
                    label: "Cargo",
                    children: (
                      <span>
                        {value.cargo.units}/{value.cargo.capacity}
                      </span>
                    ),
                  },
                  {
                    key: "crew",
                    label: "Crew",
                    children: (
                      <span>
                        {value.crew.current} / {value.crew.capacity} (min{" "}
                        {value.crew.required})
                      </span>
                    ),
                  },
                  {
                    key: "mounts",
                    label: "Mounts",
                    children: <span>{value.mounts.length} installed</span>,
                  },
                  {
                    key: "modules",
                    label: "Modules",
                    children: <span>{value.modules.length} installed</span>,
                  },
                  {
                    key: "engine",
                    label: "Engine",
                    children: (
                      <span>
                        {value.engine.name} ({value.engine.symbol})
                      </span>
                    ),
                  },
                  {
                    key: "reactor",
                    label: "Reactor",
                    children: (
                      <span>
                        {value.reactor.name} ({value.reactor.symbol})
                      </span>
                    ),
                  },
                  {
                    key: "frame",
                    label: "Frame",
                    children: (
                      <span>
                        {value.frame.name} ({value.frame.symbol})
                      </span>
                    ),
                  },
                ]}
              ></Descriptions>
            </Card>
          );
        })}
      </Flex>
    </div>
  );
}

export default Fleet;
