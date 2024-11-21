import { theme } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector } from "../../hooks";
import type {
  Ship,
  ShipNavFlightMode,
  System,
  Waypoint,
} from "../../spaceTraderAPI/api";
import { selectShip, selectShips } from "../../spaceTraderAPI/redux/fleetSlice";
import {
  selectMarketItems,
  selectMarketItemTypes,
  selectOnlyInterestingMarket,
  selectRoute,
  selectSearchAutoComplete,
  selectSearchTraits,
  selectSearchType,
  selectSelectedShipSymbol,
  selectSelectedWaypointSymbol,
  selectShipTypes,
} from "../../spaceTraderAPI/redux/mapSlice";
import { selectSystemMarkets } from "../../spaceTraderAPI/redux/marketSlice";
import { selectSystem } from "../../spaceTraderAPI/redux/systemSlice";
import type { WaypointState } from "../../spaceTraderAPI/redux/waypointSlice";
import { selectSystemWaypoints } from "../../spaceTraderAPI/redux/waypointSlice";
import type { navModes } from "../../utils/tavelUtils";
import { wpDijkstra, wpShortestPath } from "../../utils/tavelUtils";
import { cyrb53, scaleNum, seedShuffle } from "../../utils/utils";
import { filterWps } from "../filterCard/FilterCard";
import WaypointMapRoute from "../WaypointMapRoute/WaypointMapRoute";
import WaypointMapShip from "../WaypointMapShip/WaypointMapShip";
import WaypointMapShipOrbit from "../WaypointMapShipOrbit/WaypointMapShipOrbit";
import WaypointMapWaypoint from "../WaypointMapWaypoint/WaypointMapWaypoint";
import WaypointMapWaypointOrbit from "../WaypointMapWaypointOrbit/WaypointMapWaypointOrbit";
import classes from "./WaypointMap.module.css";

const baseDirections = [
  { wayX: 1, wayY: 0 },
  { wayX: 0, wayY: 1 },
  { wayX: -1, wayY: 1 },
  { wayX: -1, wayY: 0 },
  { wayX: 0, wayY: -1 },
  { wayX: 1, wayY: -1 },
  { wayX: 1, wayY: 0 },
  { wayX: 0, wayY: -1 },
];

interface ShipMapPoint {
  ship: Ship;
  xOne: number;
  yOne: number;
  posOrbitCenter?: { x: number; y: number };
  line?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  mode?: ShipNavFlightMode;
}

interface WaypointMapPoint {
  waypoint: WaypointState & { filter: boolean };
  xOne: number;
  yOne: number;
  xOneOrbitCenter: number;
  yOneOrbitCenter: number;
}

interface RouteMapPoint {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  distance: number;
  wpSymbol: string;
  destination: string;
  mode: ShipNavFlightMode;
}

