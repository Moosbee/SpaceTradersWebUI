import { createSelector, type PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";
import type { Agent } from "../api";

export interface AgentSliceState {
  myAgents: {
    [symbol: string]: {
      agent: Agent;
      token: string;
    };
  };
}

const initialState: AgentSliceState = {
  myAgents: {},
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const agentSlice = createAppSlice({
  name: "agent",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    // Use the `PayloadAction` type to declare the contents of `action.payload`
    setMyAgent: create.reducer((state, action: PayloadAction<Agent>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes

      state.myAgents[action.payload.symbol] = {
        agent: action.payload,
        token: state.myAgents[action.payload.symbol].token,
      };
    }),
    addAgent: create.reducer(
      (state, action: PayloadAction<{ agent: Agent; token: string }>) => {
        state.myAgents[action.payload.agent.symbol] = action.payload;
      },
    ),
    removeAgent: create.reducer(
      (state, action: PayloadAction<{ symbol: string }>) => {
        delete state.myAgents[action.payload.symbol];
      },
    ),
    setAgents: create.reducer(
      (state, action: PayloadAction<{ agent: Agent; token: string }[]>) => {
        for (const agent of action.payload) {
          state.myAgents[agent.agent.symbol] = agent;
        }
      },
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectAgents: createSelector(
      (state) => state.myAgents,
      (myAgents) => Object.values<{ agent: Agent; token: string }>(myAgents),
    ),
    selectAgent: (state, symbol?: string) =>
      symbol ? state.myAgents[symbol] : undefined,
  },
});

// Action creators are generated for each case reducer function.
export const { setMyAgent, addAgent, removeAgent, setAgents } =
  agentSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectAgent, selectAgents } = agentSlice.selectors;
