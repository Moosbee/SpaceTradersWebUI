import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";
import type { navModes } from "../../utils/tavelUtils";
import type {
  MarketTradeGoodTypeEnum,
  ShipType,
  TradeSymbol,
  WaypointTraitSymbol,
  WaypointType,
} from "../api";

export interface MapSliceState {
  waypointFilters: {
    searchType: WaypointType[];
    searchTraits: WaypointTraitSymbol[];
    searchAutoComplete: string;
    marketItems: TradeSymbol[];
    marketItemTypes: MarketTradeGoodTypeEnum[];
    shipTypes: ShipType[];
    onlyInterestingMarket: boolean;
  };
  shipActions: {
    nextTravel: boolean;
  };
  selectedShipSymbol: string | undefined;
  selectedSystemSymbol: string | undefined;
  selectedWaypointSymbol:
    | { systemSymbol: string; waypointSymbol: string }
    | undefined;

  route: {
    show: "hide" | "fullDijkstra" | "routeDijkstra"; // | "fullAStar" | "routeAStar"
    travelMode: navModes;
  };
}

const initialState: MapSliceState = {
  waypointFilters: {
    searchType: [],
    searchTraits: [],
    searchAutoComplete: "",
    marketItems: [],
    marketItemTypes: [],
    shipTypes: [],
    onlyInterestingMarket: false,
  },
  shipActions: {
    nextTravel: false,
  },
  selectedShipSymbol: undefined,
  selectedSystemSymbol: undefined,
  selectedWaypointSymbol: undefined,
  route: {
    show: "hide",
    travelMode: "BURN-AND-CRUISE-AND-DRIFT",
  },
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

    resetAllFilters: create.reducer((state) => {
      state.waypointFilters = initialState.waypointFilters;
    }),

    setSearchType: create.reducer(
      (state, action: PayloadAction<{ value: WaypointType[] } | undefined>) => {
        state.waypointFilters.searchType = action.payload?.value ?? [];
      },
    ),
    setSearchTraits: create.reducer(
      (
        state,
        action: PayloadAction<{ value: WaypointTraitSymbol[] } | undefined>,
      ) => {
        state.waypointFilters.searchTraits = action.payload?.value ?? [];
      },
    ),
    setSearchAutoComplete: create.reducer(
      (state, action: PayloadAction<{ value: string } | undefined>) => {
        state.waypointFilters.searchAutoComplete = action.payload?.value ?? "";
      },
    ),
    setMarketItems: create.reducer(
      (state, action: PayloadAction<{ value: TradeSymbol[] } | undefined>) => {
        state.waypointFilters.marketItems = action.payload?.value ?? [];
      },
    ),
    setMarketItemTypes: create.reducer(
      (
        state,
        action: PayloadAction<{ value: MarketTradeGoodTypeEnum[] } | undefined>,
      ) => {
        state.waypointFilters.marketItemTypes = action.payload?.value ?? [];
      },
    ),
    setShipTypes: create.reducer(
      (state, action: PayloadAction<{ value: ShipType[] } | undefined>) => {
        state.waypointFilters.shipTypes = action.payload?.value ?? [];
      },
    ),

    setOnlyInterestingMarket: create.reducer(
      (state, action: PayloadAction<{ value: boolean } | undefined>) => {
        state.waypointFilters.onlyInterestingMarket =
          action.payload?.value ?? false;
      },
    ),

    setRoute: create.reducer(
      (state, action: PayloadAction<typeof initialState.route>) => {
        state.route = action.payload;
      },
    ),

    resetRoute: create.reducer((state) => {
      state.route = initialState.route;
    }),

    setRouteShow: create.reducer(
      (state, action: PayloadAction<(typeof initialState.route)["show"]>) => {
        state.route.show = action.payload;
      },
    ),
    setRouteTravelMode: create.reducer(
      (state, action: PayloadAction<navModes>) => {
        state.route.travelMode = action.payload;
      },
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectShipActions: (state) => state.shipActions,
    selectShipActionNextTravel: (state) => state.shipActions.nextTravel,
    selectSelectedShipSymbol: (state) => state.selectedShipSymbol,
    selectSelectedSystemSymbol: (state) => state.selectedSystemSymbol,
    selectSelectedWaypointSymbol: (state) => state.selectedWaypointSymbol,

    selectSearchType: (state) => state.waypointFilters.searchType,
    selectSearchTraits: (state) => state.waypointFilters.searchTraits,
    selectSearchAutoComplete: (state) =>
      state.waypointFilters.searchAutoComplete,
    selectMarketItems: (state) => state.waypointFilters.marketItems,
    selectMarketItemTypes: (state) => state.waypointFilters.marketItemTypes,
    selectShipTypes: (state) => state.waypointFilters.shipTypes,
    selectOnlyInterestingMarket: (state) =>
      state.waypointFilters.onlyInterestingMarket ?? false,

    selectRoute: (state) => state.route,

    selectRouteShow: (state) => state.route.show,
    selectRouteTravelMode: (state) => state.route.travelMode,
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
  setMarketItemTypes,
  setMarketItems,
  setSearchAutoComplete,
  setSearchTraits,
  setSearchType,
  setShipTypes,
  resetAllFilters,
  setOnlyInterestingMarket,
  resetRoute,
  setRoute,
  setRouteShow,
  setRouteTravelMode,
} = mapSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
  selectShipActionNextTravel,
  selectShipActions,
  selectSelectedShipSymbol,
  selectSelectedSystemSymbol,
  selectSelectedWaypointSymbol,
  selectMarketItemTypes,
  selectMarketItems,
  selectSearchAutoComplete,
  selectSearchTraits,
  selectSearchType,
  selectShipTypes,
  selectOnlyInterestingMarket,
  selectRoute,
  selectRouteShow,
  selectRouteTravelMode,
} = mapSlice.selectors;
