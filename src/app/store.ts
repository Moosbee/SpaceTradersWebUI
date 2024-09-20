import createIdbStorage from "@piotr-cz/redux-persist-idb-storage";
import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import type { PersistConfig } from "redux-persist";
import { persistReducer, persistStore } from "redux-persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import {
  createStateSyncMiddleware,
  initMessageListener,
} from "redux-state-sync";
import { agentSlice } from "./spaceTraderAPI/redux/agentSlice";
import { configSlice } from "./spaceTraderAPI/redux/configSlice";
import { contractSlice } from "./spaceTraderAPI/redux/contractSlice";
import { fleetSlice } from "./spaceTraderAPI/redux/fleetSlice";
import { mapSlice } from "./spaceTraderAPI/redux/mapSlice";
import { surveySlice } from "./spaceTraderAPI/redux/surveySlice";
import { systemSlice } from "./spaceTraderAPI/redux/systemSlice";
import { waypointSlice } from "./spaceTraderAPI/redux/waypointSlice";
import type { Prettify } from "./utils/utils";

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
  surveySlice,
  fleetSlice,
  contractSlice,
  systemSlice,
  waypointSlice,
  agentSlice,
  mapSlice,
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
    middleware: (getDefaultMiddleware: any) => {
      const data1 = getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
          ignoredPaths: ["systems.systems"],
        },

        immutableCheck: {
          // Ignore state paths, e.g. state for 'items':
          ignoredPaths: ["systems.systems"],
        },
      });
      const data2 = data1.concat(
        createStateSyncMiddleware({
          blacklist: ["persist/PERSIST", "persist/REHYDRATE"],
          channel: "reduxStateSync",
        }),
      );
      return data2;
    },
  });
  // configure listeners using the provided defaults
  // optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
  setupListeners(store.dispatch);
  const tStore = store as Prettify<typeof store>;
  return tStore;
};

export const store = makeStore();
initMessageListener(store);
export const persistor = persistStore(store);

// Infer the type of `store`
export type AppStore = Prettify<typeof store>;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
