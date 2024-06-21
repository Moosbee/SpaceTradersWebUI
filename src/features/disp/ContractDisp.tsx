import { Button, Card, Descriptions, Table } from "antd";
import type {
  Contract,
  ContractDeliverGood,
} from "../../app/spaceTraderAPI/api";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectSystemByWaypoint } from "../../app/spaceTraderAPI/redux/systemSlice";

function ContractDisp({
  contract,
  onAccept,
  onFulfill,
}: {
  contract: Contract;
  onAccept?: () => void;
  onFulfill?: () => void;
}) {
  return (
    <Card style={{ width: "fit-content" }}>
      <Descriptions
        bordered
        title="Contract Info"
        layout="vertical"
        extra={
          <span>
            {contract.accepted || !onAccept ? undefined : (
              <Button onClick={onAccept}>Accept</Button>
            )}
            {!contract.accepted || !onFulfill ? undefined : (
              <Button onClick={onFulfill}>Fulfill</Button>
            )}
          </span>
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
                    contract.deadlineToAccept,
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
          ...(contract.terms.deliver === undefined ||
          contract.terms.deliver.length === 0
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
                          render: (symbol: string, record) => (
                            <DestinationSymbolLink
                              symbol={symbol}
                              record={record}
                            />
                          ),
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
          ...(contract.expiration === contract.deadlineToAccept
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

function DestinationSymbolLink({
  symbol,
  record,
}: {
  symbol: string;
  record: ContractDeliverGood;
}) {
  const data = useAppSelector((state) =>
    selectSystemByWaypoint(state, record.destinationSymbol),
  );
  return <Link to={`/system/${data?.symbol}/${symbol}`}>{symbol}</Link>;
}

export default ContractDisp;
