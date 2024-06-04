import { PaginationProps, Pagination, Flex, Card, Descriptions } from "antd";
import { useState, useEffect } from "react";
import { Contract } from "../../components/api";
import spaceTraderClient from "../../spaceTraderClient";

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
        {contracts.map((value) => {
          return (
            <Card key={value.id} style={{ width: "fit-content" }}>
              <Descriptions
                bordered
                layout="vertical"
                items={[
                  {
                    label: "Id",
                    key: "id",
                    children: value.id,
                  },
                  {
                    label: "accepted",
                    key: "accepted",
                    children: value.accepted,
                  },
                  {
                    label: "deadlineToAccept",
                    key: "deadlineToAccept",
                    children: value.deadlineToAccept,
                  },
                  {
                    label: "factionSymbol",
                    key: "factionSymbol",
                    children: value.factionSymbol,
                  },
                  {
                    label: "fulfilled",
                    key: "fulfilled",
                    children: value.fulfilled,
                  },
                  {
                    label: "terms.deadline",
                    key: "terms.deadline",
                    children: value.terms.deadline,
                  },
                  {
                    label: "terms.payment.onAccepted",
                    key: "terms.payment.onAccepted",
                    children: value.terms.payment.onAccepted,
                  },
                  {
                    label: "terms.payment.onFulfilled",
                    key: "terms.payment.onFulfilled",
                    children: value.terms.payment.onFulfilled,
                  },
                  {
                    label: "terms.deliver",
                    key: "terms.deliver",
                    children: value.terms.deliver?.join(" - "),
                  },
                  {
                    label: "type",
                    key: "type",
                    children: value.type,
                  },
                  {
                    label: "expiration",
                    key: "expiration",
                    children: value.expiration,
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

export default Contracts;
