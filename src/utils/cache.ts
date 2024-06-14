import { DataBase } from "./dataBase";
import spaceTraderClient from "./spaceTraderClient";

const cacheDB = new DataBase("cache", 1);

cacheDB.openAsync();

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
    onProgress?: (progress: number, total: number) => void
  ) => {
    const limit = 20;
    let page = 1;
    let total = 0;

    let finished = false;

    // let systems: System[] = [];

    while (!finished) {
      await new Promise((resolve) => setTimeout(resolve, 2100)); // rate limiting :D

      const response = await spaceTraderClient.SystemsClient.getSystems(
        page,
        limit
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
};
export { cacheDB };
export default localCache;
