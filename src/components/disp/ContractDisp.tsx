import { Card, Descriptions } from "antd";
import { Contract } from "../../components/api";

function ContractDisp({ contract }: { contract: Contract }) {
  return (
    <Card style={{ width: "fit-content" }}>
      <Descriptions
        bordered
        title="Contract Info"
        layout="vertical"
        items={[
          {
            label: "Id",
            key: "id",
            children: contract.id,
          },
          {
            label: "accepted",
            key: "accepted",
            children: contract.accepted,
          },
          {
            label: "deadlineToAccept",
            key: "deadlineToAccept",
            children: contract.deadlineToAccept,
          },
          {
            label: "factionSymbol",
            key: "factionSymbol",
            children: contract.factionSymbol,
          },
          {
            label: "fulfilled",
            key: "fulfilled",
            children: contract.fulfilled,
          },
          {
            label: "terms.deadline",
            key: "terms.deadline",
            children: contract.terms.deadline,
          },
          {
            label: "terms.payment.onAccepted",
            key: "terms.payment.onAccepted",
            children: contract.terms.payment.onAccepted,
          },
          {
            label: "terms.payment.onFulfilled",
            key: "terms.payment.onFulfilled",
            children: contract.terms.payment.onFulfilled,
          },
          {
            label: "terms.deliver",
            key: "terms.deliver",
            children: contract.terms.deliver?.join(" - "),
          },
          {
            label: "type",
            key: "type",
            children: contract.type,
          },
          {
            label: "expiration",
            key: "expiration",
            children: contract.expiration,
          },
        ]}
      ></Descriptions>
    </Card>
  );
}

export default ContractDisp;