function WaypointMap({ systemID }: { systemID: string }) {
  const system = useAppSelector((state) => selectSystem(state, systemID));
  const ships = useAppSelector(selectShips);
  const unfilteredWaypoints = useAppSelector((state) =>
    selectSystemWaypoints(state, systemID),
  );

  const unfilteredMarkets = useAppSelector((state) =>
    selectSystemMarkets(state, systemID),
  );

  const selectedWaypoint = useAppSelector(selectSelectedWaypointSymbol);
  const selectedShip = useAppSelector(selectSelectedShipSymbol);
  const ship = useAppSelector((state) => selectShip(state, selectedShip));

  const [shipsMp, setShipsMp] = useState<ShipMapPoint[]>([]);
  const [size, setSize] = useState(16);

  const textboxRef = useRef<SVGSVGElement>(null);

  const {
    token: { colorBgElevated },
  } = theme.useToken();

  const directions = useMemo(() => {
    if (!system) return [];
    return seedShuffle(baseDirections, cyrb53(systemID, 8888));
  }, [system, systemID]);

  const searchType = useAppSelector(selectSearchType);
  const searchTraits = useAppSelector(selectSearchTraits);
  const searchAutoComplete = useAppSelector(selectSearchAutoComplete);
  const marketItems = useAppSelector(selectMarketItems);
  const marketItemTypes = useAppSelector(selectMarketItemTypes);
  const shipTypes = useAppSelector(selectShipTypes);
  const onlyInterestingMarket = useAppSelector(selectOnlyInterestingMarket);

  const waypointsMp = useMemo(
    () =>
      calculateWaypointMapPoints(
        filterWps(
          marketItemTypes,
          marketItems,
          searchAutoComplete,
          searchTraits,
          searchType,
          unfilteredWaypoints,
          unfilteredMarkets,
          shipTypes,
          onlyInterestingMarket,
        ),
        system,
        directions,
      ),
    [
      marketItemTypes,
      marketItems,
      searchAutoComplete,
      searchTraits,
      searchType,
      unfilteredWaypoints,
      unfilteredMarkets,
      shipTypes,
      onlyInterestingMarket,
      system,
      directions,
    ],
  );

  const route = useAppSelector(selectRoute);

  const routesMp = useMemo(() => {
    if (route.show === "fullDijkstra")
      return calculateAllRouteMapPoints(
        waypointsMp,
        selectedWaypoint,
        ship,
        route.travelMode,
      );
    if (route.show === "routeDijkstra") {
      if (
        !ship?.nav.waypointSymbol ||
        !selectedWaypoint?.waypointSymbol ||
        !ship
      )
        return [];
      return calculateRouteMapPoints(
        waypointsMp,
        ship.nav.waypointSymbol,
        selectedWaypoint.waypointSymbol,
        ship,
        route.travelMode,
      );
    }
    return [];
  }, [route.show, route.travelMode, waypointsMp, selectedWaypoint, ship]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setShipsMp(createShipMapPoints(ships, systemID, waypointsMp, directions));
    }, 100);
    return () => clearInterval(intervalId);
  }, [directions, ships, systemID, waypointsMp]);

  useEffect(() => {
    if (!textboxRef.current) return;
    const observe = new ResizeObserver(outputsize);
    observe.observe(textboxRef.current);
    return () => {
      observe.disconnect();
    };
  }, []);

  function outputsize() {
    if (!textboxRef.current) return;
    setSize(textboxRef.current.clientWidth);
  }

  return (
    <>
      <svg
        ref={textboxRef}
        className={classes.waypointMapOrbits}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        stroke={colorBgElevated}
      >
        {renderWaypointOrbits(waypointsMp, size)}
        {renderShipOrbits(shipsMp, size)}
        {renderRoutes(routesMp, size)}
      </svg>
      <div className={classes.waypointMapIn}>
        {renderWaypoints(waypointsMp, system)}
        {renderShips(shipsMp)}
        <WaypointMapWaypoint system={system!} xOne={50} yOne={50} />
      </div>
    </>
  );
}

function calculateWaypointMapPoints(
  waypointsArr: (WaypointState & { filter: boolean })[],

  system: System | undefined,
  directions: typeof baseDirections,
): WaypointMapPoint[] {
  if (!system) return [];
  const [wpMinX, wpMinY, wpMaxX, wpMaxY] =
    calculateWaypointBoundaries(waypointsArr);
  const [wbCalcX, wbCalcY] = calculateWaypointBoundaryCalcs(
    wpMinX,
    wpMinY,
    wpMaxX,
    wpMaxY,
  );

  let orbitals = 0;

  return waypointsArr
    .sort((a, b) => a.waypoint.symbol.localeCompare(b.waypoint.symbol))
    .map((w) => {
      let [xOne, yOne] = calculateInitialCoordinates(
        w.waypoint,
        wbCalcX,
        wbCalcY,
      );
      let [xOneOrbitCenter, yOneOrbitCenter] = [50, 50];

      if (w.waypoint.orbits) {
        [xOne, yOne, xOneOrbitCenter, yOneOrbitCenter] =
          calculateOrbitalCoordinates(
            w.waypoint,
            wbCalcX,
            wbCalcY,
            directions[orbitals % 8],
            xOne,
            yOne,
          );
        orbitals++;
      }

      return { waypoint: w, xOne, yOne, xOneOrbitCenter, yOneOrbitCenter };
    });
}

