import { type PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";
import type { System } from "../api";

export interface SystemSliceState {
  systems: System[];
}

const initialState: SystemSliceState = {
  systems: [],
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const systemSlice = createAppSlice({
  name: "systems",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    addSystems: create.reducer((state, action: PayloadAction<System[]>) => {
      state.systems.push(...action.payload);
    }),

    putSystems: create.reducer((state, action: PayloadAction<System[]>) => {
      state.systems = state.systems.filter(
        (system) => !action.payload.some((s) => s.symbol === system.symbol),
      );
      state.systems.push(...action.payload);
    }),

    setSystems: create.reducer((state, action: PayloadAction<System[]>) => {
      state.systems = action.payload;
    }),
    clearSystems: create.reducer((state) => {
      state.systems = [];
    }),
    // Use the `PayloadAction` type to declare the contents of `action.payload`
    addSystem: create.reducer((state, action: PayloadAction<System>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes

      state.systems.push(action.payload);
    }),

    putSystem: create.reducer(
      (state, action: PayloadAction<{ symbol?: string; system: System }>) => {
        const { symbol, system } = action.payload;
        const systemSymbol = symbol || system.symbol;
        const id = state.systems.findIndex((w) => w.symbol === systemSymbol);
        if (id >= 0) {
          state.systems[id] = system;
        } else {
          state.systems.push(system);
        }
      },
    ),
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
    selectSystems: (systems) => systems.systems,
    selectSystem: (systems, symbol?: string) =>
      systems.systems.find((w) => w.symbol === symbol),
    selectSystemByWaypoint: (systems, waypointSymbol?: string) =>
      systems.systems.find((w) =>
        w.waypoints.some((w) => w.symbol === waypointSymbol),
      ),
  },
});

// Action creators are generated for each case reducer function.
export const {
  addSystems,
  putSystems,
  setSystems,
  clearSystems,
  addSystem,
  putSystem,
} = systemSlice.actions;
// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectSystems, selectSystem, selectSystemByWaypoint } =
  systemSlice.selectors;
