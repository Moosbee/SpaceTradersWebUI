import type { FormProps } from "antd";
import {
  Form,
  Input,
  Select,
  Space,
  Button,
  Result,
  Card,
  Divider,
  Flex,
  Typography,
} from "antd";
import AgentDisp from "../disp/AgentDisp";
import ContractDisp from "../disp/ContractDisp";
import FactionDisp from "../disp/FactionDisp";
import ShipDisp from "../disp/ship/ShipDisp";
import { addAgent, setMyAgent } from "../../spaceTraderAPI/redux/agentSlice";
import { putContract } from "../../spaceTraderAPI/redux/contractSlice";
import { setShip } from "../../spaceTraderAPI/redux/fleetSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import { useState } from "react";
import type {
  FactionSymbol,
  Register201ResponseData,
} from "../../spaceTraderAPI/api";
import { useAppDispatch } from "../../hooks";
import { setAgentSymbol } from "../../spaceTraderAPI/redux/configSlice";

type createAgentType = {
  callsign: string;
  email?: string;
  faction: FactionSymbol;
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

    spaceTraderClient.DefaultClient.register(
      {
        symbol: values.callsign,
        faction: values.faction,
        email: values.email,
      },
      {
        transformRequest: (data, headers) => {
          delete headers["Authorization"];
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
      dispatch(setShip(answer.data.data.ship));
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
          name="callsign"
          label="Callsign"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter a Callsign" />
        </Form.Item>
        <Form.Item
          name="email"
          label="E-Mail"
          rules={[
            {
              type: "email",
              message: "The input is not valid E-mail!",
            },
          ]}
        >
          <Input placeholder="Enter a E-Mail" />
        </Form.Item>
        <Form.Item name="faction" label="Faction" rules={[{ required: true }]}>
          <Select
            placeholder="Select a faction"
            allowClear
            options={[
              { value: "COSMIC", label: "COSMIC" },
              { value: "VOID", label: "VOID" },
              { value: "GALACTIC", label: "GALACTIC" },
              { value: "QUANTUM", label: "QUANTUM" },
              { value: "DOMINION", label: "DOMINION" },
              { value: "ASTRO", label: "ASTRO" },
              { value: "CORSAIRS", label: "CORSAIRS" },
              { value: "OBSIDIAN", label: "OBSIDIAN" },
              { value: "AEGIS", label: "AEGIS" },
              { value: "UNITED", label: "UNITED" },
              { value: "SOLITARY", label: "SOLITARY" },
              { value: "COBALT", label: "COBALT" },
              { value: "OMEGA", label: "OMEGA" },
              { value: "ECHO", label: "ECHO" },
              { value: "LORDS", label: "LORDS" },
              { value: "CULT", label: "CULT" },
              { value: "ANCIENTS", label: "ANCIENTS" },
              { value: "SHADOW", label: "SHADOW" },
              { value: "ETHEREAL", label: "ETHEREAL" },
            ]}
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
                <ShipDisp ship={newAgent.ship}></ShipDisp>
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
