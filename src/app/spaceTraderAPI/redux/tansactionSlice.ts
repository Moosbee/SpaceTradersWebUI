import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";
import type {
  MarketTransaction,
  RepairTransaction,
  ScrapTransaction,
  ShipModificationTransaction,
  ShipyardTransaction,
} from "../api";

export interface TransactionSliceState {
  marketTransactions: MarketTransaction[];
  scrapTransactions: ScrapTransaction[];
  repairTransactions: RepairTransaction[];
  shipyardTransactions: ShipyardTransaction[];
  shipModificationTransactions: ShipModificationTransaction[];
}

const initialState: TransactionSliceState = {
  marketTransactions: [],
  scrapTransactions: [],
  repairTransactions: [],
  shipyardTransactions: [],
  shipModificationTransactions: [],
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const transactionSlice = createAppSlice({
  name: "transactions",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    // Use the `PayloadAction` type to declare the contents of `action.payload`
    addMarketTransaction: create.reducer(
      (state, action: PayloadAction<MarketTransaction>) => {
        // Redux Toolkit allows us to write "mutating" logic in reducers. It
        // doesn't actually mutate the state because it uses the Immer library,
        // which detects changes to a "draft state" and produces a brand new
        // immutable state based off those changes

        state.marketTransactions.push(action.payload);
      },
    ),
    addMarketTransactions: create.reducer(
      (state, action: PayloadAction<MarketTransaction[]>) => {
        state.marketTransactions.push(...action.payload);
      },
    ),
    setMarketTransactions: create.reducer(
      (state, action: PayloadAction<MarketTransaction[]>) => {
        state.marketTransactions = action.payload;
      },
    ),
    addScrapTransaction: create.reducer(
      (state, action: PayloadAction<ScrapTransaction>) => {
        state.scrapTransactions.push(action.payload);
      },
    ),
    addScrapTransactions: create.reducer(
      (state, action: PayloadAction<ScrapTransaction[]>) => {
        state.scrapTransactions.push(...action.payload);
      },
    ),
    setScrapTransactions: create.reducer(
      (state, action: PayloadAction<ScrapTransaction[]>) => {
        state.scrapTransactions = action.payload;
      },
    ),
    addRepairTransaction: create.reducer(
      (state, action: PayloadAction<RepairTransaction>) => {
        state.repairTransactions.push(action.payload);
      },
    ),
    addRepairTransactions: create.reducer(
      (state, action: PayloadAction<RepairTransaction[]>) => {
        state.repairTransactions.push(...action.payload);
      },
    ),
    setRepairTransactions: create.reducer(
      (state, action: PayloadAction<RepairTransaction[]>) => {
        state.repairTransactions = action.payload;
      },
    ),
    addShipyardTransaction: create.reducer(
      (state, action: PayloadAction<ShipyardTransaction>) => {
        state.shipyardTransactions.push(action.payload);
      },
    ),
    addShipyardTransactions: create.reducer(
      (state, action: PayloadAction<ShipyardTransaction[]>) => {
        state.shipyardTransactions.push(...action.payload);
      },
    ),
    setShipyardTransactions: create.reducer(
      (state, action: PayloadAction<ShipyardTransaction[]>) => {
        state.shipyardTransactions = action.payload;
      },
    ),
    addShipModificationTransaction: create.reducer(
      (state, action: PayloadAction<ShipModificationTransaction>) => {
        state.shipModificationTransactions.push(action.payload);
      },
    ),
    addShipModificationTransactions: create.reducer(
      (state, action: PayloadAction<ShipModificationTransaction[]>) => {
        state.shipModificationTransactions.push(...action.payload);
      },
    ),
    setShipModificationTransactions: create.reducer(
      (state, action: PayloadAction<ShipModificationTransaction[]>) => {
        state.shipModificationTransactions = action.payload;
      },
    ),
    clearTransactions: create.reducer((state) => {
      state.marketTransactions = [];
      state.scrapTransactions = [];
      state.repairTransactions = [];
      state.shipyardTransactions = [];
      state.shipModificationTransactions = [];
    }),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectMarketTransactions: (transactions) => transactions.marketTransactions,
    selectScrapTransactions: (transactions) => transactions.scrapTransactions,
    selectRepairTransactions: (transactions) => transactions.repairTransactions,
    selectShipyardTransactions: (transactions) =>
      transactions.shipyardTransactions,
    selectShipModificationTransactions: (transactions) =>
      transactions.shipModificationTransactions,
    selectTransactions: (transactions) => transactions,
  },
});

// Action creators are generated for each case reducer function.
export const {
  addMarketTransaction,
  addMarketTransactions,
  setMarketTransactions,
  addScrapTransaction,
  addScrapTransactions,
  setScrapTransactions,
  addRepairTransaction,
  addRepairTransactions,
  setRepairTransactions,
  addShipyardTransaction,
  addShipyardTransactions,
  setShipyardTransactions,
  addShipModificationTransaction,
  addShipModificationTransactions,
  setShipModificationTransactions,
  clearTransactions,
} = transactionSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
  selectMarketTransactions,
  selectScrapTransactions,
  selectTransactions,
  selectShipModificationTransactions,
  selectRepairTransactions,
  selectShipyardTransactions,
} = transactionSlice.selectors;
