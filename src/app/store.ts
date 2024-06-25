import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { counterSlice } from "../features/counter/counterSlice";
import { quotesApiSlice } from "../features/quotes/quotesApiSlice";
import { surveySlice } from "./spaceTraderAPI/redux/surveySlice";
import type { PersistConfig } from "redux-persist";
import { persistReducer, persistStore } from "redux-persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import { contractSlice } from "./spaceTraderAPI/redux/contractSlice";
import { systemSlice } from "./spaceTraderAPI/redux/systemSlice";
import { fleetSlice } from "./spaceTraderAPI/redux/fleetSlice";
import createIdbStorage from "@piotr-cz/redux-persist-idb-storage";
import { waypointSlice } from "./spaceTraderAPI/redux/waypointSlice";
import { configSlice } from "./spaceTraderAPI/redux/configSlice";
import { agentSlice } from "./spaceTraderAPI/redux/agentSlice";

// Create a persist config for Redux Persist
const persistConfig: PersistConfig<RootState> = {
  key: "root", // Key for the persisted data
  stateReconciler: autoMergeLevel2, // see "Merge Process" section for details.
  // blacklist: [],
  storage: createIdbStorage({ name: "myApp", storeName: "keyval" }),
  serialize: false, // Data serialization is not required and disabling it allows you to inspect storage value in DevTools; Available since redux-persist@5.4.0
  // @ts-ignore
  deserialize: false, // Required to bear same value as `serialize` since redux-persist@6.0
};

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
//const rootReducer = combineSlices(counterSlice, quotesApiSlice, surveySlice);
// because persist-redux we need to call `combineReducers`
const rootReducer = combineSlices(
  configSlice,
  counterSlice,
  quotesApiSlice,
  surveySlice,
  fleetSlice,
  contractSlice,
  systemSlice,
  waypointSlice,
  agentSlice,
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
          ignoredPaths: ["systems.systems"],
        },

        immutableCheck: {
          // Ignore state paths, e.g. state for 'items':
          ignoredPaths: ["systems.systems"],
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
