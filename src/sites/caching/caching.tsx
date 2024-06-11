import { useEffect, useState } from "react";
import spaceTraderClient from "../../utils/spaceTraderClient";
import { Button, List, Spin } from "antd";

function Caching() {
  const [systemsCount, setSystemsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [systemLog, setSystemsLog] = useState<
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
    spaceTraderClient.LocalCache.cacheSystems((progress, total) => {
      setSystemsLog([...systemLog, { progress, total, timestamp: new Date() }]);
      console.log({ progress, total, timestamp: new Date() });
    }).then(() => {
      setLoading(false);
    });
  };

  return (
    <div>
      <h1>Caching</h1>
      Cached Systems: {systemsCount}
      <Button onClick={updateSystems}>Update Systems</Button>
      <Spin spinning={loading}></Spin>
      <List
        dataSource={systemLog}
        renderItem={(item) => (
          <List.Item>
            {item.timestamp.toLocaleString()} - {item.progress} / {item.total}
          </List.Item>
        )}
      ></List>
    </div>
  );
}

export default Caching;
