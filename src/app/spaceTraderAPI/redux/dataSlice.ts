import { type PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";

export interface DataSliceState {
  supplyChain: { [key: string]: string[] };
}

const initialState: DataSliceState = {
  supplyChain: {},
};

export const dataSlice = createAppSlice({
  name: "data",
  initialState,
  reducers: (create) => ({
    setSupplyChain: create.reducer(
      (state, action: PayloadAction<{ [key: string]: string[] }>) => {
        state.supplyChain = action.payload;
      },
    ),
    addSupplyChainItem: create.reducer(
      (state, action: PayloadAction<{ key: string; values: string[] }>) => {
        const { key, values } = action.payload;
        state.supplyChain[key] = values;
      },
    ),
    removeSupplyChainItem: create.reducer(
      (state, action: PayloadAction<string>) => {
        delete state.supplyChain[action.payload];
      },
    ),
    clearSupplyChain: create.reducer((state) => {
      state.supplyChain = {};
    }),
  }),
  selectors: {
    selectSupplyChain: (state) => state.supplyChain,
    selectSupplyChainItem: (state, key: string) => state.supplyChain[key],
  },
});

// Export actions
export const {
  setSupplyChain,
  addSupplyChainItem,
  removeSupplyChainItem,
  clearSupplyChain,
} = dataSlice.actions;

// Export selectors
export const { selectSupplyChain, selectSupplyChainItem } = dataSlice.selectors;
