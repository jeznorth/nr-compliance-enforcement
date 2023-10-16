import { Office } from "../../types/office/office";
import { OfficeState } from "../../types/office/offices-in-zone-state";
import { AppThunk, RootState } from "../store";
import { createSlice } from "@reduxjs/toolkit";
import config from "../../../config";
import { generateApiParameters, get } from "../../common/api";
import { from } from "linq-to-typescript";

const initialState: OfficeState = {
  officesInZone: [],
};

export const officeSlice = createSlice({
  name: "offices",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setOfficesInZone: (state, action) => {
      const { payload } = action;
      const officesInZone: Office[] = payload.officesInZone;
      return { ...state, officesInZone };
    },
  },

  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {},
});

// export the actions/reducers
export const { setOfficesInZone } = officeSlice.actions;

// Given a zone, returns a list of persons in that zone.
export const getOfficesInZone =
  (zone?: string): AppThunk =>
  async (dispatch) => {
    const parameters = generateApiParameters(
      `${config.API_BASE_URL}/v1/office/by-zone/${zone}`,
    );
    const response = await get<Array<Office>>(dispatch, parameters);

    if (response && from(response).any()) {
      dispatch(
        setOfficesInZone({
          officesInZone: response,
        }),
      );
    }
  };

export const selectOfficesInZone = (state: RootState) => {
  const { officesInZone } = state.offices;
  return officesInZone;
};

export default officeSlice.reducer;
