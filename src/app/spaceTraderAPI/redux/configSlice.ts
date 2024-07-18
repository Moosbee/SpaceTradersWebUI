import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";

export interface ConfigSliceState {
  darkMode: boolean;
  siderCollapsed: boolean;
  agentToken?: string;
}

const initialState: ConfigSliceState = {
  darkMode: true,
  siderCollapsed: false,
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
    setAgentToken: create.reducer((state, action: PayloadAction<string>) => {
      state.agentToken = action.payload;
    }),
    deleteAgentToken: create.reducer((state) => {
      state.agentToken = undefined;
    }),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectDarkMode: (state) => state.darkMode,
    selectSiderCollapsed: (state) => state.siderCollapsed,
    selectAgentToken: (state) => state.agentToken,
  },
});

// Action creators are generated for each case reducer function.
export const {
  setDarkMode,
  setSiderCollapsed,
  deleteAgentToken,
  setAgentToken,
} = configSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectDarkMode, selectSiderCollapsed, selectAgentToken } =
  configSlice.selectors;
