import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type { Market } from "../../spaceTraderAPI/api";
import { CacheController } from "../../spaceTraderAPI/CacheController";
import {
  clearSystemMarkets,
  putMarkets,
  selectSystemWaypoints,
} from "../../spaceTraderAPI/redux/waypointSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import { store } from "../../store";
import CachingCard from "../disp/CachingCardDisp";

const CachingSystemMarketsCard = ({
  systemSymbol,
}: {
  systemSymbol: string;
}) => {
  const waypoints = useAppSelector((state) =>
    selectSystemWaypoints(state, systemSymbol),
  );
  const cachedMarkets = Object.values(waypoints)
    .map((w) => w.market)
    .filter((w) => !!w);

  const dispatch = useAppDispatch();

  const [marketList, setMarketList] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [remainingTime, setRemainingTime] = useState(0);
  const total = marketList.length;
  const [isPaused, setIsPaused] = useState(false);
  const cacheMarketControllerRef = useRef<CacheController<Market>>();

  useEffect(() => {
    if (loading) return;
    setMarketList(
      Object.values(waypoints)
        .filter((w) =>
          w.waypoint.traits.some((t) => t.symbol === "MARKETPLACE"),
        )
        .map((w) => w.waypoint.symbol),
    );
  }, [loading, waypoints]);

  useEffect(() => {
    cacheMarketControllerRef.current = new CacheController<Market>(
      async (page, limit, options) => {
        if (page > marketList.length) {
          return {
            data: [],
            meta: {
              total: marketList.length,
              page: page - 1,
              limit: limit,
            },
          };
        }

        const res = await spaceTraderClient.SystemsClient.getMarket(
          systemSymbol,
          marketList[page - 1],
          options,
        );
        return {
          data: [res.data.data],
          meta: {
            total: total,
            page: page - 1,
            limit: limit,
          },
        };
      },
      (markets) => {
        store.dispatch(putMarkets({ systemSymbol, markets }));
      },
      1,
    );
    return () => {
      console.log("CachingSystemMarketsCard unmounting");
      cacheMarketControllerRef.current?.cancel();
    };
  }, [marketList, systemSymbol, total]);

  const startFetching = useCallback(() => {
    setStartTime(Date.now());
    setLoading(true);
    dispatch(clearSystemMarkets({ systemSymbol }));
    cacheMarketControllerRef.current?.reset();
    setRemainingTime(0);

    cacheMarketControllerRef.current
      ?.fetchAll((currentProgress, totalItems) => {
        if (totalItems === 0) return;

        const elapsedTime = Date.now() - startTime;
        const totalCachingDuration =
          elapsedTime / (currentProgress / totalItems);
        const remainingTime = totalCachingDuration - elapsedTime;
        setRemainingTime(remainingTime);
      })
      .then(() => {
        setLoading(false);
        cacheMarketControllerRef.current?.reset();
      });
  }, [dispatch, startTime, systemSymbol]);

  const pauseFetching = useCallback(() => {
    cacheMarketControllerRef.current?.pause();
    setIsPaused(true);
  }, []);

  const continueFetching = useCallback(() => {
    cacheMarketControllerRef.current?.continue();
    setIsPaused(false);
  }, []);

  const cancelFetching = useCallback(() => {
    cacheMarketControllerRef.current?.cancel();

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
      progress={cachedMarkets.length}
      loading={loading}
      isPaused={isPaused}
      total={total}
      remainingTimeString={remainingTimeString}
      title={`Caching ${systemSymbol} Markets`}
      startFetching={startFetching}
      pauseFetching={pauseFetching}
      continueFetching={continueFetching}
      cancelFetching={cancelFetching}
      clearSystems={() => dispatch(clearSystemMarkets({ systemSymbol }))}
    />
  );
};

export default CachingSystemMarketsCard;
