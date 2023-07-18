import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState, AppThunk } from "../store";
import config from "../../../config";
import axios, { CancelTokenSource } from "axios";
import { AllegationComplaint } from "../../types/complaints/allegation-complaint";
import { AllegationComplaintState } from "../../types/complaints/allegation-complaints-state";
import { Complaint } from "../../types/complaints/complaint";
import Option from "../../types/app/option";

const initialState: AllegationComplaintState = {
  allegationComplaints: [],
};

let cancelTokenSource: CancelTokenSource | null = null;

export const allegationComplaintSlice = createSlice({
  name: "allegationComplaints",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setAllegationComplaints: (state, action) => {
      const { payload } = action;
      const allegationComplaints: AllegationComplaint[] =
        payload.allegationComplaints;
      return { ...state, allegationComplaints };
    },
    updateAllegationComplaintRow: (
      state,
      action: PayloadAction<AllegationComplaint>
    ) => {
      const updatedComplaint = action.payload;
      const index = state.allegationComplaints.findIndex(
        (row) =>
          row.allegation_complaint_guid ===
          updatedComplaint.allegation_complaint_guid
      );
      if (index !== -1) {
        state.allegationComplaints[index] = updatedComplaint;
      }
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {},
});

// export the actions/reducers
export const { setAllegationComplaints, updateAllegationComplaintRow } =
  allegationComplaintSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const getAllegationComplaints =
  (
    sortColumn: string,
    sortOrder: string,
    regionCodeFilter?: Option | null,
    zoneCodeFilter?: Option | null,
    areaCodeFilter?: Option | null,
    officerFilter?: Option | null,
    violationFilter?: Option | null,
    startDateFilter?: Date | undefined,
    endDateFilter?: Date | undefined,
    statusFilter?: Option | null
  ): AppThunk =>
  async (dispatch) => {
    try {
      if (cancelTokenSource) {
        cancelTokenSource.cancel("Request canceled due to new request");
      }

      cancelTokenSource = axios.CancelToken.source();
      const token = localStorage.getItem("user");
      if (token) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        const response = await axios.get(
          `${config.API_BASE_URL}/v1/allegation-complaint/search`,
          {
            cancelToken: cancelTokenSource.token,
            params: {
              sortColumn: sortColumn,
              sortOrder: sortOrder,
              region: regionCodeFilter?.value,
              zone: zoneCodeFilter?.value,
              community: areaCodeFilter?.value,
              officerAssigned: officerFilter?.value,
              violationCode: violationFilter?.value,
              incidentReportedStart: startDateFilter,
              incidentReportedEnd: endDateFilter,
              status: statusFilter?.value,
            },
          }
        );
        dispatch(
          setAllegationComplaints({
            allegationComplaints: response.data,
          })
        );
      }
    } catch (error) {
      console.log(`Unable to retrieve Allegation complaints: ${error}`);
    }
  };

// Update the complaint status and dispatch this change so that the affected row is updated in the state
export const updateAllegationComplaintStatus = (
  complaint_identifier: string,
  newStatus: string
): AppThunk => {
  return async (dispatch) => {
    const token = localStorage.getItem("user");
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      const complaintResponse = await axios.get<Complaint>(
        `${config.API_BASE_URL}/v1/complaint/${complaint_identifier}`
      );

      // first update the complaint status
      let updatedComplaint = complaintResponse.data;
      updatedComplaint.complaint_status_code.complaint_status_code = newStatus;
      await axios.patch(
        `${config.API_BASE_URL}/v1/complaint/${complaint_identifier}`,
        { complaint_status_code: `${newStatus}` }
      );

      // now get that allegation complaint row and update the state
      const response = await axios.get(
        `${config.API_BASE_URL}/v1/allegation-complaint/by-complaint-identifier/${complaint_identifier}`
      );
      dispatch(updateAllegationComplaintRow(response.data));
    }
  };
};

export const allegationComplaints = (state: RootState) => {
  const { allegationComplaints } = state.allegationComplaint;
  return allegationComplaints;
};

export default allegationComplaintSlice.reducer;
