import { Button, Card, Descriptions, Table } from "antd";
import type { Contract } from "../../app/spaceTraderAPI/api";
import { Link } from "react-router-dom";
import spaceTraderClient from "../../app/spaceTraderAPI/spaceTraderClient";
import { useState, useEffect } from "react";

function ContractDisp({
  contract,
  onAccept,
  onFulfill,
}: {
  contract: Contract;
  onAccept?: () => void;
  onFulfill?: () => void;
}) {
  const [deliverTerms, setDeliverTerms] = useState<
    {
      systemSymbol?: string;
      tradeSymbol: string;
      destinationSymbol: string;
      unitsRequired: number;
      unitsFulfilled: number;
    }[]
  >(contract.terms.deliver || []);

  useEffect(() => {
    if (!contract.terms.deliver) return;
    Promise.all(
      contract.terms.deliver.map(async (d) => {
        const data = await spaceTraderClient.LocalCache.getSystemByWaypoint(
          d.destinationSymbol,
        );
        return { data, d };
      }),
    ).then((data) => {
      const deliverTerms = data.map((d) => ({
        ...d.d,
        systemSymbol: d.data[0].symbol,
      }));
      setDeliverTerms(deliverTerms);
    });
  }, [contract]);

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
                            <Link
                              to={`/system/${record.systemSymbol}/${symbol}`}
                            >
                              {symbol}
                            </Link>
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
                      dataSource={deliverTerms}
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

export default ContractDisp;
