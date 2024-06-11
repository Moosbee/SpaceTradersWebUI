import { PaginationProps, Pagination, Flex, Spin } from "antd";
import { useState, useEffect } from "react";
import { Contract } from "../../utils/api";
import spaceTraderClient from "../../utils/spaceTraderClient";
import ContractDisp from "../../components/disp/ContractDisp";

function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractsPage, setContractsPage] = useState(1);
  const [contractsAll, setContractsAll] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    spaceTraderClient.ContractsClient.getContracts(
      contractsPage,
      itemsPerPage
    ).then((response) => {
      console.log("response", response);
      setContracts(response.data.data);
      setContractsAll(response.data.meta.total);
      setLoading(false);
    });
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
      <Spin spinning={loading}>
        <Flex wrap gap="middle" align="center" justify="space-evenly">
          {contracts.map((value) => (
            <ContractDisp
              key={value.id}
              contract={value}
              onAccept={() => {
                spaceTraderClient.ContractsClient.acceptContract(value.id).then(
                  (response) => {
                    console.log("response", response);
                    setContractsPage(contractsPage);
                  }
                );
              }}
            ></ContractDisp>
          ))}
        </Flex>
      </Spin>
    </div>
  );
}

export default Contracts;
