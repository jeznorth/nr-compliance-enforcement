import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState, AppThunk } from "../store";
import config from "../../../config";
import axios from "axios";
import {
  ComplaintCollection,
  ComplaintState,
} from "../../types/state/complaint-state";
import { AllegationComplaint } from "../../types/complaints/allegation-complaint";
import { HwcrComplaint } from "../../types/complaints/hwcr-complaint";
import { ComplaintHeader } from "../../types/complaints/details/complaint-header";
import COMPLAINT_TYPES from "../../types/app/complaint-types";
import { ComplaintDetails } from "../../types/complaints/details/complaint-details";
import { ComplaintDetailsAttractant } from "../../types/complaints/details/complaint-attactant";
import { ComplaintCallerInformation } from "../../types/complaints/details/complaint-caller-information";
import { ComplaintSuspectWitness } from "../../types/complaints/details/complaint-suspect-witness-details";
import ComplaintType from "../../constants/complaint-types";
import { ZoneAtAGlanceStats } from "../../types/complaints/zone-at-a-glance-stats";
import { ComplaintFilters } from "../../types/complaints/complaint-filters";
import { Complaint } from "../../types/complaints/complaint";

const initialState: ComplaintState = {
  complaintItems: {
    wildlife: [],
    allegations: [],
  },
  complaint: null,
  zoneAtGlance: {
    hwcr: { assigned: 0, unassigned: 0, total: 0, offices: [] },
    allegation: { assigned: 0, unassigned: 0, total: 0, offices: [] },
  },
};

export const complaintSlice = createSlice({
  name: "complaints",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setComplaints: (state, action) => {
      const {
        payload: { type, data },
      } = action;
      const { complaintItems } = state;

      let update: ComplaintCollection = { wildlife: [], allegations: [] };

      switch (type) {
        case COMPLAINT_TYPES.ERS:
          update = { ...complaintItems, allegations: data };
          break;
        case COMPLAINT_TYPES.HWCR:
          update = { ...complaintItems, wildlife: data };
          break;
      }

      return { ...state, complaintItems: update };
    },
    setComplaint: (state, action) => {
      const { payload: complaint } = action;
      return { ...state, complaint };
    },
    setZoneAtAGlance: (state, action) => {
      const { payload: statistics } = action;
      const { type, ...rest } = statistics;
      const { zoneAtGlance } = state;

      const update =
        type === ComplaintType.HWCR_COMPLAINT
          ? { ...zoneAtGlance, hwcr: rest }
          : { ...zoneAtGlance, allegation: rest };

      return { ...state, zoneAtGlance: update };
    },
    updateWildlifeComplaintByRow: (
      state,
      action: PayloadAction<HwcrComplaint>
    ) => {
      const { payload: updatedComplaint } = action;
      const { complaintItems } = state;
      const { wildlife } = complaintItems;

      const index = wildlife.findIndex(
        ({ hwcr_complaint_guid }) =>
          hwcr_complaint_guid === updatedComplaint.hwcr_complaint_guid
      );

      if (index !== -1) {
        const update = [...wildlife];
        update[index] = updatedComplaint;

        const updatedItems = { ...complaintItems, wildlife: update };

        return { ...state, complaintItems: updatedItems };
      }
    },
    updateAllegationComplaintByRow: (
      state,
      action: PayloadAction<AllegationComplaint>
    ) => {
      const { payload: updatedComplaint } = action;
      const { complaintItems } = state;
      const { allegations } = complaintItems;

      const index = allegations.findIndex(
        ({ allegation_complaint_guid }) =>
          allegation_complaint_guid ===
          updatedComplaint.allegation_complaint_guid
      );

      if (index !== -1) {
        const update = [...allegations];
        update[index] = updatedComplaint;

        const updatedItems = { ...complaintItems, allegations: update };

        return { ...state, complaintItems: updatedItems };
      }
    },
  },

  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {},
});

// export the actions/reducers
export const {
  setComplaints,
  setComplaint,
  setZoneAtAGlance,
  updateWildlifeComplaintByRow,
  updateAllegationComplaintByRow,
} = complaintSlice.actions;

