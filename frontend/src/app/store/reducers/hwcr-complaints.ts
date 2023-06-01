import { createSlice } from "@reduxjs/toolkit";
import { RootState, AppThunk } from "../store";
import config from "../../../config";
import axios from "axios";
import { HwcrComplaint } from "../../types/complaints/hwcr-complaint";
import { HwcrComplaintState } from "../../types/complaints/hrcr-complaint-state";

const initialState: HwcrComplaintState = {
  hwcrComplaints: [],
};

export const hwcrComplaintSlice = createSlice({
  name: "hwcrComplaints",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setHwcrComplaints: (state, action) => {
      const { payload } = action;
      const hwcrComplaints:HwcrComplaint[] = payload.hwcrComplaints;
      return { ...state, hwcrComplaints};
    },
  },

  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {},
});

// export the actions/reducers
export const { setHwcrComplaints } = hwcrComplaintSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const getHwcrComplaints = (): AppThunk => async (dispatch) => {
  const token = localStorage.getItem("user");
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        
    const response = await axios.get(`${config.API_BASE_URL}/v1/hwcr-complaint`);
    dispatch(
      setHwcrComplaints({
        hwcrComplaints: response.data
      })
    );
  }
};

export const hwcrComplaints = (state: RootState) => { 
  const { hwcrComplaints } = state.hwcrComplaint;
  return hwcrComplaints;
}

export default hwcrComplaintSlice.reducer;