import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { message, Upload } from "antd";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import { selectAgents, setAgents } from "../../spaceTraderAPI/redux/agentSlice";
import { useAppDispatch, useAppSelector } from "../../hooks";

interface FileAgent {
  symbol: string;
  token: string;
}

const parseAgents = (text: string): Promise<FileAgent[]> => {
  return new Promise((resolve, reject) => {
    const agents: FileAgent[] = JSON.parse(text);

    // Additional runtime validation
    if (!Array.isArray(agents)) {
      reject(new Error("Parsed data is not an array"));
      return;
    }

    for (const agent of agents) {
      if (typeof agent.symbol !== "string" || typeof agent.token !== "string") {
        reject(new Error("Invalid agent object"));
        return;
      }
    }

    resolve(agents);
  });
};

function UploadAgent() {
  const dispatch = useAppDispatch();
  const useAgents = useAppSelector(selectAgents);

  const props: UploadProps = {
    multiple: false,

    customRequest: ({ file, onSuccess, onError, onProgress }) => {
      if (!onError) return;
      if (!onSuccess) {
        onError(new Error("no onSuccess"));
        return;
      }
      if (!onProgress) {
        onError(new Error("no onProgress"));
        return;
      }
      if (!file) {
        onError(new Error("no file"));
        return;
      }

      if (file instanceof File) {
        file
          .text()
          .then((text) => {
            onProgress({ percent: 5 });
            return parseAgents(text);
          })
          .then((agents) => {
            console.log("agents", agents);
            onProgress({ percent: 10 });
            let count = 0;
            let all = agents.length;
            return Promise.all(
              agents
                .concat(
                  useAgents.map((agent) => ({
                    symbol: agent.agent.symbol,
                    token: agent.token,
                  })),
                )
                .reduce((acc, cur) => {
                  // Remove duplicates
                  if (!acc.find((item) => item.token === cur.token)) {
                    acc.push(cur);
                  } else {
                    message.warning("Duplicated agent: " + cur.symbol);
                  }
                  return acc;
                }, [] as FileAgent[])
                .map(async (agent) => {
                  const response =
                    await spaceTraderClient.AgentsClient.getMyAgent({
                      transformRequest: (data_1, headers) => {
                        headers["Authorization"] = `Bearer ${agent.token}`;
                        return data_1;
                      },
                    });
                  count++;
                  onProgress({
                    percent: 10 + (((count * 100) / all) * 90) / 100,
                  });
                  if (response.status === 200) {
                    return {
                      agent: response.data.data,
                      token: agent.token,
                    };
                  } else {
                    message.warning("Failed to revalidate " + agent.symbol);
                    return undefined;
                  }
                }),
            );
          })
          .then((data) => {
            dispatch(
              setAgents(
                data
                  .filter((agent) => agent !== undefined)
                  .map((agent) => agent!),
              ),
            );
            message.success("Upload success");
            onSuccess("ok");
          })
          .catch((error) => {
            onError(
              new Error("Failed to parse agents: " + error + " " + error.stack),
              error.message,
            );
          });
      }
    },

    showUploadList: false,
  };
  return (
    <div style={{ maxWidth: 600 }}>
      <h2>Upload Agent</h2>
      <Upload.Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag agent file here</p>
      </Upload.Dragger>
    </div>
  );
}

export default UploadAgent;
