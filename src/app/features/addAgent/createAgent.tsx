import type { FormProps } from "antd";
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Input,
  Result,
  Select,
  Space,
  Typography,
} from "antd";
import { useState } from "react";
import { useAppDispatch } from "../../hooks";
import type { Register201ResponseData } from "../../spaceTraderAPI/api";
import { FactionSymbol } from "../../spaceTraderAPI/api";
import { addAgent, setMyAgent } from "../../spaceTraderAPI/redux/agentSlice";
import { setAgentSymbol } from "../../spaceTraderAPI/redux/configSlice";
import { putContract } from "../../spaceTraderAPI/redux/contractSlice";
import { setShips } from "../../spaceTraderAPI/redux/fleetSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import AgentDisp from "../disp/AgentDisp";
import ContractDisp from "../disp/ContractDisp";
import FactionDisp from "../disp/FactionDisp";
import ShipDisp from "../disp/ship/ShipDisp";

type createAgentType = {
  callsign: string;
  faction: FactionSymbol;
  accountToken: string;
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

function CreateAgent() {
  const [newAgent, setNewAgent] = useState<Register201ResponseData | null>(
    null,
  );
  const dispatch = useAppDispatch();

  const { Text } = Typography;

  const [createForm] = Form.useForm<createAgentType>();

  const onCreate: FormProps<createAgentType>["onFinish"] = (values) => {
    console.log("Success:", values);

    spaceTraderClient.AccountsClient.register(
      {
        symbol: values.callsign,
        faction: values.faction,
      },
      {
        transformRequest: (data, headers) => {
          headers["Authorization"] = `Bearer ${values.accountToken}`;
          return data;
        },
      },
    ).then((answer) => {
      console.log(answer);
      setNewAgent(answer.data.data);
      dispatch(setAgentSymbol(answer.data.data.agent.symbol));
      dispatch(
        addAgent({
          agent: answer.data.data.agent,
          token: answer.data.data.token,
        }),
      );
      dispatch(setMyAgent(answer.data.data.agent));
      dispatch(
        putContract({
          contract: answer.data.data.contract,
          agentSymbol: answer.data.data.agent.symbol,
        }),
      );
      dispatch(setShips(answer.data.data.ships || []));
    });
  };

  return (
    <div>
      <h2>Create NewAgent</h2>
      <Form
        {...layout}
        form={createForm}
        onFinish={onCreate}
        name="createAgent"
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="accountToken"
          label="AccountToken"
          rules={[{ required: true }]}
        >
          <Input.Password placeholder="Enter a AccountToken" />
        </Form.Item>
        <Form.Item
          name="callsign"
          label="Callsign"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter a Callsign" />
        </Form.Item>
        <Form.Item name="faction" label="Faction" rules={[{ required: true }]}>
          <Select
            placeholder="Select a faction"
            allowClear
            options={Object.values(FactionSymbol).map((value) => {
              return {
                label: value,
                value: value,
              };
            })}
          ></Select>
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Space>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button htmlType="button">Reset</Button>
          </Space>
        </Form.Item>
      </Form>
      {newAgent == null ? (
        ""
      ) : (
        <Result
          status="success"
          title="Successfully Registered"
          subTitle="Agent Created"
          extra={[
            <Card title="New Agent">
              <Space>
                <Text>Token:</Text>
                <Text copyable code>
                  {newAgent.token}
                </Text>
              </Space>
              <Divider></Divider>
              <Flex wrap gap="middle" align="center" justify="space-evenly">
                <AgentDisp agent={newAgent.agent}></AgentDisp>
                <FactionDisp faction={newAgent.faction}></FactionDisp>
                {(newAgent.ships || []).map((ship) => (
                  <ShipDisp ship={ship}></ShipDisp>
                ))}
                <ContractDisp contract={newAgent.contract}></ContractDisp>
              </Flex>
            </Card>,
          ]}
        />
      )}
    </div>
  );
}

export default CreateAgent;
