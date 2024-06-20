import type { Contract } from "./api";
import { DataBase } from "./dataBase";
import spaceTraderClient from "./spaceTraderClient";

const cacheDB = new DataBase("cache", 1);

await cacheDB.openAsync();
// .then(() => {
//   console.log("cacheDB opened");
// })
// .catch((error) => {
//   console.error("db err", error);
// });

const localCache = {
  // getSystemWaypoints: async (systemSymbol: string) => {
  //   return await cacheDB.getSystemWaypointsBySystemSymbol(systemSymbol);
  // },
  // cacheSystemWaypoints: async (
  //   onProgress?: (progress: number, total: number) => void
  // ) => {},
  // clearSystemWaypoints: async () => {
  //   await cacheDB.clearSystemWaypoints();
  // },
  // getSystemsWaypoints: async () => {
  //   return await cacheDB.getSystemWaypoints();
  // },
  // cacheSystemsWaypoints: async (
  //   onProgress?: (progress: number, total: number) => void
  // ) => {},
  getSystems: async () => {
    return await cacheDB.getSystems();
  },
  getSystemByWaypoint: async (waypointSymbol: string) => {
    return await cacheDB.getSystemByWaypoint(waypointSymbol);
  },
  getSystem: async (symbol: string) => {
    return await cacheDB.getSystem(symbol);
  },
  cacheSystems: async (
    onProgress?: (progress: number, total: number) => void,
  ) => {
    const limit = 20;
    let page = 1;
    let total = 0;

    let finished = false;

    // let systems: System[] = [];

    while (!finished) {
      await new Promise((resolve) => setTimeout(resolve, 510)); // rate limiting :D

      const response = await spaceTraderClient.SystemsClient.getSystems(
        page,
        limit,
      );
      total = response.data.meta.total;
      // systems = systems.concat(response.data.data);

      await cacheDB.addSystems(response.data.data);

      onProgress?.((page - 1) * limit + response.data.data.length, total);

      if (response.data.data.length === 0) {
        finished = true;
      }
      if (page * limit >= total) {
        finished = true;
      }
      page++;
    }
  },
  clearSystems: async () => {
    await cacheDB.clearSystems();
  },

  getShips: (): { symbol: string; waypointSymbol: string }[] => {
    const ships = JSON.parse(sessionStorage.getItem("ships") || "[]");
    // console.log("ships", ships);
    return ships;
  },

  setShips: (ships: { symbol: string; waypointSymbol: string }[]) => {
    sessionStorage.setItem("ships", JSON.stringify(ships));
  },
  getContracts: (): Contract[] => {
    const ships = JSON.parse(sessionStorage.getItem("contracts") || "[]");
    // console.log("ships", ships);
    return ships;
  },
  addContract: async (contract: Contract) => {
    const ships = JSON.parse(sessionStorage.getItem("contracts") || "[]");
    ships.push(contract);
    sessionStorage.setItem("contracts", JSON.stringify(ships));
  },
  setContracts: async (contracts: Contract[]) => {
    sessionStorage.setItem("contracts", JSON.stringify(contracts));
  },
};
export { cacheDB };
export default localCache;
