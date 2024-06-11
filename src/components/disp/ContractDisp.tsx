import { Button, Card, Descriptions, Table } from "antd";
import { Contract } from "../../utils/api";

function ContractDisp({
  contract,
  onAccept,
}: {
  contract: Contract;
  onAccept?: () => void;
}) {
  return (
    <Card style={{ width: "fit-content" }}>
      <Descriptions
        bordered
        title="Contract Info"
        layout="vertical"
        extra={
          contract.accepted && !onAccept ? undefined : (
            <Button onClick={onAccept}>Accept</Button>
          )
        }
        items={[
          {
            label: "Id",
            key: "id",
            children: contract.id,
          },
          {
            label: "Accepted",
            key: "accepted",
            children: contract.accepted ? "Yes" : "No",
          },
          ...(contract.deadlineToAccept
            ? [
                {
                  label: "deadlineToAccept",
                  key: "deadlineToAccept",
                  children: new Date(
                    contract.deadlineToAccept
                  ).toLocaleString(),
                },
              ]
            : []),
          {
            label: "Faction Symbol",
            key: "factionSymbol",
            children: contract.factionSymbol,
          },
          {
            label: "Fulfilled",
            key: "fulfilled",
            children: contract.fulfilled ? "Yes" : "No",
          },
          {
            label: "Deadline",
            key: "terms.deadline",
            children: new Date(contract.terms.deadline).toLocaleString(),
          },
          {
            label: "Payment on Accepted",
            key: "terms.payment.onAccepted",
            children: contract.terms.payment.onAccepted,
          },
          {
            label: "Payment on Fulfilled",
            key: "terms.payment.onFulfilled",
            children: contract.terms.payment.onFulfilled,
          },
          ...(contract.terms.deliver == undefined ||
          contract.terms.deliver.length == 0
            ? []
            : [
                {
                  label: "Deliver Terms",
                  key: "terms.deliver",
                  children: (
                    <Table
                      columns={[
                        {
                          title: "Destination Symbol",
                          dataIndex: "destinationSymbol",
                          key: "destinationSymbol",
                        },
                        {
                          title: "Trade Symbol",
                          dataIndex: "tradeSymbol",
                          key: "tradeSymbol",
                        },
                        {
                          title: "Units Fulfilled",
                          dataIndex: "unitsFulfilled",
                          key: "unitsFulfilled",
                        },
                        {
                          title: "Units Required",
                          dataIndex: "unitsRequired",
                          key: "unitsRequired",
                        },
                      ]}
                      dataSource={contract.terms.deliver}
                    ></Table>
                  ),
                },
              ]),
          {
            label: "Type",
            key: "type",
            children: contract.type,
          },
          ...(contract.expiration == contract.deadlineToAccept
            ? []
            : [
                {
                  label: "Expiration Date",
                  key: "expiration",
                  children: new Date(contract.expiration).toLocaleString(),
                },
              ]),
        ]}
      ></Descriptions>
    </Card>
  );
}

export default ContractDisp;
