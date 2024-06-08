import { useState } from "react";
import spaceTraderClient from "../../spaceTraderClient";
import { FactionSymbol, Register201ResponseData } from "../../components/api";
import AgentDisp from "../../components/disp/AgentDisp";
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  FormProps,
  Input,
  Select,
  Space,
  Typography,
} from "antd";
import ShipDisp from "../../components/disp/ship/ShipDisp";
import FactionDisp from "../../components/disp/FactionDisp";
import ContractDisp from "../../components/disp/ContractDisp";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

function NewAgent() {
  const [newAgent, setNewAgent] = useState<Register201ResponseData | null>(
    null
  );

  type FieldType = {
    callsign: string;
    email?: string;
    faction: FactionSymbol;
  };

  const { Text } = Typography;

  const [form] = Form.useForm();

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
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
      }
    ).then((answer) => {
      console.log(answer);
      setNewAgent(answer.data.data);
    });
  };

  return (
    <div>
      <h2>Create NewAgent</h2>
      <Form
        {...layout}
        form={form}
        onFinish={onFinish}
        name="control-hooks"
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
        </Card>
      )}
    </div>
  );
}

export default NewAgent;
