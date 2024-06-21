import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";
import type { Cooldown, Ship, ShipCargo, ShipFuel, ShipNav } from "../api";

export interface FleetSliceState {
  ships: { [key: string]: Ship };
}

const initialState: FleetSliceState = {
  ships: {},
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const fleetSlice = createAppSlice({
  name: "fleet",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    addShips: create.reducer((state, action: PayloadAction<Ship[]>) => {
      for (const ship of action.payload) {
        state.ships[ship.symbol] = ship;
      }
    }),

    setShips: create.reducer((state, action: PayloadAction<Ship[]>) => {
      state.ships = {};
      for (const ship of action.payload) {
        state.ships[ship.symbol] = ship;
      }
    }),
    clearShips: create.reducer((state) => {
      state.ships = {};
    }),
    // Use the `PayloadAction` type to declare the contents of `action.payload`
    setShip: create.reducer((state, action: PayloadAction<Ship>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes

      state.ships[action.payload.symbol] = action.payload;
    }),
    setShipFuel: create.reducer(
      (state, action: PayloadAction<{ symbol: string; fuel: ShipFuel }>) => {
        const { symbol, fuel } = action.payload;
        state.ships[symbol].fuel = fuel;
      },
    ),
    setShipNav: create.reducer(
      (state, action: PayloadAction<{ symbol: string; nav: ShipNav }>) => {
        const { symbol, nav } = action.payload;
        state.ships[symbol].nav = nav;
      },
    ),
    setShipCargo: create.reducer(
      (state, action: PayloadAction<{ symbol: string; cargo: ShipCargo }>) => {
        const { symbol, cargo } = action.payload;
        state.ships[symbol].cargo = cargo;
      },
    ),
    setShipCooldown: create.reducer(
      (
        state,
        action: PayloadAction<{ symbol: string; cooldown: Cooldown }>,
      ) => {
        const { symbol, cooldown } = action.payload;
        state.ships[symbol].cooldown = cooldown;
      },
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectShips: (fleet) => Object.values<Ship>(fleet.ships),
    selectShip: (fleet, symbol?: string) =>
      symbol ? fleet.ships[symbol] : undefined,
  },
});

// Action creators are generated for each case reducer function.
export const {
  addShips,
  setShips,
  setShip,
  clearShips,
  setShipFuel,
  setShipNav,
  setShipCargo,
  setShipCooldown,
} = fleetSlice.actions;
// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectShips, selectShip } = fleetSlice.selectors;