function createShipMapPoints(
  ships: Ship[],
  systemID: string,
  waypointsMp: WaypointMapPoint[],
  directions: typeof baseDirections,
): ShipMapPoint[] {
  let orbitals = 0;

  return ships
    .filter((s) => s.nav.systemSymbol === systemID)
    .map((s) => {
      const navState = s.nav.status;
      const navWaypoint = s.nav.waypointSymbol;
      orbitals++;

      switch (navState) {
        case "DOCKED":
          return createDockedShipPoint(
            s,
            waypointsMp,
            navWaypoint,
            directions[orbitals % 8],
          );
        case "IN_ORBIT":
          return createOrbitingShipPoint(
            s,
            waypointsMp,
            navWaypoint,
            directions[orbitals % 7],
          );
        case "IN_TRANSIT":
          return createTransitingShipPoint(s, waypointsMp);
        default:
          return undefined;
      }
    })
    .filter((s): s is ShipMapPoint => !!s);
}

function calculateAllRouteMapPoints(
  waypointsMp: WaypointMapPoint[],
  selectedWaypoint:
    | {
        systemSymbol: string;
        waypointSymbol: string;
      }
    | undefined,
  ship: Ship | undefined,
  flightMode: navModes,
): RouteMapPoint[] {
  if (!waypointsMp || waypointsMp.length === 0 || !selectedWaypoint) return [];

  const connections = wpDijkstra(
    selectedWaypoint.waypointSymbol,
    waypointsMp.map((wp) => wp.waypoint.waypoint),
    {
      flightMode,
      maxFuelInCargo: 0,
      maxFuel: ship
        ? ship.fuel.capacity === 0
          ? Infinity
          : ship.fuel.capacity
        : 300,
      startFuel: ship ? ship.fuel.current : 300,
    },
  );

  return connections
    .map((c) => {
      const wpStart = waypointsMp.find(
        (w) => w.waypoint.waypoint.symbol === c.origin,
      );
      const wpEnd = waypointsMp.find(
        (w) => w.waypoint.waypoint.symbol === c.destination,
      );
      if (!wpStart || !wpEnd) return undefined;
      return {
        x1: wpStart.xOne,
        y1: wpStart.yOne,
        x2: wpEnd.xOne,
        y2: wpEnd.yOne,
        distance: c.distance,
        wpSymbol: c.origin,
        destination: c.destination,
        mode: c.flightMode,
      };
    })
    .filter((c): c is RouteMapPoint => !!c);
}

function calculateRouteMapPoints(
  // waypointsMp: Record<string, WaypointState>,
  waypointsMp: WaypointMapPoint[],
  start: string,
  end: string,
  ship: Ship | undefined,
  flightMode: navModes,
): RouteMapPoint[] {
  if (!waypointsMp) return [];

  let wps = waypointsMp
    .map((wp) => wp.waypoint)
    .reduce(
      (a, b) => {
        return {
          ...a,
          [b.waypoint.symbol]: b,
        };
      },
      {} as Record<string, WaypointState>,
    );

  const connections = wpShortestPath(
    start,
    end,
    wps,
    flightMode,
    ship,
    ship ? ship.fuel.current : 300,
  );

  return connections
    .map((c) => {
      const wpStart = waypointsMp.find(
        (w) => w.waypoint.waypoint.symbol === c.origin,
      );
      const wpEnd = waypointsMp.find(
        (w) => w.waypoint.waypoint.symbol === c.destination,
      );
      if (!wpStart || !wpEnd) return undefined;
      return {
        x1: wpStart.xOne,
        y1: wpStart.yOne,
        x2: wpEnd.xOne,
        y2: wpEnd.yOne,
        distance: c.distance,
        wpSymbol: c.origin,
        destination: c.destination,
        mode: c.flightMode,
      };
    })
    .filter((c): c is RouteMapPoint => !!c);
}

