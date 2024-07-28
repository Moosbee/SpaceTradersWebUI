import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";
import type { Agent } from "../api";

export interface AgentSliceState {
  myAgent: Agent;
  agents: {
    symbol: string;
    token: string;
  }[];
}

const initialState: AgentSliceState = {
  myAgent: {
    credits: 0,
    headquarters: "",
    shipCount: 0,
    startingFaction: "",
    symbol: "",
    accountId: "",
  },
  agents: [],
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

      state.myAgent = action.payload;
    }),
    addAgent: create.reducer(
      (state, action: PayloadAction<{ symbol: string; token: string }>) => {
        state.agents.push(action.payload);
      },
    ),
    removeAgent: create.reducer(
      (state, action: PayloadAction<{ token: string }>) => {
        state.agents = state.agents.filter(
          (agent) => agent.token !== action.payload.token,
        );
      },
    ),
    setAgents: create.reducer(
      (state, action: PayloadAction<{ symbol: string; token: string }[]>) => {
        state.agents = action.payload;
      },
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectMyAgent: (state) => state.myAgent,
    selectAgents: (state) => state.agents,
  },
});

// Action creators are generated for each case reducer function.
export const { setMyAgent, addAgent, removeAgent, setAgents } =
  agentSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectMyAgent, selectAgents } = agentSlice.selectors;
