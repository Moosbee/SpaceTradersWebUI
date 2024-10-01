import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type { Shipyard } from "../../spaceTraderAPI/api";
import { CacheController } from "../../spaceTraderAPI/CacheController";
import {
  clearSystemShipyards,
  putShipyards,
  selectSystemWaypoints,
} from "../../spaceTraderAPI/redux/waypointSlice";
import spaceTraderClient from "../../spaceTraderAPI/spaceTraderClient";
import { store } from "../../store";
import CachingCard from "../disp/CachingCardDisp";

const CachingSystemShipyardsCard = ({
  systemSymbol,
}: {
  systemSymbol: string;
}) => {
  const waypoints = useAppSelector((state) =>
    selectSystemWaypoints(state, systemSymbol),
  );
  const cachedShipyards = Object.values(waypoints)
    .map((w) => w.shipyard)
    .filter((w) => !!w);

  const dispatch = useAppDispatch();

  const [shipyardList, setShipyardList] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [remainingTime, setRemainingTime] = useState(0);
  const total = shipyardList.length;
  const [isPaused, setIsPaused] = useState(false);
  const cacheShipControllerRef = useRef<CacheController<Shipyard>>();

  useEffect(() => {
    if (loading) return;
    setShipyardList(
      Object.values(waypoints)
        .filter((w) => w.waypoint.traits.some((t) => t.symbol === "SHIPYARD"))
        .map((w) => w.waypoint.symbol),
    );
  }, [loading, waypoints]);

  useEffect(() => {
    cacheShipControllerRef.current = new CacheController<Shipyard>(
      async (page, limit, options) => {
        if (page > shipyardList.length) {
          return {
            data: [],
            meta: {
              total: shipyardList.length,
              page: page - 1,
              limit: limit,
            },
          };
        }

        const data = await spaceTraderClient.SystemsClient.getShipyard(
          systemSymbol,
          shipyardList[page - 1],
          options,
        );

        // await new Promise((resolve) => setTimeout(resolve, 1000));

        return {
          data: [data.data.data],
          meta: {
            total: shipyardList.length,
            page: page - 1,
            limit: limit,
          },
        };
      },
      (shipyards) => {
        store.dispatch(putShipyards({ systemSymbol, shipyards }));
      },
      1,
    );
    return () => {
      console.log("CachingSystemShipyardsCard unmounting");

      cacheShipControllerRef.current?.cancel();
    };
  }, [shipyardList, systemSymbol]);

  const startFetching = useCallback(() => {
    setStartTime(Date.now());
    setLoading(true);
    dispatch(clearSystemShipyards({ systemSymbol }));
    cacheShipControllerRef.current?.reset();
    setRemainingTime(0);

    cacheShipControllerRef.current
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
        cacheShipControllerRef.current?.reset();
      });
  }, [dispatch, startTime, systemSymbol]);

  const pauseFetching = useCallback(() => {
    cacheShipControllerRef.current?.pause();
    setIsPaused(true);
  }, []);

  const continueFetching = useCallback(() => {
    cacheShipControllerRef.current?.continue();
    setIsPaused(false);
  }, []);

  const cancelFetching = useCallback(() => {
    cacheShipControllerRef.current?.cancel();

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
      progress={cachedShipyards.length}
      loading={loading}
      isPaused={isPaused}
      total={total}
      remainingTimeString={remainingTimeString}
      title={`Caching ${systemSymbol} shipyards`}
      startFetching={startFetching}
      pauseFetching={pauseFetching}
      continueFetching={continueFetching}
      cancelFetching={cancelFetching}
      clearSystems={() => dispatch(clearSystemShipyards({ systemSymbol }))}
    />
  );
};

export default CachingSystemShipyardsCard;
