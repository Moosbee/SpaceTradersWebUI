import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { counterSlice } from "../features/counter/counterSlice";
import { quotesApiSlice } from "../features/quotes/quotesApiSlice";
import { surveySlice } from "./spaceTraderAPI/redux/surveySlice";
import type { PersistConfig } from "redux-persist";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import { fleetSlice } from "./spaceTraderAPI/redux/FleetSlice";
import { contractSlice } from "./spaceTraderAPI/redux/ContractSlice";

// Create a persist config for Redux Persist
const persistConfig: PersistConfig<RootState> = {
  key: "root", // Key for the persisted data
  storage, // The storage engine to use (default is localStorage for web)
  stateReconciler: autoMergeLevel2, // see "Merge Process" section for details.
  // blacklist: [],
};

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
//const rootReducer = combineSlices(counterSlice, quotesApiSlice, surveySlice);
// because persist-redux we need to call `combineReducers`
const rootReducer = combineSlices(
  counterSlice,
  quotesApiSlice,
  surveySlice,
  fleetSlice,
  contractSlice,
);

// Wrap the rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>;

// The store setup is wrapped in `makeStore` to allow reuse
// when setting up tests that need the same store config
export const makeStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: persistedReducer,
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        },
      }).concat(quotesApiSlice.middleware),
  });
  // configure listeners using the provided defaults
  // optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
  setupListeners(store.dispatch);
  return store;
};

export const store = makeStore();
export const persistor = persistStore(store);

// Infer the type of `store`
export type AppStore = typeof store;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
