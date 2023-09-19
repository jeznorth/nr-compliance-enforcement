import { createSlice } from "@reduxjs/toolkit";
import { RootState, AppThunk } from "../store";
import config from "../../../config";
import { OfficerState } from "../../types/complaints/officers-state";
import { Officer } from "../../types/person/person";
import { UUID } from "crypto";
import { PersonComplaintXref } from "../../types/complaints/person-complaint-xref";
import { HwcrComplaint } from "../../types/complaints/hwcr-complaint";
import { AllegationComplaint } from "../../types/complaints/allegation-complaint";
import COMPLAINT_TYPES from "../../types/app/complaint-types";
import {
  getAllegationComplaintByComplaintIdentifier,
  getWildlifeComplaintByComplaintIdentifier,
  updateWildlifeComplaintByRow,
  updateAllegationComplaintByRow,
} from "./complaints";
import { toggleLoading } from "./app";
import { generateApiParameters, get, patch, post } from "../../common/api";
import { from } from "linq-to-typescript";
import { NewPersonComplaintXref } from "../../types/api-params/new-person-complaint-xref";
import { DropdownOption } from "../../types/code-tables/option";

const initialState: OfficerState = {
  officers: [],
};

export const officerSlice = createSlice({
  name: "officers",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setOfficers: (state, action) => {
      const {
        payload: { officers },
      } = action;
      return { ...state, officers };
    },
  },

  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {},
});

// export the actions/reducers
export const { setOfficers } = officerSlice.actions;

// Get list of the officers and update store
export const getOfficers =
  (zone?: string): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(toggleLoading(true));

      const parameters = generateApiParameters(
        `${config.API_BASE_URL}/v1/officer/`
      );
      const response = await get<Array<Officer>>(dispatch, parameters);

      if (response && from(response).any()) {
        dispatch(
          setOfficers({
            officers: response,
          })
        );
      }
    } catch (error) {
      //-- handle errors
    } finally {
      dispatch(toggleLoading(false));
    }
  };

// Assigns the current user to an office
export const assignCurrentUserToComplaint =
  (
    userId: string,
    userGuid: UUID,
    complaint_identifier: string,
    complaint_type: string
  ): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(toggleLoading(true));

      let officerParams = generateApiParameters(
        `${config.API_BASE_URL}/v1/officer/find-by-auth-user-guid/${userGuid}`
      );
      let officerResponse = await get<Officer>(dispatch, officerParams);

      if (officerResponse.auth_user_guid === undefined) {
        officerParams = generateApiParameters(
          `${config.API_BASE_URL}/v1/officer/find-by-userid/${userId}`
        );

        let officerByUserIdResponse = await get<Officer>(
          dispatch,
          officerParams
        );
        const officerGuid = officerByUserIdResponse.officer_guid;

        officerParams = generateApiParameters(
          `${config.API_BASE_URL}/v1/officer/${officerGuid}`,
          { auth_user_guid: userGuid }
        );

        await patch<Officer>(dispatch, officerParams);
      }

      dispatch(
        updateComplaintAssignee(
          userId,
          complaint_identifier,
          complaint_type,
          officerResponse.person_guid.person_guid as UUID,
        )
      );

      if (complaint_type === COMPLAINT_TYPES.HWCR) {
        dispatch(
          getWildlifeComplaintByComplaintIdentifier(complaint_identifier)
        );
      } else {
        dispatch(
          getAllegationComplaintByComplaintIdentifier(complaint_identifier)
        );
      }
    } catch (error) {
      //-- handle error
    } finally {
      dispatch(toggleLoading(false));
    }
  };

// creates a new cross reference for a person and office.  Assigns a person to an office.
export const updateComplaintAssignee =
  (
    currentUser: string,
    complaint_identifier: string,
    complaint_type: string,
    person_guid?: UUID,
  ): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(toggleLoading(true));

      // add new person complaint record
      const payload = {
        active_ind: true,
        person_guid: {
          person_guid: person_guid,
        },
        complaint_identifier: complaint_identifier,
        person_complaint_xref_code: "ASSIGNEE",
        create_user_id: currentUser,
      } as NewPersonComplaintXref;

      // assign a complaint to a person
      let personComplaintXrefGuidParams = generateApiParameters(
        `${config.API_BASE_URL}/v1/person-complaint-xref/${complaint_identifier}`,
        payload
      );
      await post<Array<PersonComplaintXref>>(
        dispatch,
        personComplaintXrefGuidParams
      );

      // refresh complaints.  Note we should just update the changed record instead of the entire list of complaints
      if (COMPLAINT_TYPES.HWCR === complaint_type) {
        const parameters = generateApiParameters(
          `${config.API_BASE_URL}/v1/hwcr-complaint/by-complaint-identifier/${complaint_identifier}`
        );
        const response = await get<HwcrComplaint>(dispatch, parameters);

        dispatch(updateWildlifeComplaintByRow(response));
        dispatch(
          getWildlifeComplaintByComplaintIdentifier(complaint_identifier)
        );
      } else {
        const parameters = generateApiParameters(
          `${config.API_BASE_URL}/v1/allegation-complaint/by-complaint-identifier/${complaint_identifier}`
        );
        const response = await get<AllegationComplaint>(dispatch, parameters);

        dispatch(updateAllegationComplaintByRow(response));

        dispatch(
          getAllegationComplaintByComplaintIdentifier(complaint_identifier)
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(toggleLoading(false));
    }
  };

//-- selectors

export const selectOfficers = (state: RootState): Array<any> => {
  const { officers: officerRoot } = state;
  const { officers } = officerRoot;

  return officers;
};

export const selectOfficersDropdown = (
  state: RootState
): Array<DropdownOption> => {
  const { officers: officerRoot } = state;
  const { officers } = officerRoot;

  const results = officers?.map((item) => {
    const {
      person_guid: { person_guid: id, first_name, last_name },
    } = item;
    return { value: id, label: `${first_name.substring(0, 1)} ${last_name}` };
  });

  return results;
};

// find officers that have an office in the given zone
export const selectOfficersByZone =
  (zone?: string) =>
  (state: RootState): Officer[] | null => {
    const { officers: officerRoot } = state;
    const { officers } = officerRoot;

    if (zone) {
      return officers.filter((officer) => {
        // check for nulls
        const zoneCode =
          officer?.office_guid?.cos_geo_org_unit?.zone_code ?? null;
        return zone === zoneCode;
      });
    }

    return [];
  };

export default officerSlice.reducer;