//-- redux thunks
export const getComplaints =
  (complaintType: string, payload: ComplaintFilters): AppThunk =>
  async (dispatch) => {
    const {
      sortColumn,
      sortOrder,
      regionCodeFilter,
      areaCodeFilter,
      zoneCodeFilter,
      officerFilter,
      natureOfComplaintFilter,
      speciesCodeFilter,
      startDateFilter,
      endDateFilter,
      statusFilter,
    } = payload;

    try {
      const token = localStorage.getItem("user");

      const apiEndpoint = (type: string): string => {
        switch (type) {
          case COMPLAINT_TYPES.ERS:
            return "allegation-complaint";
          default:
            return "hwcr-complaint";
        }
      };

      if (token) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        const response = await axios.get(
          `${config.API_BASE_URL}/v1/${apiEndpoint(complaintType)}/search`,
          {
            params: {
              sortColumn: sortColumn,
              sortOrder: sortOrder,
              region: regionCodeFilter?.value,
              zone: zoneCodeFilter?.value,
              community: areaCodeFilter?.value,
              officerAssigned: officerFilter?.value,
              natureOfComplaint: natureOfComplaintFilter?.value,
              speciesCode: speciesCodeFilter?.value,
              incidentReportedStart: startDateFilter,
              incidentReportedEnd: endDateFilter,
              status: statusFilter?.value,
            },
          }
        );
        dispatch(setComplaints({ type: complaintType, data: response.data }));
      }
    } catch (error) {
      console.log(`Unable to retrieve ${complaintType} complaints: ${error}`);
    }
  };

export const getWildlifeComplaintByComplaintIdentifier =
  (id: string): AppThunk =>
  async (dispatch) => {
    const token = localStorage.getItem("user");
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      const response = await axios.get(
        `${config.API_BASE_URL}/v1/hwcr-complaint/by-complaint-identifier/${id}`
      );
      const result = response.data;

      dispatch(setComplaint({ ...result }));
    }
  };

export const getAllegationComplaintByComplaintIdentifier =
  (id: string): AppThunk =>
  async (dispatch) => {
    const token = localStorage.getItem("user");
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      const response = await axios.get(
        `${config.API_BASE_URL}/v1/allegation-complaint/by-complaint-identifier/${id}`
      );
      const result = response.data;

      dispatch(setComplaint({ ...result }));
    }
  };

export const getZoneAtAGlanceStats =
  (zone: string, type: ComplaintType): AppThunk =>
  async (dispatch) => {
    const token = localStorage.getItem("user");
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      const response = await axios.get(
        `${config.API_BASE_URL}/v1/${
          type === ComplaintType.HWCR_COMPLAINT ? "hwcr" : "allegation"
        }-complaint/stats/by-zone/${zone}`
      );
      const result = response.data;

      dispatch(setZoneAtAGlance({ ...result, type }));
    }
  };

export const updateWildlifeComplaintStatus =
  (complaint_identifier: string, newStatus: string): AppThunk =>
  async (dispatch) => {
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
      // now get that hwcr complaint row and update the state
      const response = await axios.get(
        `${config.API_BASE_URL}/v1/hwcr-complaint/by-complaint-identifier/${complaint_identifier}`
      );
      dispatch(updateWildlifeComplaintByRow(response.data));
      const result = response.data;

      dispatch(setComplaint({ ...result }));
    }
  };

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
      dispatch(updateAllegationComplaintByRow(response.data));
    }
  };
};

//-- selectors
export const selectComplaint = (
  state: RootState
): HwcrComplaint | AllegationComplaint | undefined | null => {
  const { complaints: root } = state;
  const { complaint } = root;

  return complaint;
};

