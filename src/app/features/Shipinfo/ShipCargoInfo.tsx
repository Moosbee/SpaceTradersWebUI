import type { DescriptionsProps } from "antd";
import {
  Button,
  Descriptions,
  Dropdown,
  InputNumber,
  message,
  Space,
  Table,
  Tooltip,
} from "antd";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type { Ship, ShipCargoItem } from "../../spaceTraderAPI/api";
import { selectAgent, setMyAgent } from "../../spaceTraderAPI/redux/agentSlice";
import { selectAgentSymbol } from "../../spaceTraderAPI/redux/configSlice";
import {
  putContract,
  selectOpenContracts,
} from "../../spaceTraderAPI/redux/contractSlice";
import {
  selectShips,
  setShipCargo,
} from "../../spaceTraderAPI/redux/fleetSlice";
import { addMarketTransaction } from "../../spaceTraderAPI/redux/tansactionSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";

function ShipCargoInfo({ ship }: { ship: Ship }) {
  const dispatch = useAppDispatch();
  const agentSymbol = useAppSelector(selectAgentSymbol);
  const myAgent = useAppSelector((state) => selectAgent(state, agentSymbol));

  const itemsCargo: DescriptionsProps["items"] = [
    {
      key: "cargo",
      label: "Cargo",
      children: (
        <span>
          {ship.cargo.units}/{ship.cargo.capacity}
        </span>
      ),
      span: 1,
    },

    {
      key: "inventory",
      label: "Inventory",
      span: 3,
      children: (
        <Table
          rowKey={(item) => item.symbol}
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              render(value, record) {
                return (
                  <Tooltip
                    key={record.symbol}
                    title={`${record.symbol} - ${record.description}`}
                  >
                    <span>{value}</span>
                  </Tooltip>
                );
              },
            },
            { title: "Units", key: "units", dataIndex: "units" },
            {
              title: "Action",
              key: "action",

              render(_value, record) {
                return (
                  <CargoActions
                    key={record.symbol}
                    item={record}
                    onJettison={(count, item) => {
                      console.log("Jettison", item, count);
                      spaceTraderClient.FleetClient.jettison(ship.symbol, {
                        symbol: record.symbol,
                        units: count,
                      }).then((value) => {
                        console.log("jett value", value);
                        setTimeout(() => {
                          message.success(`${count} ${item} jettisoned`);
                          dispatch(
                            setShipCargo({
                              symbol: ship.symbol,
                              cargo: value.data.data.cargo,
                            }),
                          );
                        });
                      });
                    }}
                    onSell={(count, item) => {
                      console.log("Sell", item, count);
                      spaceTraderClient.FleetClient.sellCargo(ship.symbol, {
                        symbol: record.symbol,
                        units: count,
                      }).then((value) => {
                        console.log("sell value", value);
                        setTimeout(() => {
                          message.success(
                            `${count} ${item} sold for $${value.data.data.transaction.totalPrice}, new balance: ${value.data.data.agent.credits}`,
                          );
                          dispatch(
                            setShipCargo({
                              symbol: ship.symbol,
                              cargo: value.data.data.cargo,
                            }),
                          );
                          dispatch(setMyAgent(value.data.data.agent));
                          dispatch(
                            addMarketTransaction(value.data.data.transaction),
                          );
                        });
                      });
                    }}
                    onTransfer={(count, item, shipSymbol) => {
                      console.log("Transfer", item, count, shipSymbol);
                      spaceTraderClient.FleetClient.transferCargo(ship.symbol, {
                        shipSymbol,
                        tradeSymbol: record.symbol,
                        units: count,
                      }).then((value) => {
                        console.log("transfer value", value);
                        setTimeout(() => {
                          message.success(
                            `${count} ${item} transfered to ${shipSymbol}`,
                          );
                          dispatch(
                            setShipCargo({
                              symbol: ship.symbol,
                              cargo: value.data.data.cargo,
                            }),
                          );
                        });
                      });
                    }}
                    onFulfill={(count, item, contractID) => {
                      console.log("Deliver", item, count, contractID);
                      spaceTraderClient.ContractsClient.deliverContract(
                        contractID,
                        {
                          shipSymbol: ship.symbol,
                          tradeSymbol: record.symbol,
                          units: count,
                        },
                      ).then((value) => {
                        console.log("deliver value", value);
                        setTimeout(() => {
                          message.success(
                            `${count} ${item} delivered to ${contractID}`,
                          );
                          dispatch(
                            setShipCargo({
                              symbol: ship.symbol,
                              cargo: value.data.data.cargo,
                            }),
                          );
                          if (myAgent)
                            dispatch(
                              putContract({
                                contract: value.data.data.contract,
                                agentSymbol: myAgent.agent.symbol,
                              }),
                            );
                        });
                      });
                    }}
                  ></CargoActions>
                );
              },
            },
          ]}
          dataSource={ship.cargo.inventory}
          // bordered
          size="small"
        />
      ),
    },
  ];

  return (
    <Descriptions
      title="Cargo Info"
      bordered
      items={itemsCargo}
      layout="vertical"
    ></Descriptions>
  );
}

function CargoActions({
  item,
  onJettison,
  onSell,
  onTransfer,
  onFulfill,
}: {
  item: ShipCargoItem;
  onJettison: (count: number, item: string) => void;
  onSell: (count: number, item: string) => void;
  onTransfer: (count: number, item: string, shipSymbol: string) => void;
  onFulfill: (count: number, item: string, contractID: string) => void;
}) {
  const [count, setCount] = useState(1);
  const agentSymbol = useAppSelector(selectAgentSymbol);
  const agent = useAppSelector((state) => selectAgent(state, agentSymbol));

  const items = useAppSelector(selectShips).map((w) => {
    return {
      key: w.symbol,
      label: w.symbol,
    };
  });

  const contracts = useAppSelector(selectOpenContracts)
    .filter((w) => w.agentSymbol === agent?.agent.symbol)
    .map((w) => {
      return {
        key: w.contract.id,
        label: w.contract.id,
      };
    });

  return (
    <Space>
      <InputNumber
        min={1}
        max={item.units}
        defaultValue={1}
        style={{ width: 60 }}
        onChange={(value) => setCount(value?.valueOf() ?? 1)}
        value={count}
        changeOnWheel
      />
      <Button onClick={() => onJettison(count, item.symbol)}>Jettison</Button>
      <Button onClick={() => onSell(count, item.symbol)}>Sell</Button>
      <Dropdown
        menu={{
          items,
          onClick: ({ key }) => {
            onTransfer(count, item.symbol, key);
          },
        }}
        trigger={["click"]}
      >
        <Button>Transfer</Button>
      </Dropdown>
      <Dropdown
        menu={{
          items: contracts,
          onClick: ({ key }) => {
            onFulfill(count, item.symbol, key);
          },
        }}
        trigger={["click"]}
      >
        <Button>Fulfill Contr.</Button>
      </Dropdown>
    </Space>
  );
}

export default ShipCargoInfo;
