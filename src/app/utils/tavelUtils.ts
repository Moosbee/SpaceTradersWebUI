import type { ShipNavFlightMode } from "../spaceTraderAPI/api";

function getInterSystemTravelStats(
  engineSpeed: number,
  flightMode: ShipNavFlightMode,
  startWaypoint: { x: number; y: number },
  endWaypoint: { x: number; y: number },
) {
  const distance = Math.sqrt(
    Math.pow(endWaypoint.x - startWaypoint.x, 2) +
      Math.pow(endWaypoint.y - startWaypoint.y, 2),
  );

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

export { getInterSystemTravelStats };
