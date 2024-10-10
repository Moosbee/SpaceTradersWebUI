import type { Ship, ShipNavFlightMode, Waypoint } from "../spaceTraderAPI/api";
import type { WaypointState } from "../spaceTraderAPI/redux/waypointSlice";
import PriorityQueue from "./PriorityQueue";

function getInterSystemTravelStats(
  engineSpeed: number,
  flightMode: ShipNavFlightMode,
  startWaypoint: { x: number; y: number },
  endWaypoint: { x: number; y: number },
) {
  const distance = distanceBetweenWaypoints(startWaypoint, endWaypoint);

  let fuelCost = 1;
  let multiplier = 1;

  switch (flightMode) {
    case "BURN":
      fuelCost = Math.max(2, 2 * Math.round(distance));
      multiplier = 12.5;
      break;
    case "CRUISE":
      fuelCost = Math.max(1, Math.round(distance));
      multiplier = 25;
      break;
    case "STEALTH": // Same logic for "CRUISE" and "STEALTH"
      fuelCost = Math.max(1, Math.round(distance));
      multiplier = 30;
      break;
    case "DRIFT":
      fuelCost = 1;
      multiplier = 250;
      break;
  }

  const travelTime = Math.round(
    Math.max(1, Math.round(distance)) * (multiplier / engineSpeed) + 15,
  );

  return {
    distance,
    fuelCost,
    travelTime,
  };
}

function distanceBetweenWaypoints(
  startWaypoint: { x: number; y: number },
  endWaypoint: { x: number; y: number },
) {
  return Math.sqrt(
    Math.pow(endWaypoint.x - startWaypoint.x, 2) +
      Math.pow(endWaypoint.y - startWaypoint.y, 2),
  );
}

export interface Route {
  origin: string;
  destination: string;
  totalDistance: number;
  distance: number;
  fuelCost?: number;
  travelTime?: number;
  flightMode: ShipNavFlightMode;
  cost: number;
}