function renderWaypointOrbits(waypointsMp: WaypointMapPoint[], size: number) {
  return waypointsMp.map((w) => (
    <WaypointMapWaypointOrbit
      key={w.waypoint.waypoint.symbol + "wayOrbit"}
      xOnePos={w.xOne}
      yOnePos={w.yOne}
      xOneOrbitCenter={w.xOneOrbitCenter}
      yOneOrbitCenter={w.yOneOrbitCenter}
      size={size}
    />
  ));
}

function renderShipOrbits(shipsMp: ShipMapPoint[], size: number) {
  return shipsMp.map((s) => (
    <WaypointMapShipOrbit
      size={size}
      key={s.ship.symbol + "shipOrbit"}
      pos={{
        x: s.xOne,
        y: s.yOne,
      }}
      posOrbitCenter={s.posOrbitCenter}
      line={s.line}
      mode={s.mode}
    />
  ));
}

function renderRoutes(routesMp: RouteMapPoint[], size: number) {
  return routesMp.map((r) => (
    <WaypointMapRoute
      size={size + 5 * r.distance}
      key={r.wpSymbol + r.destination + "route" + r.mode}
      line={{
        x1: r.x1,
        y1: r.y1,
        x2: r.x2,
        y2: r.y2,
      }}
      mode={r.mode}
    />
  ));
}

function renderWaypoints(
  waypointsMp: WaypointMapPoint[],
  system: System | undefined,
) {
  return waypointsMp.map((w) => (
    <>
      {w.waypoint.filter && (
        <WaypointMapWaypoint
          key={w.waypoint.waypoint.symbol + "way"}
          waypoint={w.waypoint.waypoint}
          system={system!}
          xOne={w.xOne}
          yOne={w.yOne}
        />
      )}
    </>
  ));
}

function renderShips(shipsMp: ShipMapPoint[]) {
  return shipsMp.map((s) => (
    <WaypointMapShip
      key={s.ship.symbol + "ship"}
      ship={s.ship}
      xOne={s.xOne}
      yOne={s.yOne}
    />
  ));
}

// Helper functions (calculateWaypointBoundaries, calculateWaypointBoundaryCalcs, calculateInitialCoordinates, calculateOrbitalCoordinates, createDockedShipPoint, createOrbitingShipPoint, createTransitingShipPoint) would be implemented here.

function calculateWaypointBoundaries(waypointsArr: WaypointState[]) {
  let wpMinX = Infinity;
  let wpMinY = Infinity;
  let wpMaxX = -Infinity;
  let wpMaxY = -Infinity;
  waypointsArr.forEach((w) => {
    wpMinX = Math.min(wpMinX, w.waypoint.x);
    wpMinY = Math.min(wpMinY, w.waypoint.y);
    wpMaxX = Math.max(wpMaxX, w.waypoint.x);
    wpMaxY = Math.max(wpMaxY, w.waypoint.y);
  });
  return [wpMinX, wpMinY, wpMaxX, wpMaxY];
}

function calculateWaypointBoundaryCalcs(
  wpMinX: number,
  wpMinY: number,
  wpMaxX: number,
  wpMaxY: number,
) {
  const wbCalcX = Math.ceil(
    Math.max(Math.abs(wpMaxX), Math.abs(wpMinX)) * 1.05,
  );
  const wbCalcY = Math.ceil(
    Math.max(Math.abs(wpMaxY), Math.abs(wpMinY)) * 1.05,
  );
  return [wbCalcX, wbCalcY];
}