export const selectComplaintHeader =
  (complaintType: string) =>
  (state: RootState): any => {
    const selectWildlifeComplaintHeader = (
      state: RootState
    ): ComplaintHeader => {
      const {
        complaints: { complaint },
      } = state;

      let result = {
        loggedDate: "",
        createdBy: "",
        lastUpdated: "",
        officerAssigned: "",
        personGuid: "",
        status: "",
        natureOfComplaint: "", //-- needs to be violation as well
        natureOfComplaintCode: "",
        species: "", //-- not available for ers
        speciesCode: "",
        zone: "",
        firstName: "",
        lastName: "",
      };

      if (complaint) {
        const {
          complaint_identifier: ceComplaint,
          hwcr_complaint_nature_code: ceComplaintNatureCode,
          species_code: ceSpeciesCode,
        } = complaint as HwcrComplaint;

        if (ceComplaint) {
          let officerAssigned = "Not Assigned";
          let personGuid = "";
          const {
            incident_reported_datetime: loggedDate,
            create_user_id: createdBy,
            update_timestamp: lastUpdated,
            complaint_status_code: ceStatusCode,
            cos_geo_org_unit: { zone_code },
          } = ceComplaint;

          if (ceComplaint.person_complaint_xref.length > 0) {
            const firstName =
              ceComplaint.person_complaint_xref[0].person_guid.first_name;
            const lastName =
              ceComplaint.person_complaint_xref[0].person_guid.last_name;
            officerAssigned = `${firstName} ${lastName}`;
            personGuid =
              ceComplaint.person_complaint_xref[0].person_guid.person_guid;
          }

          const { complaint_status_code: status } = ceStatusCode;

          result = {
            ...result,
            loggedDate,
            createdBy,
            lastUpdated,
            officerAssigned: officerAssigned,
            status,
            zone: zone_code,
            personGuid,
          };

          if (ceComplaintNatureCode) {
            const {
              long_description: natureOfComplaint,
              hwcr_complaint_nature_code: natureOfComplaintCode,
            } = ceComplaintNatureCode;
            result = { ...result, natureOfComplaint, natureOfComplaintCode };
          }

          if (ceSpeciesCode) {
            const { short_description: species, species_code: speciesCode } =
              ceSpeciesCode;
            result = { ...result, species, speciesCode };
          }
        }
      }
      return result;
    };

    const selectAllegationComplaintHeader = (
      state: RootState
    ): ComplaintHeader => {
      const {
        complaints: { complaint },
      } = state;

      let result = {
        loggedDate: "",
        createdBy: "",
        lastUpdated: "",
        officerAssigned: "",
        status: "",
        zone: "",
        violationType: "", //-- needs to be violation as well
      };

      if (complaint) {
        const {
          complaint_identifier: ceComplaint,
          violation_code: ceViolation,
        } = complaint as AllegationComplaint;

        if (ceComplaint) {
          let officerAssigned = "Not Assigned";
          const {
            incident_reported_datetime: loggedDate,
            create_user_id: createdBy,
            update_timestamp: lastUpdated,
            complaint_status_code: ceStatusCode,
            cos_geo_org_unit: { zone_code },
          } = ceComplaint;

          if (ceComplaint.person_complaint_xref.length > 0) {
            const firstName =
              ceComplaint.person_complaint_xref[0].person_guid.first_name;
            const lastName =
              ceComplaint.person_complaint_xref[0].person_guid.last_name;
            officerAssigned = `${firstName} ${lastName}`;
          }

          const { complaint_status_code: status } = ceStatusCode;

          result = {
            ...result,
            loggedDate,
            createdBy,
            lastUpdated,
            officerAssigned,
            status,
            zone: zone_code,
          };
        }

        if (ceViolation) {
          const { long_description: violationType } = ceViolation;
          result = { ...result, violationType };
        }
      }

      return result;
    };

    switch (complaintType) {
      case COMPLAINT_TYPES.ERS:
        return selectAllegationComplaintHeader(state);
      case COMPLAINT_TYPES.HWCR:
        return selectWildlifeComplaintHeader(state);
    }
  };

