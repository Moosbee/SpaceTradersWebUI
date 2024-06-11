import { useEffect, useState } from "react";
import spaceTraderClient from "../../utils/spaceTraderClient";
import { Ship } from "../../utils/api";
import { Flex, Pagination, PaginationProps, Spin } from "antd";
import ShipDisp from "../../components/disp/ship/ShipDisp";

function Fleet() {
  const [ships, setShips] = useState<Ship[]>([]);
  const [shipsPage, setShipsPage] = useState(1);
  const [allShips, setAllShips] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    spaceTraderClient.FleetClient.getMyShips(shipsPage, itemsPerPage).then(
      (response) => {
        console.log("my responses", response);
        setShips(response.data.data);
        setAllShips(response.data.meta.total);
        setLoading(false);
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
      <Spin spinning={loading}>
        <Flex wrap gap="middle" align="center" justify="space-evenly">
          {ships.map((value) => {
            return <ShipDisp key={value.symbol} ship={value}></ShipDisp>;
          })}
        </Flex>
      </Spin>
    </div>
  );
}

export default Fleet;
