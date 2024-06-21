import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";
import type { Cooldown, Ship, ShipCargo, ShipFuel, ShipNav } from "../api";

export interface FleetSliceState {
  ships: Ship[];
}

const initialState: FleetSliceState = {
  ships: [],
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const fleetSlice = createAppSlice({
  name: "fleet",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    addShips: create.reducer((state, action: PayloadAction<Ship[]>) => {
      state.ships.push(...action.payload);
    }),

    putShips: create.reducer((state, action: PayloadAction<Ship[]>) => {
      // adds ships to fleet not already in it and updates if already in it
      state.ships = state.ships.filter(
        (ship) => !action.payload.some((s) => s.symbol === ship.symbol),
      );
      state.ships.push(...action.payload);
    }),

    setShips: create.reducer((state, action: PayloadAction<Ship[]>) => {
      state.ships = action.payload;
    }),
    clearShips: create.reducer((state) => {
      state.ships = [];
    }),
    // Use the `PayloadAction` type to declare the contents of `action.payload`
    addShip: create.reducer((state, action: PayloadAction<Ship>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes

      state.ships.push(action.payload);
    }),

    putShip: create.reducer(
      (state, action: PayloadAction<{ symbol?: string; ship: Ship }>) => {
        const { symbol, ship } = action.payload;
        const shipsSymbol = symbol || ship.symbol;
        const id = state.ships.findIndex((w) => w.symbol === shipsSymbol);
        if (id >= 0) {
          state.ships[id] = ship;
        } else {
          state.ships.push(ship);
        }
      },
    ),
    setShipFuel: create.reducer(
      (state, action: PayloadAction<{ symbol: string; fuel: ShipFuel }>) => {
        const { symbol, fuel } = action.payload;
        state.ships.map((w) => {
          if (w.symbol === symbol) {
            w.fuel = fuel;
          }
          return w;
        });
      },
    ),
    setShipNav: create.reducer(
      (state, action: PayloadAction<{ symbol: string; nav: ShipNav }>) => {
        const { symbol, nav } = action.payload;
        state.ships.map((w) => {
          if (w.symbol === symbol) {
            w.nav = nav;
          }
          return w;
        });
      },
    ),
    setShipCargo: create.reducer(
      (state, action: PayloadAction<{ symbol: string; cargo: ShipCargo }>) => {
        const { symbol, cargo } = action.payload;
        state.ships.map((w) => {
          if (w.symbol === symbol) {
            w.cargo = cargo;
          }
          return w;
        });
      },
    ),
    setShipCooldown: create.reducer(
      (
        state,
        action: PayloadAction<{ symbol: string; cooldown: Cooldown }>,
      ) => {
        const { symbol, cooldown } = action.payload;
        state.ships.map((w) => {
          if (w.symbol === symbol) {
            w.cooldown = cooldown;
          }
          return w;
        });
      },
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectShips: (fleet) => fleet.ships,
    selectShip: (fleet, symbol?: string) =>
      fleet.ships.find((w) => w.symbol === symbol),
  },
});

// Action creators are generated for each case reducer function.
export const {
  addShips,
  setShips,
  putShips,
  clearShips,
  addShip,
  putShip,
  setShipFuel,
  setShipNav,
  setShipCargo,
  setShipCooldown,
} = fleetSlice.actions;
// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectShips, selectShip } = fleetSlice.selectors;
