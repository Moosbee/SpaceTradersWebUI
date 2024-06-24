import { createSelector, type PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";
import type { Contract } from "../api";

export interface ContractSliceState {
  contracts: Contract[];
}

const initialState: ContractSliceState = {
  contracts: [],
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const contractSlice = createAppSlice({
  name: "contracts",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    addContracts: create.reducer((state, action: PayloadAction<Contract[]>) => {
      state.contracts.push(...action.payload);
    }),

    putContracts: create.reducer((state, action: PayloadAction<Contract[]>) => {
      state.contracts = state.contracts.filter(
        (contract) => !action.payload.some((s) => s.id === contract.id),
      );
      state.contracts.push(...action.payload);
    }),

    setContracts: create.reducer((state, action: PayloadAction<Contract[]>) => {
      state.contracts = action.payload;
    }),
    clearContracts: create.reducer((state) => {
      state.contracts = [];
    }),
    // Use the `PayloadAction` type to declare the contents of `action.payload`
    addContract: create.reducer((state, action: PayloadAction<Contract>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes

      state.contracts.push(action.payload);
    }),

    putContract: create.reducer(
      (
        state,
        action: PayloadAction<{ contractID?: string; contract: Contract }>,
      ) => {
        const { contractID, contract } = action.payload;
        const contractSymbol = contractID || contract.id;
        const id = state.contracts.findIndex((w) => w.id === contractSymbol);
        if (id >= 0) {
          state.contracts[id] = contract;
        } else {
          state.contracts.push(contract);
        }
      },
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectContracts: (contracts) => contracts.contracts,
    selectFulfilledContracts: createSelector(
      (contracts) => contracts.contracts,
      (contracts) => contracts.filter((w: Contract) => w.fulfilled === true),
    ),
    selectOpenContracts: createSelector(
      (contracts) => contracts.contracts,
      (contracts) =>
        contracts.filter(
          (w: Contract) => w.fulfilled === false && w.accepted === true,
        ),
    ),
    selectUnAcceptedContracts: createSelector(
      (contracts) => contracts.contracts,
      (contracts) => contracts.filter((w: Contract) => w.accepted === false),
    ),
    selectAcceptedContracts: createSelector(
      (contracts) => contracts.contracts as Contract[],
      (contracts) =>
        contracts.filter((w: Contract) => w.accepted === true) as Contract[],
    ),
    selectContract: (contracts, id?: string) =>
      contracts.contracts.find((w) => w.id === id),
  },
});

// Action creators are generated for each case reducer function.
export const {
  addContracts,
  putContracts,
  setContracts,
  clearContracts,
  addContract,
  putContract,
} = contractSlice.actions;
// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
  selectContracts,
  selectContract,
  selectFulfilledContracts,
  selectOpenContracts,
  selectUnAcceptedContracts,
  selectAcceptedContracts,
} = contractSlice.selectors;
