import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";

export interface MapSliceState {
  waypointFilters: { [key: string]: boolean };
  shipActions: {
    nextTravel: boolean;
  };
  selectedShipSymbol: string | undefined;
  selectedSystemSymbol: string | undefined;
  selectedWaypointSymbol:
    | { systemSymbol: string; waypointSymbol: string }
    | undefined;
}

const initialState: MapSliceState = {
  waypointFilters: {},
  shipActions: {
    nextTravel: false,
  },
  selectedShipSymbol: undefined,
  selectedSystemSymbol: undefined,
  selectedWaypointSymbol: undefined,
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const mapSlice = createAppSlice({
  name: "map",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    // Use the `PayloadAction` type to declare the contents of `action.payload`
    setShipActions: create.reducer(
      (state, action: PayloadAction<{ nextTravel: boolean }>) => {
        state.shipActions = action.payload;
      },
    ),
    setShipActionNextTravel: create.reducer(
      (state, action: PayloadAction<boolean>) => {
        state.shipActions.nextTravel = action.payload;
      },
    ),

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
    selectShipActions: (state) => state.shipActions,
    selectShipActionNextTravel: (state) => state.shipActions.nextTravel,
    selectSelectedShipSymbol: (state) => state.selectedShipSymbol,
    selectSelectedSystemSymbol: (state) => state.selectedSystemSymbol,
    selectSelectedWaypointSymbol: (state) => state.selectedWaypointSymbol,
  },
});

// Action creators are generated for each case reducer function.
export const {
  setShipActionNextTravel,
  setShipActions,
  clearSelectedSymbols,
  setSelectedShipSymbol,
  setSelectedSystemSymbol,
  setSelectedWaypointSymbol,
} = mapSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
  selectShipActionNextTravel,
  selectShipActions,
  selectSelectedShipSymbol,
  selectSelectedSystemSymbol,
  selectSelectedWaypointSymbol,
} = mapSlice.selectors;
