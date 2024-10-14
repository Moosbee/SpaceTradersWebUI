import { type PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";
import type {
  Market,
  MarketTradeGood,
  MarketTransaction,
  TradeGood,
} from "../api";

export interface MarketState {
  static: {
    exports: Array<TradeGood>;
    imports: Array<TradeGood>;
    exchange: Array<TradeGood>;
  };
  tradeGoods: Array<{
    timestamp: number;
    tradeGoods: Array<MarketTradeGood>;
  }>;
  transactions: Array<MarketTransaction>;
}

export interface marketSliceState {
  systems: {
    [key: string]: {
      [key: string]: MarketState;
    };
  };
}

const initialState: marketSliceState = {
  systems: {},
};

const empty = {};

// If you are not using async thunks you can use the standalone `createSlice`.
export const marketSlice = createAppSlice({
  name: "markets",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    putMarkets: create.reducer(
      (
        state,
        action: PayloadAction<{
          systemSymbol: string;
          markets: Market[];
        }>,
      ) => {
        const { systemSymbol, markets } = action.payload;
        for (const market of markets) {
          if (!state.systems[systemSymbol]) {
            state.systems[systemSymbol] = {};
          }

          if (!state.systems[systemSymbol][market.symbol]) {
            state.systems[systemSymbol][market.symbol] = {
              static: {
                imports: [],
                exports: [],
                exchange: [],
              },
              tradeGoods: [],
              transactions: [],
            };
          }
          state.systems[systemSymbol][market.symbol].static.exchange =
            market.exchange;
          state.systems[systemSymbol][market.symbol].static.imports =
            market.imports;
          state.systems[systemSymbol][market.symbol].static.exports =
            market.exports;

          if (market.tradeGoods) {
            state.systems[systemSymbol][market.symbol].tradeGoods.push({
              timestamp: Date.now(),
              tradeGoods: market.tradeGoods,
            });
          }

          if (market.transactions) {
            state.systems[systemSymbol][market.symbol].transactions = [
              ...new Set([
                ...state.systems[systemSymbol][market.symbol].transactions,
                ...market.transactions,
              ]),
            ];
          }
        }
      },
    ),

    setMarket: create.reducer(
      (
        state,
        action: PayloadAction<{ systemSymbol: string; market: Market }>,
      ) => {
        const { systemSymbol, market } = action.payload;
        if (!state.systems[systemSymbol]) {
          state.systems[systemSymbol] = {};
        }

        if (!state.systems[systemSymbol][market.symbol]) {
          state.systems[systemSymbol][market.symbol] = {
            static: {
              imports: [],
              exports: [],
              exchange: [],
            },
            tradeGoods: [],
            transactions: [],
          };
        }
        state.systems[systemSymbol][market.symbol].static.exchange =
          market.exchange;
        state.systems[systemSymbol][market.symbol].static.imports =
          market.imports;
        state.systems[systemSymbol][market.symbol].static.exports =
          market.exports;

        if (market.tradeGoods) {
          state.systems[systemSymbol][market.symbol].tradeGoods.push({
            timestamp: Date.now(),
            tradeGoods: market.tradeGoods,
          });
        }

        if (market.transactions) {
          state.systems[systemSymbol][market.symbol].transactions = [
            ...new Set([
              ...state.systems[systemSymbol][market.symbol].transactions,
              ...market.transactions,
            ]),
          ];
        }
      },
    ),

    clearSystemMarkets: create.reducer(
      (state, action: PayloadAction<{ systemSymbol: string }>) => {
        const { systemSymbol } = action.payload;
        for (const symbol in state.systems[systemSymbol]) {
          delete state.systems[systemSymbol][symbol];
        }
      },
    ),
    clearAllMarkets: create.reducer((state) => {
      state.systems = {};
    }),
    // The function below is called a thunk and allows us to perform async logic. It
    // can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
    // will call the thunk with the `dispatch` function as the first argument. Async
    // code can then be executed and other actions can be dispatched. Thunks are
    // typically used to make async requests.
    // cacheSystems: create.asyncThunk(
    //   async (onProgress?: (progress: number, total: number) => void) => {
    //     const response = await fetchCount(amount);
    //     // The value we return becomes the `fulfilled` action payload
    //     return response.data;
    //   },
    //   {
    //     pending: (state) => {
    //       state.status = "loading";
    //     },
    //     fulfilled: (state, action) => {
    //       state.status = "idle";
    //       state.value += action.payload;
    //     },
    //     rejected: (state) => {
    //       state.status = "failed";
    //     },
    //   },
    // )
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectMarketSystems: (systems) => systems.systems,
    selectSystemMarkets: (
      systems,
      symbol: string,
    ): { [key: string]: MarketState } => systems.systems[symbol] || empty,
    selectSystemMarket: (
      systems,
      symbol: string,
      marketSymbol: string,
    ): MarketState | undefined =>
      systems.systems[symbol][marketSymbol] || undefined,
  },
});

// Action creators are generated for each case reducer function.
export const { clearAllMarkets, setMarket, putMarkets, clearSystemMarkets } =
  marketSlice.actions;
// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectMarketSystems, selectSystemMarket, selectSystemMarkets } =
  marketSlice.selectors;
