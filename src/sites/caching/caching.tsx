import { useState } from "react";
import { Button, Card, Flex, Progress, Space, Spin } from "antd";
import spaceTraderClient from "../../app/spaceTraderAPI/spaceTraderClient";
import {
  clearSystems,
  selectSystems,
} from "../../app/spaceTraderAPI/redux/systemSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

function Caching() {
  const [totalSystemsCount, setTotalSystemsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [remainingTime, setRemainingTime] = useState("");

  const dispatch = useAppDispatch();
  const systems = useAppSelector(selectSystems);

  const updateSystems = () => {
    setLoading(true);
    setStartTime(Date.now());
    console.log("Starting Caching");

    spaceTraderClient.CrawlClient.cacheSystems((progress, total) => {
      console.log("prog", { progress, total, timestamp: new Date() });
      setTotalSystemsCount(total);

      if (total === 0) {
        return;
      }

      const elapsedTime = Date.now() - startTime;

      // Step 2: Calculate the total duration
      const totalDuration = elapsedTime / (progress / total);

      // Step 3: Calculate the remaining time
      const remainingTime = totalDuration - elapsedTime;

      // Convert the remaining time to a readable format (hours, minutes, seconds)
      const remainingSeconds = Math.floor(remainingTime / 1000);
      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;

      setRemainingTime(
        `${hours > 0 ? `${hours} h ` : ""}${minutes > 0 ? `${minutes}` : ""} min ${seconds} s`,
      );
    }).then(() => {
      setLoading(false);
      console.log("Caching Complete");
    });
  };

  return (
    <div>
      <h1>Caching</h1>
      <Card
        style={{ width: "fit-content", textAlign: "center" }}
        title="Cache Systems"
      >
        <Flex vertical gap={8}>
          <Space>
            <Button onClick={updateSystems}>Update Systems</Button>
            <Spin spinning={loading}></Spin>
            <Button
              onClick={() => {
                dispatch(clearSystems());
              }}
            >
              Clear Systems
            </Button>
          </Space>
          <br />
          <Progress
            percent={
              Math.round((systems.length / totalSystemsCount) * 1000) / 10
            }
            type="circle"
          />
          <span>
            Cached Systems: {systems.length}/{totalSystemsCount}
          </span>
          <span>Time Remaining: {remainingTime}</span>
        </Flex>
      </Card>
    </div>
  );
}

export default Caching;