export const navModes = {
  BURN: "BURN",
  CRUISE: "CRUISE",
  DRIFT: "DRIFT",
  "BURN-AND-CRUISE": "BURN-AND-CRUISE",
  "CRUISE-AND-DRIFT": "CRUISE-AND-DRIFT",
  "BURN-AND-DRIFT": "BURN-AND-DRIFT",
  "BURN-AND-CRUISE-AND-DRIFT": "BURN-AND-CRUISE-AND-DRIFT",
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type navModes = (typeof navModes)[keyof typeof navModes];

/**
 * Find the shortest path between two waypoints, given a set of waypoints and
 * a ship's properties.
 *
 * @param startSymbol The symbol of the starting waypoint.
 * @param endSymbol The symbol of the ending waypoint.
 * @param waypoints A map of waypoints, keyed by symbol.
 * @param flightMode The desired flight mode for travel.
 * @param ship The ship to use for travel.
 * @param maxFuelInCargo The maximum amount of fuel that can be stored in the
 *   ship's cargo.
 * @returns An array of routes, in order, from the starting waypoint to the
 *   ending waypoint. Each route contains the origin, destination, distance,
 *   fuelCost, travelTime, and flightMode.
 */
function wpShortestPath(
  startSymbol: string,
  endSymbol: string,
  waypoints: Record<string, WaypointState>,
  flightMode: navModes,
  ship: Ship,
  maxFuelInCargo: number,
) {
  const routes = routeChanger(
    wpDijkstra(
      startSymbol,
      Object.values(waypoints).map((w) => w.waypoint),
      {
        maxFuel: ship.fuel.capacity,
        maxFuelInCargo: maxFuelInCargo,
        flightMode: flightMode,
      },
    ),
  );

  let nextRoute = endSymbol;

  const finalRoutes: Route[] = [];

  while (nextRoute !== startSymbol) {
    const route: Route | undefined = routes[nextRoute];

    if (!route) {
      throw new Error(`No route found from ${startSymbol} to ${endSymbol}`);
    }

    const { fuelCost, travelTime, distance } = getInterSystemTravelStats(
      ship.engine.speed,
      route.flightMode,
      {
        x: waypoints[route.origin].waypoint.x,
        y: waypoints[route.origin].waypoint.y,
      },
      {
        x: waypoints[route.destination].waypoint.x,
        y: waypoints[route.destination].waypoint.y,
      },
    );
    if (route.distance !== distance) {
      console.log("route.distance!==distance", route, route.distance, distance);
    }
    finalRoutes.push({
      ...route,
      fuelCost,
      travelTime,
    });
    nextRoute = route.origin;
  }

  return finalRoutes.toReversed();
}

function routeChanger(routes: Route[]): Record<string, Route> {
  return routes.reduce((obj, item) => {
    return {
      ...obj,
      [item.destination]: item,
    };
  }, {});
}

function wpDijkstra(
  startSymbol: string,
  waypoints: Waypoint[],
  config: {
    maxFuel: number;
    maxFuelInCargo: number;
    flightMode: navModes;
  },
): Route[] {
  const unvisitedWaypoints: Record<string, Waypoint> = waypoints.reduce(
    (obj, item) => {
      return {
        ...obj,
        [item.symbol]: item,
      };
    },
    {},
  );
  const toVisit = new PriorityQueue<Route>((a, b) => {
    return a.cost < b.cost;
  });
  const visited: Route[] = [];

  toVisit.push({
    destination: startSymbol,
    totalDistance: 0,
    distance: 0,
    origin: "",
    flightMode: "DRIFT",
    cost: 0,
  });

  const availableModes = {
    BURN: { radius: config.maxFuel / 2, costMultiplier: 0.5 },
    CRUISE: { radius: config.maxFuel, costMultiplier: 1 },
    DRIFT: { radius: Infinity, costMultiplier: 10 },
  };

  type avModes = keyof typeof availableModes;

  const currentModes: avModes[] = [
    ...(config.flightMode.includes("BURN") ? ["BURN" as avModes] : []),
    ...(config.flightMode.includes("CRUISE") ? ["CRUISE" as avModes] : []),
    ...(config.flightMode.includes("DRIFT") ? ["DRIFT" as avModes] : []),
  ];

  while (!toVisit.isEmpty()) {
    const current = toVisit.peek()!;
    visited.push(current);

    toVisit.removeAll((w) => !(w.destination === current.destination));

    const waypoint = unvisitedWaypoints[current.destination];
    delete unvisitedWaypoints[current.destination];
    if (!waypoint) continue;

    for (const mode of currentModes) {
      const nextWaypoints = getWaypointsWithinRadius(
        waypoint,
        availableModes[mode].radius,
        Object.values(unvisitedWaypoints),
        !(mode === "DRIFT"),
      );
      toVisit.push(
        ...nextWaypoints.map((w) => ({
          destination: w.waypoint.symbol,
          totalDistance: current.totalDistance + w.distance,
          distance: w.distance,
          origin: waypoint.symbol,
          flightMode: mode as ShipNavFlightMode,
          cost:
            current.cost + w.distance * availableModes[mode].costMultiplier + 1,
        })),
      );
    }
  }

  return visited;
}

function getWaypointsWithinRadius(
  sourceWaypoint: Waypoint,
  radius: number,
  waypoints: Waypoint[],
  onlyMarketWaypoints = false,
): { distance: number; waypoint: Waypoint }[] {
  return waypoints
    .map((waypoint) => ({
      distance: distanceBetweenWaypoints(sourceWaypoint, waypoint),
      waypoint,
    }))
    .filter(
      (wp) =>
        (sourceWaypoint.traits.some((t) => t.symbol === "MARKETPLACE") ||
          !onlyMarketWaypoints) &&
        wp.distance <= radius,
    );
}

export { getInterSystemTravelStats, wpDijkstra, wpShortestPath };
