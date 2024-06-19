import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../createAppSlice";
import type { Survey } from "../api";

export interface SurveySliceState {
  surveys: Survey[];
}

const initialState: SurveySliceState = {
  surveys: [],
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const surveySlice = createAppSlice({
  name: "surveys",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    // Use the `PayloadAction` type to declare the contents of `action.payload`
    addSurvey: create.reducer((state, action: PayloadAction<Survey>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes

      state.surveys.push(action.payload);
    }),
    addSurveys: create.reducer((state, action: PayloadAction<Survey[]>) => {
      state.surveys.push(...action.payload);
    }),
    setSurveys: create.reducer((state, action: PayloadAction<Survey[]>) => {
      state.surveys = action.payload;
    }),
    pruneSurveys: create.reducer((state) => {
      state.surveys = state.surveys.filter(
        (survey) => new Date(survey.expiration).getTime() < Date.now(),
      );
    }),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectSurveys: (surveys) => surveys.surveys,
    selectSurvey: (surveys, id: string) =>
      surveys.surveys.find((w) => w.signature === id),
  },
});

// Action creators are generated for each case reducer function.
export const { addSurvey, addSurveys, setSurveys, pruneSurveys } =
  surveySlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectSurvey, selectSurveys } = surveySlice.selectors;