export const selectComplaintDeails =
  (complaintType: string) =>
  (state: RootState): ComplaintDetails => {
    const {
      complaints: { complaint },
    } = state;

    let results: ComplaintDetails = {};

    if (complaint) {
      const { complaint_identifier: ceComplaint }: any = complaint;

      if (ceComplaint) {
        const {
          detail_text,
          location_summary_text,
          location_detailed_text,
          incident_datetime,
          location_geometry_point: { coordinates },
          cos_geo_org_unit: {
            area_name,
            region_name,
            zone_name,
            zone_code,
            office_location_name,
          },
        } = ceComplaint;

        results = {
          ...results,
          details: detail_text,
          location: location_summary_text,
          locationDescription: location_detailed_text,
          incidentDateTime: incident_datetime,
          coordinates,
          area: area_name,
          region: region_name,
          zone: zone_name,
          zone_code: zone_code,
          office: office_location_name,
        };
      }
    }

    if (complaint) {
      switch (complaintType) {
        case COMPLAINT_TYPES.ERS: {
          const {
            in_progress_ind: violationInProgress,
            observed_ind: violationObserved,
          }: any = complaint;

          results = { ...results, violationInProgress, violationObserved };
          break;
        }
        case COMPLAINT_TYPES.HWCR: {
          const { attractant_hwcr_xref }: any = complaint;

          if (attractant_hwcr_xref) {
            const attractants = attractant_hwcr_xref.map(
              ({
                attractant_hwcr_xref_guid: key,
                attractant_code: {
                  attractant_code: code,
                  short_description: description,
                },
              }: any): ComplaintDetailsAttractant => {
                return { key, code, description };
              }
            );

            results = { ...results, attractants };
          }
          break;
        }
      }
    }

    return results;
  };

export const selectComplaintCallerInformation = (
  state: RootState
): ComplaintCallerInformation => {
  const {
    complaints: { complaint },
  } = state;

  let results = {} as ComplaintCallerInformation;

  if (complaint) {
    const { complaint_identifier: ceComplaint } = complaint;

    const {
      caller_name,
      caller_phone_1,
      caller_phone_2,
      caller_phone_3,
      caller_address,
      caller_email,
      referred_by_agency_code,
    }: any = ceComplaint;

    const { long_description: description } = referred_by_agency_code || {};

    results = {
      ...results,
      name: caller_name,
      primaryPhone: caller_phone_1,
      secondaryPhone: caller_phone_2,
      alternatePhone: caller_phone_3,
      address: caller_address,
      email: caller_email,
      referredByAgencyCode: description,
    };
  }

  return results;
};

export const selectComplaintSuspectWitnessDetails = (
  state: RootState
): ComplaintSuspectWitness => {
  const {
    complaints: { complaint },
  } = state;

  let results = {} as ComplaintSuspectWitness;

  if (complaint) {
    const { suspect_witnesss_dtl_text: details }: any = complaint;

    results = { ...results, details };
  }

  return results;
};

export const selectWildlifeZagOpenComplaints = (
  state: RootState
): ZoneAtAGlanceStats => {
  const {
    complaints: { zoneAtGlance },
  } = state;

  return zoneAtGlance.hwcr;
};

export const selectAllegationZagOpenComplaints = (
  state: RootState
): ZoneAtAGlanceStats => {
  const {
    complaints: { zoneAtGlance },
  } = state;

  return zoneAtGlance.allegation;
};

export const selectWildlifeComplaints = (
  state: RootState
): Array<HwcrComplaint> => {
  const {
    complaints: { complaintItems },
  } = state;
  const { wildlife } = complaintItems;

  return wildlife;
};

export const selectWildlifeComplaintsCount = (state: RootState): number => {
  const {
    complaints: { complaintItems },
  } = state;
  const { wildlife } = complaintItems;

  return wildlife.length;
};

export const selectAllegationComplaints = (
  state: RootState
): Array<AllegationComplaint> => {
  const {
    complaints: { complaintItems },
  } = state;
  const { allegations } = complaintItems;

  return allegations;
};

export const selectAllegationComplaintsCount = (state: RootState): number => {
  const {
    complaints: { complaintItems },
  } = state;
  const { allegations } = complaintItems;

  return allegations.length;
};

export default complaintSlice.reducer;
