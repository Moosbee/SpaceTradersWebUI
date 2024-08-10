import type { FormProps } from "antd";
import { Form, Typography, Input, Space, Button, Result, Card } from "antd";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import AgentDisp from "../disp/AgentDisp";
import { useState } from "react";
import { useAppDispatch } from "../../hooks";
import type { Agent } from "../../spaceTraderAPI/api";
import { addAgent, setMyAgent } from "../../spaceTraderAPI/redux/agentSlice";
import { setAgentSymbol } from "../../spaceTraderAPI/redux/configSlice";

type addAgentType = {
  token: string;
};
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
function AddAgent() {
  const [addForm] = Form.useForm<addAgentType>();

  const dispatch = useAppDispatch();

  const [agent, setAgent] = useState<Agent | null>(null);

  const [callsign, setCallsign] = useState("");

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
      dispatch(addAgent({ agent: answer.data.data, token: values.token }));
      dispatch(setAgentSymbol(answer.data.data.symbol));
      dispatch(setMyAgent(answer.data.data));
    });
  };

  return (
    <div>
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
    </div>
  );
}

export default AddAgent;
