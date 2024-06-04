import { PaginationProps, Pagination, Flex } from "antd";
import { useState, useEffect } from "react";
import { Contract } from "../../components/api";
import spaceTraderClient from "../../spaceTraderClient";
import ContractDisp from "../../components/disp/ContractDisp";

function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractsPage, setContractsPage] = useState(1);
  const [contractsAll, setContractsAll] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  useEffect(() => {
    spaceTraderClient.ContractsClient.getContracts(
      contractsPage,
      itemsPerPage
    ).then((response) => {
      console.log("response", response);
      setContracts(response.data.data);
      setContractsAll(response.data.meta.total);
    });
    return () => {};
  }, [contractsPage, itemsPerPage]);

  const onChange: PaginationProps["onChange"] = (page, pageSize) => {
    console.log(page);
    setContractsPage(page);
    setItemsPerPage(pageSize);
  };

  return (
    <div>
      <h2>All Factions</h2>
      <Pagination
        current={contractsPage}
        onChange={onChange}
        total={contractsAll}
        pageSizeOptions={[5, 10, 15, 20]}
        showTotal={(total, range) =>
          `${range[0]}-${range[1]} of ${total} items`
        }
        style={{ padding: "16px", textAlign: "center" }}
      />
      <Flex wrap gap="middle" align="center" justify="space-evenly">
        {contracts.map((value) => (
          <ContractDisp key={value.id} contract={value}></ContractDisp>
        ))}
      </Flex>
    </div>
  );
}

export default Contracts;
