import { type PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";
import type { Waypoint } from "../api";

export interface waypointSliceState {
  systems: { [key: string]: { waypoints: Waypoint[] } };
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
    setSystemWaypoints: create.reducer(
      (
        state,
        action: PayloadAction<{ systemSymbol: string; waypoints: Waypoint[] }>,
      ) => {
        const { systemSymbol, waypoints } = action.payload;
        state.systems[systemSymbol] = { waypoints };
      },
    ),

    putSystemWaypoints: create.reducer(
      (
        state,
        action: PayloadAction<{ systemSymbol: string; waypoints: Waypoint[] }>,
      ) => {
        const { systemSymbol, waypoints } = action.payload;
        const wp = state.systems[systemSymbol]?.waypoints || [];
        state.systems[systemSymbol] = {
          waypoints: [
            ...wp.filter((ow) => waypoints.some((w) => ow.symbol !== w.symbol)),
            ...waypoints,
          ],
        };
      },
    ),

    clearSystemWaypoints: create.reducer(
      (state, action: PayloadAction<{ systemSymbol: string }>) => {
        const { systemSymbol } = action.payload;
        state.systems[systemSymbol] = { waypoints: [] };
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
    selectSystemWaypoints: (systems, symbol: string): Waypoint[] =>
      systems.systems[symbol]?.waypoints || [],
  },
});

// Action creators are generated for each case reducer function.
export const {
  setSystemWaypoints,
  putSystemWaypoints,
  clearSystemWaypoints,
  clearAllWaypoints,
} = waypointSlice.actions;
// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectWpSystems, selectSystemWaypoints } =
  waypointSlice.selectors;
