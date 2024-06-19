import { DataBase } from "./dataBase";
import spaceTraderClient from "./spaceTraderClient";

const cacheDB = new DataBase("cache", 1);

cacheDB.openAsync();

const localCache = {
  getSystemWaypoints: async (systemSymbol: string) => {
    return await cacheDB.getSystemWaypointsBySystemSymbol(systemSymbol);
  },
  cacheSystemWaypoints: async (
    onProgress?: (progress: number, total: number) => void
  ) => {},
  clearSystemWaypoints: async () => {
    await cacheDB.clearSystemWaypoints();
  },
  getSystems: async () => {
    return await cacheDB.getSystems();
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
      await new Promise((resolve) => setTimeout(resolve, 2500)); // rate limiting :D

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
  getSystemsWaypoints: async () => {
    return await cacheDB.getSystemWaypoints();
  },
  cacheSystemsWaypoints: async (
    onProgress?: (progress: number, total: number) => void
  ) => {},
};

export default localCache;
