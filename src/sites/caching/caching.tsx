import { useEffect, useState } from "react";
import { Button, List, Progress, Spin } from "antd";
import spaceTraderClient from "../../app/spaceTraderAPI/spaceTraderClient";

function Caching() {
  const [systemsCount, setSystemsCount] = useState(0);
  const [totalSystemsCount, setTotalSystemsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [systemLogs, setSystemsLogs] = useState<
    {
      progress: number;
      total: number;
      timestamp: Date;
    }[]
  >([]);

  useEffect(() => {
    console.log("Caching");
    spaceTraderClient.LocalCache.getSystems().then((response) => {
      setSystemsCount(response.length);
      console.log(response);
    });
  }, []);

  const updateSystems = () => {
    setLoading(true);
    console.log("Starting Caching");

    spaceTraderClient.LocalCache.cacheSystems((progress, total) => {
      console.log(systemLogs);
      const sysLog = systemLogs;
      sysLog.push({ progress, total, timestamp: new Date() });
      setSystemsLogs(sysLog);
      console.log({ progress, total, timestamp: new Date() });
      setSystemsCount(progress);
      setTotalSystemsCount(total);
    }).then(() => {
      setLoading(false);
      console.log("Caching Complete");
    });
  };

  return (
    <div>
      <h1>Caching</h1>
      Cached Systems: {systemsCount}/{totalSystemsCount} <br />
      <Button onClick={updateSystems}>Update Systems</Button>
      <Spin spinning={loading}></Spin>
      <br />
      <Button
        onClick={() => {
          spaceTraderClient.LocalCache.clearSystems();
          setSystemsCount(0);
        }}
      >
        Clear Systems
      </Button>
      <Button
        onClick={() => {
          console.log(
            spaceTraderClient.LocalCache.getSystemByWaypoint("X1-J36-A1"),
          );
        }}
      >
        Printsystems
      </Button>
      <Progress
        percent={Math.round((systemsCount / totalSystemsCount) * 1000) / 10}
      />
      <List
        dataSource={systemLogs.reverse().map((item) => (
          <List.Item key={item.timestamp.toISOString()}>
            {item.timestamp.toLocaleString()} - {item.progress} / {item.total}
          </List.Item>
        ))}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      ></List>
    </div>
  );
}

export default Caching;
