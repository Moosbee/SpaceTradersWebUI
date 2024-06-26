import { PaginationProps, Pagination, Flex, Spin } from "antd";
import { useState, useEffect } from "react";
import { Faction } from "../../utils/api";
import spaceTraderClient from "../../utils/spaceTraderClient";
import FactionDisp from "../../components/disp/FactionDisp";

function Factions() {
  const [factions, setFactions] = useState<Faction[]>([]);
  const [factionsPage, setFactionsPage] = useState(1);
  const [factionsAll, setFactionsAll] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    spaceTraderClient.FactionsClient.getFactions(
      factionsPage,
      itemsPerPage
    ).then((response) => {
      console.log("response", response);
      setFactions(response.data.data);
      setFactionsAll(response.data.meta.total);
      setLoading(false);
    });
    return () => {};
  }, [factionsPage, itemsPerPage]);

  const onChange: PaginationProps["onChange"] = (page, pageSize) => {
    console.log(page);
    setFactionsPage(page);
    setItemsPerPage(pageSize);
  };

  return (
    <div>
      <h2>All Factions</h2>
      <Pagination
        current={factionsPage}
        onChange={onChange}
        total={factionsAll}
        pageSizeOptions={[5, 10, 15, 20]}
        showTotal={(total, range) =>
          `${range[0]}-${range[1]} of ${total} items`
        }
        style={{ padding: "16px", textAlign: "center" }}
      />
      <Spin spinning={loading}>
        <Flex wrap gap="middle" align="center" justify="space-evenly">
          {factions.map((value) => (
            <FactionDisp key={value.symbol} faction={value}></FactionDisp>
          ))}
        </Flex>
      </Spin>
    </div>
  );
}

export default Factions;
