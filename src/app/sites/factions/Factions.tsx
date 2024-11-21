import type { PaginationProps } from "antd";
import { Flex, Pagination, Spin } from "antd";
import { useEffect, useState } from "react";
import FactionDisp from "../../features/disp/FactionDisp";
import PageTitle from "../../features/PageTitle";
import type { Faction } from "../../spaceTraderAPI/api";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";

function Factions() {
  const [factions, setFactions] = useState<Faction[]>([]);
  const [factionsPage, setFactionsPage] = useState(1);
  const [factionsAll, setFactionsAll] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    console.log("page", factionsPage, "items", itemsPerPage);
    spaceTraderClient.FactionsClient.getFactions(
      factionsPage,
      itemsPerPage,
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
    // setItemsPerPage(20);
    setItemsPerPage(pageSize);
  };

  return (
    <div style={{ padding: "24px 24px" }}>
      <PageTitle title={`Factions`} />
      <h2>All Factions</h2>
      <Pagination
        current={factionsPage}
        onChange={onChange}
        total={factionsAll}
        pageSizeOptions={[5, 10, 15, 20]}
        defaultPageSize={20}
        showTotal={(total, range) =>
          `${range[0]}-${range[1]} of ${total} items with ${itemsPerPage} per page`
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
