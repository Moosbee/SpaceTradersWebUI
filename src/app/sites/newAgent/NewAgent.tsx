import { useState } from "react";
import type {
  Agent,
  FactionSymbol,
  Register201ResponseData,
} from "../../spaceTraderAPI/api";
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
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import AgentDisp from "../../features/disp/AgentDisp";
import ContractDisp from "../../features/disp/ContractDisp";
import FactionDisp from "../../features/disp/FactionDisp";
import ShipDisp from "../../features/disp/ship/ShipDisp";
import { addAgent, setMyAgent } from "../../spaceTraderAPI/redux/agentSlice";
import { useAppDispatch } from "../../hooks";
import { setShip } from "../../spaceTraderAPI/redux/fleetSlice";
import { putContract } from "../../spaceTraderAPI/redux/contractSlice";
import { setAgentToken } from "../../spaceTraderAPI/redux/configSlice";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

function NewAgent() {
  const [newAgent, setNewAgent] = useState<Register201ResponseData | null>(
    null,
  );
  const [agent, setAgent] = useState<Agent | null>(null);

  const [callsign, setCallsign] = useState("");

  type createAgentType = {
    callsign: string;
    email?: string;
    faction: FactionSymbol;
  };
  type addAgentType = {
    token: string;
  };

  const { Text } = Typography;

  const [createForm] = Form.useForm<createAgentType>();
  const [addForm] = Form.useForm<addAgentType>();

  const dispatch = useAppDispatch();

  const onAdd: FormProps<addAgentType>["onFinish"] = (values) => {
    console.log("Success:", values);
    spaceTraderClient.AgentsClient.getMyAgent({
      transformRequest: (data, headers) => {
        headers["Authorization"] = `Bearer ${values.token}`;
        return data;
      },
    }).then((answer) => {
      console.log(answer);
      setAgent(answer.data.data);
      setCallsign(answer.data.data.symbol);
      dispatch(
        addAgent({ symbol: answer.data.data.symbol, token: values.token }),
      );
      dispatch(setAgentToken(values.token));
      dispatch(setMyAgent(answer.data.data));
    });
  };

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
      dispatch(setAgentToken(answer.data.data.token));
      dispatch(
        addAgent({
          symbol: answer.data.data.agent.symbol,
          token: answer.data.data.token,
        }),
      );
      dispatch(setMyAgent(answer.data.data.agent));
      dispatch(putContract({ contract: answer.data.data.contract }));
      dispatch(setShip(answer.data.data.ship));
    });
  };

  return (
    <div style={{ padding: "24px 24px" }}>
      <h2>Add Agent</h2>
      <Form
        {...layout}
        form={addForm}
        onFinish={onAdd}
        name="addAgent"
        style={{ maxWidth: 600 }}
      >
        {callsign !== "" && (
          <Typography>
            <pre>Name: {callsign}</pre>
          </Typography>
        )}
        <Form.Item
          name="token"
          label="Token"
          validateDebounce={1000}
          rules={[
            { required: true },
            {
              message: "This is not a valid token",
              validator: async (rule, value) => {
                console.log("value", value);
                const resp = await spaceTraderClient.AgentsClient.getMyAgent({
                  transformRequest: (data, headers) => {
                    headers["Authorization"] = `Bearer ${value}`;
                    return data;
                  },
                });
                setCallsign(resp.data.data.symbol);
                console.log("resp", resp);
              },
            },
          ]}
        >
          <Input placeholder="Enter the agent token" />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Space>
            <Button type="primary" htmlType="submit">
              Add
            </Button>
            <Button htmlType="button">Reset</Button>
          </Space>
        </Form.Item>
      </Form>
      {agent && (
        <Result
          status="success"
          title="Successfully Registered"
          subTitle="Agent Created"
          extra={[
            <Card title="New Agent">
              <AgentDisp agent={agent}></AgentDisp>
            </Card>,
          ]}
        />
      )}
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

export default NewAgent;
