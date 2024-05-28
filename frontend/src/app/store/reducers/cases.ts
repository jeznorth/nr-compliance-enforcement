import { createAction, createSlice } from "@reduxjs/toolkit";
import { CasesState } from "../../types/state/cases-state";

const initialState: CasesState = {
  caseId: undefined,
  assessment: {
    action_required: undefined,
    date: undefined,
    justification: undefined,
    officer: undefined,
    assessment_type: [],
  },
  prevention: {
    date: undefined,
    officer: undefined,
    prevention_type: [],
  },
  isReviewRequired: false,
  reviewComplete: undefined,
  note: {
    note: "",
  },
  equipment: [],
  subject: [],
};

export const casesSlice = createSlice({
  name: "cases",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setCaseId: (state, action) => {
      const { payload } = action;
      return { ...state, caseId: payload };
    },
    setAssessment: (state, action) => {
      const {
        payload: { assessment },
      } = action;
      state.assessment = { ...assessment }; // Update only the assessment property
    },
    setPrevention: (state, action) => {
      const {
        payload: { prevention },
      } = action;
      state.prevention = { ...prevention }; // Update only the assessment property
    },
    setIsReviewedRequired: (state, action) => {
      const { payload } = action;
      return { ...state, isReviewRequired: payload };
    },
    setReviewComplete: (state, action) => {
      const { payload } = action;
      return { ...state, reviewComplete: payload };
    },
    clearAssessment: (state) => {
      state.assessment = { ...initialState.assessment };
    },
    clearPrevention: (state) => {
      state.prevention = { ...initialState.prevention };
    },
    setCaseFile: (state, action) => {
      const {
        payload: { note, equipment, subject },
      } = action;
      console.log(action);
      //--
      //-- TODO: need to have each dev add thier state to this section instead of requesting
      //-- each individual state. Add assessment, prevention, equipment here
      return { ...state, note, equipment, subject };
    },
  },

  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder.addCase(resetAssessment, (state) => {
      return initialState;
    });
  },
});

// export the actions/reducers
export const {
  setAssessment,
  setPrevention,
  setCaseId,
  setIsReviewedRequired,
  setReviewComplete,
  setCaseFile,
  clearAssessment,
  clearPrevention,
} = casesSlice.actions;

export const resetPrevention = createAction("prevention/reset");
export const resetAssessment = createAction("assessment/reset");
export default casesSlice.reducer;
