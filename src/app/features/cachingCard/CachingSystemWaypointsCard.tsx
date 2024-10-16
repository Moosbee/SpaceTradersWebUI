import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type { Waypoint } from "../../spaceTraderAPI/api";
import { CacheController } from "../../spaceTraderAPI/CacheController";
import {
  clearSystemWaypoints,
  putWaypoints,
  selectSystemWaypoints,
} from "../../spaceTraderAPI/redux/waypointSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import { store } from "../../store";
import CachingCard from "../disp/CachingCardDisp";

const CachingSystemWaypointsCard = ({
  systemSymbol,
}: {
  systemSymbol: string;
}) => {
  const dispatch = useAppDispatch();
  const cachedWaypoints = Object.values(
    useAppSelector((state) => selectSystemWaypoints(state, systemSymbol)),
  );

  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [remainingTime, setRemainingTime] = useState(0);
  const [total, setTotal] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const cacheControllerRef = useRef<CacheController<Waypoint>>();

  useEffect(() => {
    cacheControllerRef.current = new CacheController<Waypoint>(
      (page, limit, options) => {
        return spaceTraderClient.SystemsClient.getSystemWaypoints(
          systemSymbol,
          page,
          limit,
          undefined,
          undefined,
          {
            ...options,
            transformRequest: (data, headers) => {
              delete headers["Authorization"];
              return data;
            },
          },
        ).then((response) => response.data);
      },
      (waypoints) => {
        store.dispatch(putWaypoints({ systemSymbol, waypoints }));
      },
    );
    return () => {
      console.log("CachingSystemWaypointsCard unmounting");

      cacheControllerRef.current?.cancel();
    };
  }, [systemSymbol]);

  const startFetching = useCallback(() => {
    setStartTime(Date.now());
    setLoading(true);
    dispatch(clearSystemWaypoints({ systemSymbol }));
    cacheControllerRef.current?.reset();
    setRemainingTime(0);

    cacheControllerRef.current
      ?.fetchAll((currentProgress, totalItems) => {
        setTotal(totalItems);
        if (totalItems === 0) return;

        const elapsedTime = Date.now() - startTime;
        const totalCachingDuration =
          elapsedTime / (currentProgress / totalItems);
        const remainingTime = totalCachingDuration - elapsedTime;
        setRemainingTime(remainingTime);
      })
      .then(() => {
        setLoading(false);
        cacheControllerRef.current?.reset();
      });
  }, [dispatch, startTime, systemSymbol]);

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

    setIsPaused(false);
    setLoading(false);
    setRemainingTime(0);
  }, []);

  const remainingTimeString = useMemo(() => {
    if (!loading) return "0 s";
    const remainingSeconds = Math.floor(remainingTime / 1000);
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    return `${hours > 0 ? `${hours} h ` : ""}${minutes > 0 ? `${minutes} min ` : ""}${seconds} s`;
  }, [loading, remainingTime]);

  return (
    <CachingCard
      progress={cachedWaypoints.length}
      loading={loading}
      isPaused={isPaused}
      total={total}
      remainingTimeString={remainingTimeString}
      title={`Caching ${systemSymbol} waypoints`}
      startFetching={startFetching}
      pauseFetching={pauseFetching}
      continueFetching={continueFetching}
      cancelFetching={cancelFetching}
      clearSystems={() => dispatch(clearSystemWaypoints({ systemSymbol }))}
    />
  );
};

export default CachingSystemWaypointsCard;
