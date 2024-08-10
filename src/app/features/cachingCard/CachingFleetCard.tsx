import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import CachingCard from "../disp/CachingCardDisp";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type { Ship } from "../../spaceTraderAPI/api";
import { CacheController } from "../../spaceTraderAPI/CacheController";
import {
  selectShips,
  addShips,
  clearShips,
  clearAgentShips,
} from "../../spaceTraderAPI/redux/fleetSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import { store } from "../../store";
import { selectAgentSymbol } from "../../spaceTraderAPI/redux/configSlice";

const CachingFleetCard = () => {
  const dispatch = useAppDispatch();
  const agentSymbol = useAppSelector(selectAgentSymbol);
  const cachedAllFleet = useAppSelector(selectShips);

  const cachedFleet = useMemo(() => {
    if (!agentSymbol) return cachedAllFleet;
    return cachedAllFleet.filter((value) =>
      value.symbol.startsWith(agentSymbol),
    );
  }, [cachedAllFleet, agentSymbol]);

  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [remainingTime, setRemainingTime] = useState(0);
  const [total, setTotal] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const cacheControllerRef = useRef<CacheController<Ship>>();

  useEffect(() => {
    cacheControllerRef.current = new CacheController<Ship>(
      (page, limit, options) => {
        return spaceTraderClient.FleetClient.getMyShips(page, limit, options);
      },
      (systems) => {
        store.dispatch(addShips(systems));
      },
    );
    return () => {
      cacheControllerRef.current?.cancel();
    };
  }, []);

  const startFetching = useCallback(() => {
    setStartTime(Date.now());
    setLoading(true);
    if (agentSymbol) {
      dispatch(clearAgentShips(agentSymbol));
    } else {
      dispatch(clearShips());
    }
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
  }, [agentSymbol, dispatch, startTime]);

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
      progress={cachedFleet.length}
      loading={loading}
      isPaused={isPaused}
      total={total}
      remainingTimeString={remainingTimeString}
      title="Cache Fleet"
      startFetching={startFetching}
      pauseFetching={pauseFetching}
      continueFetching={continueFetching}
      cancelFetching={cancelFetching}
      clearSystems={() => dispatch(clearShips())}
    />
  );
};

export default CachingFleetCard;
