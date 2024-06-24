import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import spaceTraderClient from "../../app/spaceTraderAPI/spaceTraderClient";
import { CacheController } from "../../app/spaceTraderAPI/CacheController";
import type { Contract } from "../../app/spaceTraderAPI/api";
import { store } from "../../app/store";
import {
  clearContracts,
  putContracts,
  selectContracts,
} from "../../app/spaceTraderAPI/redux/contractSlice";
import CachingCard from "../disp/CachingCardDisp";

const CachingContractsCard = () => {
  const dispatch = useAppDispatch();
  const cachedContracts = useAppSelector(selectContracts);

  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [remainingTime, setRemainingTime] = useState(0);
  const [total, setTotal] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const cacheControllerRef = useRef<CacheController<Contract>>();

  useEffect(() => {
    cacheControllerRef.current = new CacheController<Contract>(
      (page, limit, options) => {
        return spaceTraderClient.ContractsClient.getContracts(
          page,
          limit,
          options,
        );
      },
      (contracts) => {
        store.dispatch(putContracts(contracts));
      },
    );
    return () => {
      cacheControllerRef.current?.cancel();
    };
  }, []);

  const startFetching = useCallback(() => {
    setStartTime(Date.now());
    setLoading(true);
    dispatch(clearContracts());
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
  }, [dispatch, startTime]);

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
      progress={cachedContracts.length}
      loading={loading}
      isPaused={isPaused}
      total={total}
      remainingTimeString={remainingTimeString}
      title="Cache Contracts"
      startFetching={startFetching}
      pauseFetching={pauseFetching}
      continueFetching={continueFetching}
      cancelFetching={cancelFetching}
      clearSystems={() => dispatch(clearContracts())}
    />
  );
};

export default CachingContractsCard;
