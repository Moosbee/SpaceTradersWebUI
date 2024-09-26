import { type PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";
import type { Market, Shipyard, Waypoint } from "../api";

interface WaypointState {
  waypoint: Waypoint;
  market?: Market;
  shipyard?: Shipyard;
}

export interface waypointSliceState {
  systems: {
    [key: string]: {
      [key: string]: WaypointState;
    };
  };
}

const initialState: waypointSliceState = {
  systems: {},
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const waypointSlice = createAppSlice({
  name: "waypoints",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    putWaypoints: create.reducer(
      (
        state,
        action: PayloadAction<{ systemSymbol: string; waypoints: Waypoint[] }>,
      ) => {
        const { systemSymbol, waypoints } = action.payload;
        for (const waypoint of waypoints) {
          state.systems[systemSymbol][waypoint.symbol] = {
            ...state.systems[systemSymbol][waypoint.symbol],
            waypoint,
          };
        }
      },
    ),

    setWaypoint: create.reducer(
      (
        state,
        action: PayloadAction<{
          systemSymbol: string;
          waypoint: Waypoint;
        }>,
      ) => {
        const { systemSymbol, waypoint } = action.payload;
        state.systems[systemSymbol][waypoint.symbol] = {
          ...state.systems[systemSymbol][waypoint.symbol],
          waypoint,
        };
      },
    ),

    putShipyards: create.reducer(
      (
        state,
        action: PayloadAction<{
          systemSymbol: string;
          shipyards: Shipyard[];
        }>,
      ) => {
        const { systemSymbol, shipyards } = action.payload;

        for (const shipyard of shipyards) {
          state.systems[systemSymbol][shipyard.symbol] = {
            ...state.systems[systemSymbol][shipyard.symbol],
            shipyard,
          };
        }
      },
    ),

    setShipyard: create.reducer(
      (
        state,
        action: PayloadAction<{ systemSymbol: string; shipyard: Shipyard }>,
      ) => {
        const { systemSymbol, shipyard } = action.payload;
        state.systems[systemSymbol][shipyard.symbol] = {
          ...state.systems[systemSymbol][shipyard.symbol],
          shipyard,
        };
      },
    ),

    putMarkets: create.reducer(
      (
        state,
        action: PayloadAction<{
          systemSymbol: string;
          markets: Market[];
        }>,
      ) => {
        const { systemSymbol, markets } = action.payload;
        for (const market of markets) {
          state.systems[systemSymbol][market.symbol] = {
            ...state.systems[systemSymbol][market.symbol],
            market,
          };
        }
      },
    ),

    setMarket: create.reducer(
      (
        state,
        action: PayloadAction<{ systemSymbol: string; market: Market }>,
      ) => {
        const { systemSymbol, market } = action.payload;
        state.systems[systemSymbol][market.symbol] = {
          ...state.systems[systemSymbol][market.symbol],
          market,
        };
      },
    ),

    clearSystemWaypoints: create.reducer(
      (state, action: PayloadAction<{ systemSymbol: string }>) => {
        const { systemSymbol } = action.payload;
        state.systems[systemSymbol] = {};
      },
    ),
    clearAllWaypoints: create.reducer((state) => {
      state.systems = {};
    }),
    // The function below is called a thunk and allows us to perform async logic. It
    // can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
    // will call the thunk with the `dispatch` function as the first argument. Async
    // code can then be executed and other actions can be dispatched. Thunks are
    // typically used to make async requests.
    // cacheSystems: create.asyncThunk(
    //   async (onProgress?: (progress: number, total: number) => void) => {
    //     const response = await fetchCount(amount);
    //     // The value we return becomes the `fulfilled` action payload
    //     return response.data;
    //   },
    //   {
    //     pending: (state) => {
    //       state.status = "loading";
    //     },
    //     fulfilled: (state, action) => {
    //       state.status = "idle";
    //       state.value += action.payload;
    //     },
    //     rejected: (state) => {
    //       state.status = "failed";
    //     },
    //   },
    // )
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectWpSystems: (systems) => systems.systems,
    selectSystemWaypoints: (
      systems,
      symbol: string,
    ): { [key: string]: WaypointState } => systems.systems[symbol] || {},
  },
});

// Action creators are generated for each case reducer function.
export const {
  putWaypoints,
  clearSystemWaypoints,
  clearAllWaypoints,
  setMarket,
  setShipyard,
  putMarkets,
  putShipyards,
  setWaypoint,
} = waypointSlice.actions;
// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectWpSystems, selectSystemWaypoints } =
  waypointSlice.selectors;