function calculateInitialCoordinates(
  waypoint: Waypoint,
  wbCalcX: number,
  wbCalcY: number,
) {
  let xOne = scaleNum(waypoint.x, -wbCalcX, wbCalcX, 0, 100);
  let yOne = scaleNum(waypoint.y, -wbCalcY, wbCalcY, 0, 100);
  return [xOne, yOne];
}

function calculateOrbitalCoordinates(
  waypoint: Waypoint,
  wbCalcX: number,
  wbCalcY: number,
  direction: (typeof baseDirections)[number],
  xOne: number,
  yOne: number,
) {
  const xOneOrbitCenter = xOne;
  const yOneOrbitCenter = yOne;

  const { wayX, wayY } = direction;

  const newX = waypoint.x + wbCalcX * 0.01 * wayX;
  const newY = waypoint.y + wbCalcY * 0.01 * wayY;

  xOne = scaleNum(newX, -wbCalcX, wbCalcX, 0, 100);
  yOne = scaleNum(newY, -wbCalcY, wbCalcY, 0, 100);

  return [xOne, yOne, xOneOrbitCenter, yOneOrbitCenter];
}

function createDockedShipPoint(
  ship: Ship,
  waypointsMp: WaypointMapPoint[],
  navWaypoint: string,
  direction: (typeof baseDirections)[number],
): ShipMapPoint | undefined {
  const wp = waypointsMp.find(
    (w) => w.waypoint.waypoint.symbol === navWaypoint,
  );
  if (!wp) return undefined;
  const { wayX, wayY } = direction;

  return {
    ship,
    xOne: wp.xOne + 0.2 * wayX,
    yOne: wp.yOne + 0.2 * wayY,
    line: {
      x1: wp.xOne,
      y1: wp.yOne,
      x2: wp.xOne + 0.2 * wayX,
      y2: wp.yOne + 0.2 * wayY,
    },
  };
}

function createOrbitingShipPoint(
  ship: Ship,
  waypointsMp: WaypointMapPoint[],
  navWaypoint: string,
  direction: (typeof baseDirections)[number],
): ShipMapPoint | undefined {
  const wp = waypointsMp.find(
    (w) => w.waypoint.waypoint.symbol === navWaypoint,
  );
  if (!wp) return undefined;
  const { wayX, wayY } = direction;

  return {
    ship,
    xOne: wp.xOne + 0.3 * wayX,
    yOne: wp.yOne + 0.3 * wayY,
    posOrbitCenter: {
      x: wp.xOne,
      y: wp.yOne,
    },
  };
}

function createTransitingShipPoint(
  ship: Ship,
  waypointsMp: WaypointMapPoint[],
): ShipMapPoint | undefined {
  const wpStart = waypointsMp.find(
    (w) => w.waypoint.waypoint.symbol === ship.nav.route.origin.symbol,
  );
  const wpEnd = waypointsMp.find(
    (w) => w.waypoint.waypoint.symbol === ship.nav.route.destination.symbol,
  );

  if (!wpStart || !wpEnd) return undefined;

  const totalTime =
    new Date(ship.nav.route.arrival).getTime() -
    new Date(ship.nav.route.departureTime).getTime();

  const elapsedTime =
    new Date().getTime() - new Date(ship.nav.route.departureTime).getTime();

  const travelPercent = Math.min(1.1, (elapsedTime / totalTime) * 1);

  return {
    ship,
    xOne: wpStart.xOne + travelPercent * (wpEnd.xOne - wpStart.xOne),
    yOne: wpStart.yOne + travelPercent * (wpEnd.yOne - wpStart.yOne),
    line: {
      x1: wpStart.xOne,
      y1: wpStart.yOne,
      x2: wpEnd.xOne,
      y2: wpEnd.yOne,
    },
    mode: ship.nav.flightMode,
  };
}
export default WaypointMap;
