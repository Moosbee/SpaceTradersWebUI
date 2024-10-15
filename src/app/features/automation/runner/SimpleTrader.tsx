import {
  Badge,
  Button,
  Card,
  Descriptions,
  Divider,
  Flex,
  InputNumber,
  Select,
  Space,
  Switch,
  Tooltip,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import type { Ship } from "../../../spaceTraderAPI/api";
import { TradeSymbol } from "../../../spaceTraderAPI/api";
import { setMyAgent } from "../../../spaceTraderAPI/redux/agentSlice";
import {
  setShipCargo,
  setShipFuel,
  setShipNav,
} from "../../../spaceTraderAPI/redux/fleetSlice";
import {
  selectSystemMarkets,
  setMarket,
} from "../../../spaceTraderAPI/redux/marketSlice";
import { addMarketTransaction } from "../../../spaceTraderAPI/redux/tansactionSlice";
import { selectSystemWaypoints } from "../../../spaceTraderAPI/redux/waypointSlice";
import spaceTraderClient from "../../../spaceTraderAPI/spaceTraderClient";
import { message } from "../../../utils/antdMessage";
import { navModes, wpShortestPath } from "../../../utils/tavelUtils";
import type { EventWorkerChannelData } from "../../../workers/eventWorker";

function SimpleTrader({ ship }: { ship: Ship }) {
  const [running, setRunning] = useState(false);

  const [tradeGood, setTradeGood] = useState<TradeSymbol | undefined>(
    undefined,
  );
  const [sourceWp, setSourceWp] = useState<string | undefined>(undefined);
  const [targetWp, setTargetWp] = useState<string | undefined>(undefined);
  const [amount, setAmount] = useState<number>(0);
  const [navMode, setNavMode] = useState<navModes>("BURN-AND-CRUISE-AND-DRIFT");
  const [notify, setNotify] = useState(true);

  const markets = useAppSelector((state) =>
    selectSystemMarkets(state, ship.nav.systemSymbol ?? ""),
  );

  const waypoints = useAppSelector((state) =>
    selectSystemWaypoints(state, ship.nav.systemSymbol ?? ""),
  );

  const filterSourceMarkets = Object.entries(markets).filter(
    ([key, w]) =>
      !tradeGood ||
      w.static.exports.some((w) => w.symbol === tradeGood) ||
      w.static.exchange.some((w) => w.symbol === tradeGood),
  );

  const filterTargetMarkets = Object.entries(markets).filter(
    ([key, w]) =>
      !tradeGood ||
      w.static.imports.some((w) => w.symbol === tradeGood) ||
      w.static.exchange.some((w) => w.symbol === tradeGood),
  );

  const filterTradeGoods = Object.values(TradeSymbol).filter((w) => {
    const source = sourceWp ? markets[sourceWp] : undefined;
    const target = targetWp ? markets[targetWp] : undefined;

    const sourceHas =
      !source ||
      source.static.exports.some((we) => we.symbol === w) ||
      source.static.exchange.some((we) => we.symbol === w);
    const targetHas =
      !target ||
      target.static.imports.some((we) => we.symbol === w) ||
      target.static.exchange.some((we) => we.symbol === w);

    return sourceHas && targetHas;
  });

  const route = useMemo(() => {
    if (!sourceWp || !targetWp || !tradeGood) {
      return undefined;
    }

    const lastSourceData =
      markets[sourceWp].tradeGoods[markets[sourceWp].tradeGoods.length - 1];
    const lastTargetData =
      markets[targetWp].tradeGoods[markets[targetWp].tradeGoods.length - 1];

    const sourceGood = lastSourceData?.tradeGoods.find(
      (w) => w.symbol === tradeGood,
    );
    const targetGood = lastTargetData?.tradeGoods.find(
      (w) => w.symbol === tradeGood,
    );

    if (!sourceGood || !targetGood) {
      return undefined;
    }

    // const amount = Math.min(
    //   ship.cargo.capacity ?? 0,
    //   Math.min(sourceGood.tradeVolume, targetGood.tradeVolume) * 2,
    // );
    const routes = wpShortestPath(
      sourceWp,
      targetWp,
      waypoints,
      navMode,
      ship,
      Math.max(0, (ship.cargo.capacity ?? 0) - amount),
    );

    const totalFuelCost = routes.reduce((acc, route) => {
      return acc + (route.fuelCost ?? 0);
    }, 0);
    const totalTravelTime =
      routes.reduce((acc, route) => {
        return acc + (route.travelTime ?? 0) + 1;
      }, 0) + 2;
    const fuelCost = ((totalFuelCost * 2) / 100) * 80;
    const totalProfit =
      targetGood.sellPrice * amount -
      (sourceGood.purchasePrice * amount + fuelCost);
    return {
      purchasePrice: sourceGood.purchasePrice,
      sellPrice: targetGood.sellPrice,
      purchaseWaypoint: sourceWp,
      sellWaypoint: targetWp,
      profit: targetGood.sellPrice - sourceGood.purchasePrice,
      purchaseVolume: sourceGood.tradeVolume,
      sellVolume: targetGood.tradeVolume,
      shipVolume: ship.cargo.capacity ?? 0,
      tripVolume: amount,
      tripFuelCost: fuelCost,
      tripTravelTime: totalTravelTime * 2,
      tripPurchaseCost: sourceGood.purchasePrice * amount,
      tripTotalCost: sourceGood.purchasePrice * amount + fuelCost,
      tripProfit: totalProfit,
      tripSellCost: targetGood.sellPrice * amount,
      tripYieldPerHour: (totalProfit / (totalTravelTime * 2)) * 60 * 60,
    };
  }, [
    markets,
    navMode,
    ship,
    sourceWp,
    targetWp,
    tradeGood,
    waypoints,
    amount,
  ]);

  const [travelTarget, setTravelTarget] = useState<"source" | "target">(
    "source",
  );

  const dispatch = useAppDispatch();

  const action = useCallback(async () => {
    if (!targetWp || !sourceWp || !route || !tradeGood) return;
    // ship has arrived at this waypoint
    const shipWp = ship.nav.waypointSymbol;
    let travelDest = travelTarget === "target" ? targetWp : sourceWp;
    console.log(
      `arrived at waypoint ${shipWp}, docking,updating market, refueling`,
    );
    const dock = await spaceTraderClient.FleetClient.dockShip(ship.symbol);
    dispatch(
      setShipNav({
        symbol: ship.symbol,
        nav: dock.data.data.nav,
      }),
    );
    const refuel = await spaceTraderClient.FleetClient.refuelShip(ship.symbol);
    dispatch(
      setShipFuel({
        symbol: ship.symbol,
        fuel: refuel.data.data.fuel,
      }),
    );
    dispatch(setMyAgent(refuel.data.data.agent));
    dispatch(addMarketTransaction(refuel.data.data.transaction));

    const market = await spaceTraderClient.SystemsClient.getMarket(
      ship.nav.systemSymbol,
      ship.nav.waypointSymbol,
    );
    dispatch(
      setMarket({
        systemSymbol: ship.nav.systemSymbol,
        market: market.data.data,
        timestamp: Date.now(),
      }),
    );

    if (shipWp === sourceWp) {
      console.log(
        "arrived at source waypoint, buying specified amount, setting travelTarget to target",
      );
      setTravelTarget("target");
      travelDest = targetWp;
      if (
        notify &&
        route.sellPrice -
          (market.data.data.tradeGoods?.find((w) => w.symbol === tradeGood)
            ?.purchasePrice ?? route.purchasePrice) <
          0
      ) {
        message.error("This route is unprofitable, stopping");
        console.log("route is unprofitable");
        new Notification("This route is unprofitable, stopping", {
          body: `${
            route.sellPrice -
            (market.data.data.tradeGoods?.find((w) => w.symbol === tradeGood)
              ?.purchasePrice ?? route.purchasePrice)
          } ${tradeGood}`,
        });
        setRunning(false);
        setTravelTarget("source");
        return;
      }
      const volume = [
        ...Array(Math.floor(amount / route.purchaseVolume))
          .keys()
          // @ts-ignore
          .map((w) => route.purchaseVolume),
        amount % route.purchaseVolume,
      ].filter((w) => w > 0);

      for (const v of volume) {
        const purchaseCargo = await spaceTraderClient.FleetClient.purchaseCargo(
          ship.symbol,
          {
            symbol: tradeGood,
            units: v,
          },
        );
        dispatch(
          setShipCargo({
            symbol: ship.symbol,
            cargo: purchaseCargo.data.data.cargo,
          }),
        );
        dispatch(setMyAgent(purchaseCargo.data.data.agent));
        dispatch(addMarketTransaction(purchaseCargo.data.data.transaction));
      }
    } else if (shipWp === targetWp) {
      console.log(
        "arrived at target waypoint, selling specified amount, setting travelTarget to source",
      );
      setTravelTarget("source");
      travelDest = sourceWp;
      const shipAmount =
        ship.cargo.inventory.find((w) => w.symbol === tradeGood)?.units ?? 0;

      if (shipAmount > 0) {
        const amm = Math.min(amount, shipAmount);
        // ts-expect-error
        const volume = [
          ...Array(Math.floor(amm / route.sellVolume))
            .keys()
            // @ts-ignore
            .map((w) => route.sellVolume),
          amm % route.sellVolume,
        ].filter((w) => w > 0);

        for (const v of volume) {
          const sellCargo = await spaceTraderClient.FleetClient.sellCargo(
            ship.symbol,
            {
              symbol: tradeGood,
              units: v,
            },
          );
          dispatch(
            setShipCargo({
              symbol: ship.symbol,
              cargo: sellCargo.data.data.cargo,
            }),
          );
          dispatch(setMyAgent(sellCargo.data.data.agent));
          dispatch(addMarketTransaction(sellCargo.data.data.transaction));
        }
      }
    }

    if (shipWp === travelDest || shipWp === sourceWp) {
      const market = await spaceTraderClient.SystemsClient.getMarket(
        ship.nav.systemSymbol,
        ship.nav.waypointSymbol,
      );
      dispatch(
        setMarket({
          systemSymbol: ship.nav.systemSymbol,
          market: market.data.data,
          timestamp: Date.now(),
        }),
      );
    }

    console.log(
      "updating market, patching nav, undocking, navigating to next waypoint on route to target",
    );

    const routes = wpShortestPath(
      shipWp,
      travelDest,
      waypoints,
      navMode,
      ship,
      ship.cargo.capacity ?? 0,
    );
    const nextDest = routes[0];

    const orbit = await spaceTraderClient.FleetClient.orbitShip(ship.symbol);
    dispatch(
      setShipNav({
        symbol: ship.symbol,
        nav: orbit.data.data.nav,
      }),
    );

    if (orbit.data.data.nav.flightMode !== nextDest.flightMode) {
      const patch = await spaceTraderClient.FleetClient.patchShipNav(
        ship.symbol,
        {
          flightMode: nextDest.flightMode,
        },
      );

      dispatch(
        setShipNav({
          symbol: ship.symbol,
          nav: patch.data.data,
        }),
      );
    }
    const nextNav = await spaceTraderClient.FleetClient.navigateShip(
      ship.symbol,
      {
        waypointSymbol: nextDest.destination,
      },
    );
    dispatch(
      setShipNav({
        symbol: ship.symbol,
        nav: nextNav.data.data.nav,
      }),
    );
    dispatch(
      setShipFuel({
        symbol: ship.symbol,
        fuel: nextNav.data.data.fuel,
      }),
    );
  }, [
    amount,
    dispatch,
    navMode,
    notify,
    route,
    ship,
    sourceWp,
    targetWp,
    tradeGood,
    travelTarget,
    waypoints,
  ]);

  useEffect(() => {
    const bcc = new BroadcastChannel("EventWorkerChannel");
    bcc.addEventListener(
      "message",
      (event: MessageEvent<EventWorkerChannelData>) => {
        if (
          !running ||
          event.data.type !== "arrival" ||
          event.data.shipName !== ship.symbol
        )
          return;

        action();
      },
    );

    return () => {
      bcc.close();
    };
  }, [action, running, ship.symbol]);

  return (
    <Card
      title={
        <Space>
          <Badge status={running ? "processing" : "default"} />
          Simple Trader
        </Space>
      }
      extra={
        <Button
          onClick={() => {
            setRunning(!running);
            if (!running) {
              action();
            }
          }}
        >
          {running ? "Stop" : "Start"}
        </Button>
      }
    >
      <Flex gap="middle" vertical>
        <Space>
          <Select
            value={tradeGood}
            onChange={(value) => setTradeGood(value)}
            options={filterTradeGoods.map((w) => ({
              label: w,
              value: w,
            }))}
            style={{ width: 200 }}
            showSearch
            allowClear
          />
          <InputNumber
            min={0}
            max={ship.cargo.capacity ?? 0}
            value={amount}
            onChange={(value) => setAmount(value ?? 0)}
            changeOnWheel
          />
        </Space>
        <Space>
          <Select
            options={filterSourceMarkets.map(([key, w]) => {
              return {
                value: key,
                label: key,
              };
            })}
            showSearch
            style={{ width: 130 }}
            onChange={(value) => {
              setSourceWp(value);
            }}
            value={sourceWp}
            allowClear
          />

          <Select
            options={filterTargetMarkets.map(([key, w]) => {
              return {
                value: key,
                label: key,
              };
            })}
            showSearch
            style={{ width: 130 }}
            onChange={(value) => {
              setTargetWp(value);
            }}
            value={targetWp}
            allowClear
          />
        </Space>
        <Space>
          <Select
            options={Object.values(navModes).map((w) => {
              return {
                value: w,
                label: <Tooltip title={w}>{w}</Tooltip>,
              };
            })}
            showSearch
            style={{ width: 200 }}
            onChange={(value) => {
              setNavMode(value);
            }}
            value={navMode}
          />
          <Switch
            checked={notify}
            onChange={(value) => {
              setNotify(value);
            }}
          />
        </Space>
      </Flex>
      <Divider />
      <Space>
        <Descriptions
          bordered
          title="Market"
          size="small"
          column={1}
          items={[
            {
              key: "purchasePrice",
              children: route
                ? Math.floor(route.purchasePrice).toLocaleString()
                : "N/A",
              label: "Purchase Price",
            },
            {
              key: "sellPrice",
              children: route
                ? Math.floor(route.sellPrice).toLocaleString()
                : "N/A",
              label: "Sell Price",
            },
            {
              key: "profit",
              children: route
                ? Math.floor(route.profit).toLocaleString()
                : "N/A",
              label: "Profit",
            },
            {
              key: "purchaseVolume",
              children: route
                ? Math.floor(route.purchaseVolume).toLocaleString()
                : "N/A",
              label: "Purchase Volume",
            },
            {
              key: "sellVolume",
              children: route
                ? Math.floor(route.sellVolume).toLocaleString()
                : "N/A",
              label: "Sell Volume",
            },
          ]}
        />
        <Descriptions
          bordered
          size="small"
          title="Trip"
          column={1}
          items={[
            {
              label: "Fuel Cost",
              children: route
                ? Math.floor(route.tripFuelCost).toLocaleString()
                : "N/A",
              key: "tripFuelCost",
            },
            {
              label: "Travel Time",
              children: route
                ? `${Math.floor((route.tripTravelTime ?? 1) / 60 / 60)
                    .toString()
                    .padStart(2, "0")}:${(
                    Math.floor((route.tripTravelTime ?? 1) / 60) % 60
                  )
                    .toString()
                    .padStart(
                      2,
                      "0",
                    )}:${((route.tripTravelTime ?? 1) % 60).toString().padStart(2, "0")}`
                : "N/A",
              key: "tripTravelTime",
            },
            {
              label: "Purchase Cost",
              children: route
                ? Math.floor(route.tripPurchaseCost).toLocaleString()
                : "N/A",
              key: "tripPurchaseCost",
            },
            {
              label: "Total Cost",
              children: route
                ? Math.floor(route.tripTotalCost).toLocaleString()
                : "N/A",
              key: "tripTotalCost",
            },
            {
              key: "tripSellCost",
              children: route
                ? Math.floor(route.tripSellCost).toLocaleString()
                : "N/A",
              label: "Sell Cost",
            },
            {
              key: "tripProfit",
              children: route
                ? Math.floor(route.tripProfit).toLocaleString()
                : "N/A",
              label: "Profit",
            },
            {
              key: "tripYieldPerHour",
              children: route
                ? Math.floor(route.tripYieldPerHour).toLocaleString()
                : "N/A",
              label: "Profit Per Hour",
            },
          ]}
        />
      </Space>
      <Divider />
    </Card>
  );
}

export default SimpleTrader;
