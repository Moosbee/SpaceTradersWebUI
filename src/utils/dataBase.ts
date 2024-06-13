import { System } from "./api";

export class DataBase {
  private dbName: string;
  private version: number;
  private _db: IDBDatabase | null = null;

  constructor(dbName: string, version: number) {
    this.dbName = dbName;
    this.version = version;
  }

  private throwIfNotOpened(): void {
    if (!this._db) {
      throw new Error("Database not opened; call openAsync() first");
    }
  }

  public openAsync(): Promise<void> {
    return new Promise((resolve, reject) => {
      const database = indexedDB.open(this.dbName, this.version);
      database.onsuccess = () => {
        this._db = database.result;
        resolve();
      };
      database.onerror = (event) => {
        reject(event);
      };
      database.onblocked = (event) => {
        reject(event);
      };

      database.onupgradeneeded = (event) => {
        // the existing database version is less than 2 (or it doesn't exist)
        const db = database.result;
        switch (
          event.oldVersion // existing db version
        ) {
          case 0: {
            // version 0 means that the client had no database
            // perform initialization
            db.createObjectStore("system", { keyPath: "symbol" });
            const objectStore = db.createObjectStore("systemWaypoint", {
              keyPath: "symbol",
            });

            objectStore.createIndex("systemSymbol", "systemSymbol");

            break;
          }
          case 1:
          // client had version 1
          // update
        }

        // Create another object store called "names" with the autoIncrement flag set as true.
        reject(event);
      };
    });
  }

  public clearSystems(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.throwIfNotOpened();
      const tx = this._db!.transaction(["system"], "readwrite");
      const store = tx.objectStore("system");
      store.clear();
      tx.oncomplete = () => {
        resolve();
      };
      tx.onerror = (event) => {
        reject(event);
      };
    });
  }

  public addSystem(system: System): Promise<void> {
    return new Promise((resolve, reject) => {
      this.throwIfNotOpened();
      const tx = this._db!.transaction(["system"], "readwrite");
      const store = tx.objectStore("system");
      store.add(system);

      tx.oncomplete = () => {
        resolve();
      };

      tx.onerror = (event) => {
        reject(event);
      };
    });
  }

  public addSystems(systems: System[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.throwIfNotOpened();
      const tx = this._db!.transaction(["system"], "readwrite");
      const store = tx.objectStore("system");
      systems.forEach((system) => {
        store.add(system);
      });
      tx.oncomplete = () => {
        resolve();
      };
      tx.onerror = (event) => {
        reject(event);
      };
    });
  }

  public getSystem(symbol: string): Promise<System> {
    return new Promise((resolve, reject) => {
      this.throwIfNotOpened();
      const tx = this._db!.transaction(["system"], "readonly");
      const store = tx.objectStore("system");
      const request = store.get(symbol);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  }

  public getSystems(): Promise<System[]> {
    return new Promise((resolve, reject) => {
      this.throwIfNotOpened();
      const tx = this._db!.transaction(["system"], "readonly");
      const store = tx.objectStore("system");
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  }

  public updateSystem(system: System): Promise<void> {
    return new Promise((resolve, reject) => {
      this.throwIfNotOpened();
      const tx = this._db!.transaction(["system"], "readwrite");
      const store = tx.objectStore("system");
      store.put(system);
      tx.oncomplete = () => {
        resolve();
      };
      tx.onerror = (event) => {
        reject(event);
      };
    });
  }

  public getSystemByWaypoint(waypointSymbol: string): Promise<System[]> {
    return new Promise((resolve, reject) => {
      this.throwIfNotOpened();
      const transaction = this._db!.transaction(["system"], "readonly");

      // Get the object store
      const objectStore = transaction.objectStore("system");

      // Open a cursor to iterate over the objects
      const cursorRequest = objectStore.openCursor();

      const results: System[] = [];

      cursorRequest.onsuccess = function (event) {
        const cursor = (event.target as IDBRequest).result as
          | IDBCursorWithValue
          | undefined;
        if (cursor) {
          const system = cursor.value as System;
          const waypoints = system.waypoints;

          // Check if the 'items' array contains the string
          if (
            waypoints &&
            waypoints.length != 0 &&
            waypoints.some((waypoint) => waypoint.symbol === waypointSymbol)
          ) {
            results.push(system);
          }

          // Continue to the next record
          cursor.continue();
        } else {
          // No more entries
          resolve(results);
        }
      };

      cursorRequest.onerror = function (event) {
        reject("Cursor request error: " + event.target);
      };
    });
  }

  // public clearSystemWaypoints(): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     this.throwIfNotOpened();
  //     const tx = this._db!.transaction(["systemWaypoint"], "readwrite");
  //     const store = tx.objectStore("systemWaypoint");
  //     store.clear();
  //     tx.oncomplete = () => {
  //       resolve();
  //     };
  //     tx.onerror = (event) => {
  //       reject(event);
  //     };
  //   });
  // }

  // public addSystemWaypoint(waypoint: Waypoint): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     this.throwIfNotOpened();
  //     const tx = this._db!.transaction(["systemWaypoint"], "readwrite");
  //     const store = tx.objectStore("systemWaypoint");
  //     store.add(waypoint);
  //     tx.oncomplete = () => {
  //       resolve();
  //     };
  //     tx.onerror = (event) => {
  //       reject(event);
  //     };
  //   });
  // }

  // public addSystemWaypoints(waypoints: Waypoint[]): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     this.throwIfNotOpened();
  //     const tx = this._db!.transaction(["systemWaypoint"], "readwrite");
  //     const store = tx.objectStore("systemWaypoint");
  //     waypoints.forEach((waypoint) => {
  //       store.add(waypoint);
  //     });
  //     tx.oncomplete = () => {
  //       resolve();
  //     };
  //     tx.onerror = (event) => {
  //       reject(event);
  //     };
  //   });
  // }

  // public getSystemWaypoint(symbol: string): Promise<Waypoint> {
  //   return new Promise((resolve, reject) => {
  //     this.throwIfNotOpened();
  //     const tx = this._db!.transaction(["systemWaypoint"], "readonly");
  //     const store = tx.objectStore("systemWaypoint");
  //     const request = store.get(symbol);
  //     request.onsuccess = () => {
  //       resolve(request.result);
  //     };
  //     request.onerror = (event) => {
  //       reject(event);
  //     };
  //   });
  // }

  // public getSystemWaypointsBySystemSymbol(
  //   systemSymbol: string
  // ): Promise<Waypoint[]> {
  //   return new Promise((resolve, reject) => {
  //     this.throwIfNotOpened();
  //     const tx = this._db!.transaction(["systemWaypoint"], "readonly");
  //     const store = tx.objectStore("systemWaypoint");
  //     const index = store.index("systemSymbol");
  //     const request = index.getAll(systemSymbol);
  //     request.onsuccess = () => {
  //       resolve(request.result);
  //     };
  //     request.onerror = (event) => {
  //       reject(event);
  //     };
  //   });
  // }

  // public getSystemWaypoints(): Promise<Waypoint[]> {
  //   return new Promise((resolve, reject) => {
  //     this.throwIfNotOpened();
  //     const tx = this._db!.transaction(["systemWaypoint"], "readonly");
  //     const store = tx.objectStore("systemWaypoint");
  //     const request = store.getAll();
  //     request.onsuccess = () => {
  //       resolve(request.result);
  //     };
  //     request.onerror = (event) => {
  //       reject(event);
  //     };
  //   });
  // }
}
