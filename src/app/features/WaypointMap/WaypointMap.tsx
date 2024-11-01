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
import { wpDijkstra } from "../../utils/tavelUtils";
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
      return calculateRouteMapPoints(
        waypointsMp,
        selectedWaypoint,
        ship,
        route.travelMode,
      );
    }
    // if (route.show === "routeDijkstra")
    //   return calculateRouteMapPoints(
    //     unfilteredWaypoints,
    //     selectedWaypoint?.waypointSymbol ?? "",
    //     selectedWaypoint?.waypointSymbol ?? "",
    //     ship,
    //     route.travelMode,
    //   );
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

  // const connections = wpDijkstra(
  //   selectedWaypoint.waypointSymbol,
  //   waypointsMp.map((wp) => wp.waypoint.waypoint),
  //   {
  //     flightMode,
  //     maxFuelInCargo: 0,
  //     maxFuel: ship
  //       ? ship.fuel.capacity === 0
  //         ? Infinity
  //         : ship.fuel.capacity
  //       : 300,
  //     startFuel: ship ? ship.fuel.current : 300,
  //   },
  // );

  // prettier-ignore
  const connections=[
    { start_symbol: "", end_symbol: "X1-KC3-D42", distance: 0.0, cost: 0.0, flight_mode: "DRIFT" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-D43", distance: 0.0, cost: 1.0, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-H54", distance: 51.478150704935004, cost: 26.739075352467502, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-H51", distance: 51.478150704935004, cost: 26.739075352467502, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-H53", distance: 51.478150704935004, cost: 26.739075352467502, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-H52", distance: 51.478150704935004, cost: 26.739075352467502, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-BC5X", distance: 57.8013840664737, cost: 29.90069203323685, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-A3", distance: 81.39410298049853, cost: 41.697051490249265, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-A2", distance: 81.39410298049853, cost: 41.697051490249265, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-A4", distance: 81.39410298049853, cost: 41.697051490249265, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-A1", distance: 81.39410298049853, cost: 41.697051490249265, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-F46", distance: 124.8118584109699, cost: 63.40592920548495, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-F49", distance: 124.8118584109699, cost: 63.40592920548495, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-F47", distance: 124.8118584109699, cost: 63.40592920548495, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-F48", distance: 124.8118584109699, cost: 63.40592920548495, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-G50", distance: 137.32079230764728, cost: 69.66039615382364, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-E45", distance: 142.8355697996826, cost: 72.4177848998413, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-E44", distance: 142.8355697996826, cost: 72.4177848998413, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-C41", distance: 160.58953888718904, cost: 81.29476944359452, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-B6", distance: 182.36227680087788, cost: 92.18113840043894, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-K81", distance: 185.28356645962967, cost: 93.64178322981483, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-K82", distance: 185.28356645962967, cost: 93.64178322981483, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-C39", distance: 194.06442229321684, cost: 98.03221114660842, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-C40", distance: 194.06442229321684, cost: 98.03221114660842, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-E45", end_symbol: "X1-KC3-I56", distance: 171.96511274092776, cost: 159.40034127030518, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-B6", end_symbol: "X1-KC3-B35", distance: 156.18578680533003, cost: 171.27403180310395, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-B6", end_symbol: "X1-KC3-B38", distance: 157.68956845650888, cost: 172.02592262869337, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-B6", end_symbol: "X1-KC3-B8", distance: 164.1584600317632, cost: 175.26036841632055, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-B6", end_symbol: "X1-KC3-B9", distance: 179.96944185055418, cost: 183.16585932571604, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-B6", end_symbol: "X1-KC3-B7", distance: 180.0, cost: 183.18113840043895, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-B6", end_symbol: "X1-KC3-B37", distance: 182.17573932881405, cost: 184.26900806484596, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-B6", end_symbol: "X1-KC3-B33", distance: 184.94593804677083, cost: 185.65410742382437, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-B6", end_symbol: "X1-KC3-B10", distance: 187.20042734993956, cost: 186.78135207540873, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-B6", end_symbol: "X1-KC3-B36", distance: 190.5465822312224, cost: 188.45442951605014, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-C40", end_symbol: "X1-KC3-B17", distance: 184.09780009549272, cost: 191.08111119435478, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-C40", end_symbol: "X1-KC3-B19", distance: 194.98717906570164, cost: 196.52580067945922, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-I56", end_symbol: "X1-KC3-B28", distance: 106.47065323364932, cost: 213.63566788712984, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-I56", end_symbol: "X1-KC3-B30", distance: 128.4445405612866, cost: 224.62261155094848, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-I56", end_symbol: "X1-KC3-B26", distance: 142.22517358048822, cost: 231.51292806054929, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-I56", end_symbol: "X1-KC3-B27", distance: 146.23952953972466, cost: 233.5201060401675, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-B12", distance: 250.79872407968904, cost: 251.79872407968904, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-I56", end_symbol: "X1-KC3-B25", distance: 186.10212250267324, cost: 253.4514025216418, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-B16", distance: 254.01771591761076, cost: 255.01771591761076, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-B14", distance: 254.12595302329905, cost: 255.12595302329905, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-I56", end_symbol: "X1-KC3-B29", distance: 195.04102132628407, cost: 257.92085193344724, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-B13", distance: 259.67864756271354, cost: 260.67864756271354, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-D42", end_symbol: "X1-KC3-B15", distance: 270.1851217221259, cost: 271.1851217221259, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-B7", end_symbol: "X1-KC3-B11", distance: 177.0706073858674, cost: 272.7164420933726, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-C40", end_symbol: "X1-KC3-B21", distance: 203.2141727340886, cost: 302.246383880697, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-B6", end_symbol: "X1-KC3-B34", distance: 212.13203435596427, cost: 305.3131727564032, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-C40", end_symbol: "X1-KC3-B20", distance: 212.00235847744713, cost: 311.03456962405556, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-B6", end_symbol: "X1-KC3-B32", distance: 218.0022935659164, cost: 311.18343196635533, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-C40", end_symbol: "X1-KC3-B18", distance: 219.3855054464629, cost: 318.4177165930713, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-C40", end_symbol: "X1-KC3-B23", distance: 231.36551169091732, cost: 330.39772283752575, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-C40", end_symbol: "X1-KC3-B24", distance: 248.02016047087784, cost: 347.05237161748624, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-G50", end_symbol: "X1-KC3-B22", distance: 278.0071941515183, cost: 348.66759030534195, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-K81", end_symbol: "X1-KC3-B31", distance: 273.28007611240156, cost: 367.9218593422164, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-I56", end_symbol: "X1-KC3-I55", distance: 221.93016919743022, cost: 382.3305104677354, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-I55", end_symbol: "X1-KC3-J57", distance: 149.5125412799876, cost: 458.08678110772917, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-J57", end_symbol: "X1-KC3-J58", distance: 119.85407794480753, cost: 519.013820080133, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-J57", end_symbol: "X1-KC3-J68", distance: 136.8941196691808, cost: 527.5338409423196, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-J57", end_symbol: "X1-KC3-J67", distance: 181.41664752717708, cost: 549.7951048713177, flight_mode: "BURN" }, 
  { start_symbol: "X1-KC3-B7", end_symbol: "X1-KC3-J74", distance: 381.16269492173546, cost: 565.3438333221744, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-J57", end_symbol: "X1-KC3-J70", distance: 230.09780529157595, cost: 689.1845863993051, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-J57", end_symbol: "X1-KC3-J72", distance: 334.37852801877096, cost: 793.4653091265002, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-J57", end_symbol: "X1-KC3-J66", distance: 384.94804844290354, cost: 844.0348295506327, flight_mode: "CRUISE" }, 
  { start_symbol: "X1-KC3-J58", end_symbol: "X1-KC3-J69", distance: 399.0112780360976, cost: 919.0250981162305, flight_mode: "CRUISE" }];

  return connections
    .map((c) => {
      const wpStart = waypointsMp.find(
        (w) => w.waypoint.waypoint.symbol === c.start_symbol,
      );
      const wpEnd = waypointsMp.find(
        (w) => w.waypoint.waypoint.symbol === c.end_symbol,
      );
      if (!wpStart || !wpEnd) return undefined;
      return {
        x1: wpStart.xOne,
        y1: wpStart.yOne,
        x2: wpEnd.xOne,
        y2: wpEnd.yOne,
        distance: c.distance,
        wpSymbol: c.start_symbol,
        destination: c.end_symbol,
        mode: c.flight_mode,
      };
    })
    .filter((c): c is RouteMapPoint => !!c);
}

// function calculateRouteMapPoints(
//   waypointsMp: Record<string, WaypointState>,
//   start: string,
//   end: string,
//   ship: Ship | undefined,
//   flightMode: navModes,
// ): RouteMapPoint[] {
//   if (!waypointsMp) return [];

//   const connections = wpShortestPath(
//     start,
//     end,
//     waypointsMp,
//     flightMode,
//     ship,
//     ship ? ship.fuel.current : 300
//   );

//   return connections
//     .map((c) => {
//       const wpStart = waypointsMp[c.origin];
//       const wpEnd = waypointsMp[c.destination];
//       if (!wpStart || !wpEnd) return undefined;
//       return {
//         x1: wpStart.xOne,
//         y1: wpStart.yOne,
//         x2: wpEnd.xOne,
//         y2: wpEnd.yOne,
//         distance: c.distance,
//         wpSymbol: c.origin,
//         destination: c.destination,
//         mode: c.flightMode,
//       };
//     })
//     .filter((c): c is RouteMapPoint => !!c);
// }

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
  };
}
export default WaypointMap;
