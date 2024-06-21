import { useState } from "react";
import { Button, List, Progress, Spin } from "antd";
import spaceTraderClient from "../../app/spaceTraderAPI/spaceTraderClient";
import {
  clearSystems,
  selectSystems,
} from "../../app/spaceTraderAPI/redux/systemSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

function Caching() {
  const [totalSystemsCount, setTotalSystemsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [systemLogs, setSystemsLogs] = useState<
    {
      progress: number;
      total: number;
      timestamp: Date;
    }[]
  >([]);

  const dispatch = useAppDispatch();
  const systems = useAppSelector(selectSystems);

  const updateSystems = () => {
    setLoading(true);
    console.log("Starting Caching");

    spaceTraderClient.CrawlClient.cacheSystems((progress, total) => {
      console.log(systemLogs);
      const sysLog = systemLogs;
      sysLog.push({ progress, total, timestamp: new Date() });
      setSystemsLogs(sysLog);
      console.log({ progress, total, timestamp: new Date() });
      setTotalSystemsCount(total);
    }).then(() => {
      setLoading(false);
      console.log("Caching Complete");
    });
  };

  return (
    <div>
      <h1>Caching</h1>
      Cached Systems: {systems.length}/{totalSystemsCount} <br />
      <Button onClick={updateSystems}>Update Systems</Button>
      <Spin spinning={loading}></Spin>
      <br />
      <Button
        onClick={() => {
          dispatch(clearSystems());
        }}
      >
        Clear Systems
      </Button>
      <Progress
        percent={Math.round((systems.length / totalSystemsCount) * 1000) / 10}
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
