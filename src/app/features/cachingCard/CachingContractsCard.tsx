import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import CachingCard from "../disp/CachingCardDisp";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type { Contract } from "../../spaceTraderAPI/api";
import { CacheController } from "../../spaceTraderAPI/CacheController";
import {
  selectContracts,
  putContracts,
  clearContracts,
} from "../../spaceTraderAPI/redux/contractSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import { store } from "../../store";
import { selectAgent } from "../../spaceTraderAPI/redux/agentSlice";
import { selectAgentSymbol } from "../../spaceTraderAPI/redux/configSlice";
import { message } from "../../utils/antdMessage";

const CachingContractsCard = () => {
  const dispatch = useAppDispatch();
  const cachedContracts = useAppSelector(selectContracts);
  const agentSymbol = useAppSelector(selectAgentSymbol);
  const agent = useAppSelector((state) => selectAgent(state, agentSymbol));

  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [remainingTime, setRemainingTime] = useState(0);
  const [total, setTotal] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const cacheControllerRef = useRef<CacheController<Contract>>();

  useEffect(() => {
    // todo rewite use setfunction
    cacheControllerRef.current = new CacheController<Contract>(
      (page, limit, options) => {
        return spaceTraderClient.ContractsClient.getContracts(
          page,
          limit,
          options,
        );
      },
      (contracts) => {
        if (agent?.agent.symbol) {
          store.dispatch(
            putContracts(
              contracts.map((c) => {
                return {
                  agentSymbol: agent?.agent.symbol,
                  contract: c,
                };
              }),
            ),
          );
        } else {
          message.error("Agent not found");
        }
      },
    );
    return () => {
      cacheControllerRef.current?.cancel();
    };
  }, [agent?.agent.symbol]);

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
