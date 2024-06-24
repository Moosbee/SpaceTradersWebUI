import { Card, Flex, Space, Button, Spin, Progress } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  clearSystems,
  putSystems,
  selectSystems,
} from "../../app/spaceTraderAPI/redux/systemSlice";
import spaceTraderClient from "../../app/spaceTraderAPI/spaceTraderClient";
import { CacheController } from "../../app/spaceTraderAPI/CacheController";
import type { System } from "../../app/spaceTraderAPI/api";
import { PauseOutlined } from "@ant-design/icons";
import { store } from "../../app/store";

const CachingSystemsCard = () => {
  const dispatch = useAppDispatch();
  const cachedSystems = useAppSelector(selectSystems);

  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [remainingTime, setRemainingTime] = useState(0);

  const [total, setTotal] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const cacheControllerRef = useRef<CacheController<System>>();

  // Initialize CacheController
  useEffect(() => {
    cacheControllerRef.current = new CacheController<System>(
      spaceTraderClient.SystemsClient.getSystems,
      (systems) => {
        store.dispatch(putSystems(systems));
      },
    );
    return () => {
      cacheControllerRef.current?.cancel(); // Cleanup on component unmount
    };
  }, []);

  const startFetching = useCallback(() => {
    setStartTime(Date.now());
    setLoading(true);
    cacheControllerRef.current
      ?.fetchAll((currentProgress, totalItems) => {
        setTotal(totalItems);

        console.log("Caching progress", {
          currentProgress,
          totalItems,
          timestamp: new Date(),
        });

        if (totalItems === 0) {
          return;
        }

        const elapsedTime = Date.now() - startTime;

        // Step 2: Calculate the total duration
        const totalCachingDuration =
          elapsedTime / (currentProgress / totalItems);

        // Step 3: Calculate the remaining time
        const remainingTime = totalCachingDuration - elapsedTime;
        setRemainingTime(remainingTime);
      })
      .then(() => {
        setLoading(false);
        console.log("Caching complete");
      });
  }, [startTime]);

  const pauseFetching = useCallback(() => {
    cacheControllerRef.current?.pause();
    setIsPaused(true);
  }, []);

  const continueFetching = useCallback(() => {
    cacheControllerRef.current?.continue();
    setIsPaused(false);
  }, []);

  const cancelFetching = useCallback(() => {
    cacheControllerRef.current?.cancel();
    setLoading(false);
    console.log("Cancelled caching");
  }, []);

  // promise

  const remainingTimeString = useMemo(() => {
    // Convert the remaining time to a readable format (hours, minutes, seconds)
    const remainingSeconds = Math.floor(remainingTime / 1000);
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    return `${hours > 0 ? `${hours} h ` : ""}${minutes > 0 ? `${minutes} min` : ""} ${seconds} s`;
  }, [remainingTime]);

  return (
    <Card
      style={{ width: "fit-content", textAlign: "center" }}
      title="Cache Systems"
    >
      <Flex vertical gap={8}>
        <Spin spinning={loading}></Spin>
        <Space>
          {loading ? null : <Button onClick={startFetching}>Update</Button>}
          {!(loading && !isPaused) ? null : (
            <Button onClick={pauseFetching}>Pause</Button>
          )}
          {!(loading && isPaused) ? null : (
            <Button onClick={continueFetching}>Continue</Button>
          )}
          {!loading ? null : <Button onClick={cancelFetching}>Cancel</Button>}
          {loading ? null : (
            <Button onClick={() => dispatch(clearSystems())}>Clear</Button>
          )}
        </Space>
        <br />
        {!isPaused && (
          <Progress
            percent={Math.round((cachedSystems.length / total) * 1000) / 10}
            type="circle"
          />
        )}
        {isPaused && (
          <Progress
            percent={Math.round((cachedSystems.length / total) * 1000) / 10}
            type="circle"
            format={() => <PauseOutlined />}
          />
        )}
        <span>
          Cached Items: {cachedSystems.length}/{total}
        </span>
        <span>Time Remaining: {remainingTimeString}</span>
      </Flex>
    </Card>
  );
};

export default CachingSystemsCard;
