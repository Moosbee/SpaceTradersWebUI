import { PaginationProps, Pagination, Flex } from "antd";
import { useState, useEffect } from "react";
import { Faction } from "../../components/api";
import spaceTraderClient from "../../spaceTraderClient";
import FactionDisp from "../../components/disp/FactionDisp";

function Factions() {
  const [factions, setFactions] = useState<Faction[]>([]);
  const [factionsPage, setFactionsPage] = useState(1);
  const [factionsAll, setFactionsAll] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  useEffect(() => {
    spaceTraderClient.FactionsClient.getFactions(
      factionsPage,
      itemsPerPage
    ).then((response) => {
      console.log("response", response);
      setFactions(response.data.data);
      setFactionsAll(response.data.meta.total);
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
      <Flex wrap gap="middle" align="center" justify="space-evenly">
        {factions.map((value) => (
          <FactionDisp key={value.symbol} faction={value}></FactionDisp>
        ))}
      </Flex>
    </div>
  );
}

export default Factions;
