import type { ShipNavFlightMode, Waypoint } from "../spaceTraderAPI/api";
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

interface Route {
  origin: string;
  destination: string;
  distance: number;
  // fuelCost: number;
  // travelTime: number;
  flightMode: ShipNavFlightMode;
}

function wpDijkstra(
  startSymbol: string,
  wps: Waypoint[],
  config: {
    maxFuel: number;
    fuelInCargo: number;
    flightMode:
      | "BURN"
      | "CRUISE"
      | "DRIFT"
      | "BURN-AND-CRUISE"
      | "CRUISE-AND-DRIFT"
      | "BURN-AND-DRIFT"
      | "BURN-AND-CRUISE-AND-DRIFT";
  },
): Route[] {
  let notTraversedWaypoints: Record<string, Waypoint> = wps.reduce(
    (obj, item) => {
      return {
        ...obj,
        [item.symbol]: item,
      };
    },
    {},
  );
  const toTraverse: PriorityQueue<{
    wp: Waypoint;
    distance: number;
    beforeSymbol: string;
    flightMode: ShipNavFlightMode;
    cost: number;
  }> = new PriorityQueue((a, b) => {
    return a.cost < b.cost;
  });
  const traversed: Route[] = [];

  const firstWp = notTraversedWaypoints[startSymbol];
  delete notTraversedWaypoints[startSymbol];

  toTraverse.push({
    wp: firstWp,
    distance: 0,
    beforeSymbol: "",
    flightMode: "DRIFT",
    cost: 0,
  });

  while (!toTraverse.isEmpty()) {
    const source = toTraverse.pop()!;
    traversed.push({
      origin: source.wp.symbol,
      distance: source.distance,
      destination: source.beforeSymbol,
      flightMode: source.flightMode,
    });

    toTraverse.removeAll(
      (w) =>
        !(
          (w.wp.symbol === source.wp.symbol)
          // w.beforeSymbol === source.beforeSymbol
        ),
    );

    const { wp, distance, cost } = source;
    delete notTraversedWaypoints[wp.symbol];

    if (
      config.flightMode === "BURN" ||
      config.flightMode === "BURN-AND-CRUISE" ||
      config.flightMode === "BURN-AND-DRIFT" ||
      config.flightMode === "BURN-AND-CRUISE-AND-DRIFT"
    ) {
      const nextWps = getWaypointsInRadius(
        wp,
        config.maxFuel / 2,
        Object.values(notTraversedWaypoints),
        true,
      );
      toTraverse.push(
        ...nextWps.map((w) => ({
          wp: w.waypoint,
          distance: distance + w.distance,
          beforeSymbol: wp.symbol,
          flightMode: "BURN" as ShipNavFlightMode,
          cost: cost + w.distance / 2 + 1,
        })),
      );
      // nextWps.forEach((w) => {
      //   delete notTraversedWaypoints[w.waypoint.symbol];
      // });
    }

    if (
      config.flightMode === "CRUISE" ||
      config.flightMode === "BURN-AND-CRUISE" ||
      config.flightMode === "CRUISE-AND-DRIFT" ||
      config.flightMode === "BURN-AND-CRUISE-AND-DRIFT"
    ) {
      const nextWps = getWaypointsInRadius(
        wp,
        config.maxFuel,
        Object.values(notTraversedWaypoints),
        true,
      );
      toTraverse.push(
        ...nextWps.map((w) => ({
          wp: w.waypoint,
          distance: distance + w.distance,
          beforeSymbol: wp.symbol,
          flightMode: "CRUISE" as ShipNavFlightMode,
          cost: cost + w.distance + 1,
        })),
      );
      // nextWps.forEach((w) => {
      //   delete notTraversedWaypoints[w.waypoint.symbol];
      // });
    }

    if (
      config.flightMode === "DRIFT" ||
      config.flightMode === "BURN-AND-DRIFT" ||
      config.flightMode === "CRUISE-AND-DRIFT" ||
      config.flightMode === "BURN-AND-CRUISE-AND-DRIFT"
    ) {
      const nextWps = getWaypointsInRadius(
        wp,
        0,
        Object.values(notTraversedWaypoints),
        false,
      );
      toTraverse.push(
        ...nextWps.map((w) => ({
          wp: w.waypoint,
          distance: distance + w.distance,
          beforeSymbol: wp.symbol,
          flightMode: "DRIFT" as ShipNavFlightMode,
          cost: cost + w.distance * 10 + 1,
        })),
      );
      // nextWps.forEach((w) => {
      //   delete notTraversedWaypoints[w.waypoint.symbol];
      // });
    }
  }

  return traversed;
}

function getWaypointsInRadius(
  wp: Waypoint,
  radius: number,
  wps: Waypoint[],
  onlyMarkets = false,
) {
  return wps
    .map((w) => {
      return {
        distance: distanceBetweenWaypoints(wp, w),
        waypoint: w,
      };
    })
    .filter((w) => {
      return (
        (wp.traits.some((t) => t.symbol === "MARKETPLACE") || !onlyMarkets) &&
        (w.distance < radius || radius === 0)
      );
    });
}

export { getInterSystemTravelStats, wpDijkstra };
