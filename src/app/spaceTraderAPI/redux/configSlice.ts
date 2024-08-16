import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";

export interface ConfigSliceState {
  darkMode: boolean;
  siderCollapsed: boolean;
  agentSymbol: string | undefined;
  selectedShipSymbol: string | undefined;
  selectedSystemSymbol: string | undefined;
  selectedWaypointSymbol:
    | { systemSymbol: string; waypointSymbol: string }
    | undefined;
}

const initialState: ConfigSliceState = {
  darkMode: true,
  siderCollapsed: false,
  agentSymbol: undefined,
  selectedShipSymbol: undefined,
  selectedSystemSymbol: undefined,
  selectedWaypointSymbol: undefined,
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const configSlice = createAppSlice({
  name: "config",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    // Use the `PayloadAction` type to declare the contents of `action.payload`
    setDarkMode: create.reducer((state, action: PayloadAction<boolean>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes

      state.darkMode = action.payload;
    }),

    setSiderCollapsed: create.reducer(
      (state, action: PayloadAction<boolean>) => {
        state.siderCollapsed = action.payload;
      },
    ),
    setAgentSymbol: create.reducer((state, action: PayloadAction<string>) => {
      state.agentSymbol = action.payload;
    }),

    deleteAgentToken: create.reducer((state) => {
      state.agentSymbol = undefined;
    }),

    setSelectedShipSymbol: create.reducer(
      (state, action: PayloadAction<string | undefined>) => {
        state.selectedShipSymbol = action.payload;
      },
    ),

    setSelectedSystemSymbol: create.reducer(
      (state, action: PayloadAction<string | undefined>) => {
        state.selectedSystemSymbol = action.payload;
      },
    ),

    setSelectedWaypointSymbol: create.reducer(
      (
        state,
        action: PayloadAction<
          { systemSymbol: string; waypointSymbol: string } | undefined
        >,
      ) => {
        state.selectedWaypointSymbol = action.payload;
      },
    ),

    clearSelectedSymbols: create.reducer((state) => {
      state.selectedShipSymbol = undefined;
      state.selectedSystemSymbol = undefined;
      state.selectedWaypointSymbol = undefined;
    }),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectDarkMode: (state) => state.darkMode,
    selectSiderCollapsed: (state) => state.siderCollapsed,
    selectAgentSymbol: (state) => state.agentSymbol,
    selectSelectedShipSymbol: (state) => state.selectedShipSymbol,
    selectSelectedSystemSymbol: (state) => state.selectedSystemSymbol,
    selectSelectedWaypointSymbol: (state) => state.selectedWaypointSymbol,
  },
});

// Action creators are generated for each case reducer function.
export const {
  setDarkMode,
  setSiderCollapsed,
  deleteAgentToken,
  setAgentSymbol,
  clearSelectedSymbols,
  setSelectedShipSymbol,
  setSelectedSystemSymbol,
  setSelectedWaypointSymbol,
} = configSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
  selectDarkMode,
  selectSiderCollapsed,
  selectAgentSymbol,
  selectSelectedShipSymbol,
  selectSelectedSystemSymbol,
  selectSelectedWaypointSymbol,
} = configSlice.selectors;
