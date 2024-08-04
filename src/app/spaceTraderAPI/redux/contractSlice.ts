import { createSelector, type PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";
import type { Contract } from "../api";

export interface ContractSliceState {
  contracts: ContractInfo[];
}

interface ContractInfo {
  agentSymbol: string;
  contract: Contract;
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
    addContracts: create.reducer(
      (state, action: PayloadAction<ContractInfo[]>) => {
        state.contracts.push(...action.payload);
      },
    ),

    putContracts: create.reducer(
      (state, action: PayloadAction<ContractInfo[]>) => {
        state.contracts = state.contracts.filter(
          (contract) =>
            !action.payload.some((s) => s.contract.id === contract.contract.id),
        );
        state.contracts.push(...action.payload);
      },
    ),

    setContracts: create.reducer(
      (state, action: PayloadAction<ContractInfo[]>) => {
        state.contracts = action.payload;
      },
    ),
    clearContracts: create.reducer((state) => {
      state.contracts = [];
    }),
    // Use the `PayloadAction` type to declare the contents of `action.payload`
    addContract: create.reducer(
      (state, action: PayloadAction<ContractInfo>) => {
        // Redux Toolkit allows us to write "mutating" logic in reducers. It
        // doesn't actually mutate the state because it uses the Immer library,
        // which detects changes to a "draft state" and produces a brand new
        // immutable state based off those changes

        state.contracts.push(action.payload);
      },
    ),

    putContract: create.reducer(
      (
        state,
        action: PayloadAction<{
          contractID?: string;
          contract: Contract;
          agentSymbol: string;
        }>,
      ) => {
        const { contractID, contract } = action.payload;
        const contractSymbol = contractID || contract.id;
        const id = state.contracts.findIndex(
          (w) => w.contract.id === contractSymbol,
        );
        if (id >= 0) {
          state.contracts[id] = {
            agentSymbol: action.payload.agentSymbol,
            contract: action.payload.contract,
          };
        } else {
          state.contracts.push({
            agentSymbol: action.payload.agentSymbol,
            contract: action.payload.contract,
          });
        }
      },
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectContracts: (contracts) => contracts.contracts,
    selectFulfilledContracts: createSelector(
      (contracts: ContractSliceState) => contracts.contracts,
      (contracts) => contracts.filter((w) => w.contract.fulfilled === true),
    ),
    selectOpenContracts: createSelector(
      (contracts: ContractSliceState) => contracts.contracts,
      (contracts) =>
        contracts.filter(
          (w) => w.contract.fulfilled === false && w.contract.accepted === true,
        ),
    ),
    selectUnAcceptedContracts: createSelector(
      (contracts: ContractSliceState) => contracts.contracts,
      (contracts) => contracts.filter((w) => w.contract.accepted === false),
    ),
    selectAcceptedContracts: createSelector(
      (contracts: ContractSliceState) => contracts.contracts,
      (contracts) => contracts.filter((w) => w.contract.accepted === true),
    ),
    selectContract: (contracts, id?: string) =>
      contracts.contracts.find((w) => w.contract.id === id),
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
