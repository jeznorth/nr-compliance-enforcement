import { Action, Dispatch, PayloadAction, ThunkAction, createSlice, current } from "@reduxjs/toolkit";
import { RootState, AppThunk } from "../store";
import config from "../../../config";
import { ComplaintCollection, ComplaintState } from "../../types/state/complaint-state";
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
import { generateApiParameters, get, patch, post } from "../../common/api";
import { ComplaintQueryParams } from "../../types/api-params/complaint-query-params";
import { Feature } from "../../types/maps/bcGeocoderType";
import { ToggleSuccess, ToggleError } from "../../common/toast";
import { ComplaintSearchResults } from "../../types/api-params/complaint-results";
import { Coordinates } from "../../types/app/coordinate-type";

import { AllegationComplaint as AllegationComplaintModel } from "../../types/app/complaints/allegation-complaint";
import { WildlifeComplaint } from "../../types/app/complaints/wildlife-complaint";
import { MapSearchResults } from "../../types/complaints/map-return";
import { ComplaintMapItem } from "../../types/app/complaints/complaint-map-item";
import { Delegate } from "../../types/app/people/delegate";

const initialState: ComplaintState = {
  complaintItems: {
    wildlife: [],
    allegations: [],
  },
  totalCount: 0,
  complaint: null,
  complaintLocation: null,

  zoneAtGlance: {
    hwcr: { assigned: 0, unassigned: 0, total: 0, offices: [] },
    allegation: { assigned: 0, unassigned: 0, total: 0, offices: [] },
  },

  mappedItems: { items: [], unmapped: 0 },
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
    setTotalCount(state, action) {
      state.totalCount = action.payload;
    },

    setComplaint: (state, action) => {
      const { payload: complaint } = action;
      return { ...state, complaint };
    },
    setGeocodedComplaintCoordinates: (state, action) => {
      const { payload: complaintLocation } = action;
      return { ...state, complaintLocation };
    },
    setZoneAtAGlance: (state, action) => {
      const { payload: statistics } = action;
      const { type, ...rest } = statistics;
      const { zoneAtGlance } = state;

      const update =
        type === ComplaintType.HWCR_COMPLAINT ? { ...zoneAtGlance, hwcr: rest } : { ...zoneAtGlance, allegation: rest };

      return { ...state, zoneAtGlance: update };
    },
    updateWildlifeComplaintByRow: (state, action: PayloadAction<HwcrComplaint>) => {
      const { payload: updatedComplaint } = action;
      const { complaintItems } = current(state);
      const { wildlife } = complaintItems;

      const index = wildlife.findIndex(({ hwcrId }) => hwcrId === updatedComplaint.hwcr_complaint_guid);

      if (index !== -1) {
        const {
          complaint_identifier: {
            complaint_status_code: { complaint_status_code },
            person_complaint_xref,
          },
        } = updatedComplaint;
        const newStatus = complaint_status_code;
        const delegates = !person_complaint_xref[0] ? [] : [convertPersonXrefToDelegate(person_complaint_xref[0])]

        let complaint = { ...wildlife[index], status: newStatus, delegates };
        const update = [...wildlife];
        update[index] = complaint;

        const updatedItems = { ...complaintItems, wildlife: update };

        return { ...state, complaintItems: updatedItems };
      }
    },

    updateAllegationComplaintByRow: (state, action: PayloadAction<AllegationComplaint>) => {
      const { payload: updatedComplaint } = action;
      const { complaintItems } = current(state);
      const { allegations } = complaintItems;

      const index = allegations.findIndex(({ ersId }) => ersId === updatedComplaint.allegation_complaint_guid);

      if (index !== -1) {
        const {
          complaint_identifier: {
            complaint_status_code: { complaint_status_code },
            person_complaint_xref,
          },
        } = updatedComplaint;
        const newStatus = complaint_status_code;
        const delegates = !person_complaint_xref[0] ? [] : [convertPersonXrefToDelegate(person_complaint_xref[0])]

        let complaint = { ...allegations[index], status: newStatus, delegates };
        const update = [...allegations];
        update[index] = complaint;

        const updatedItems = { ...complaintItems, allegations: update };

        return { ...state, complaintItems: updatedItems };
      }
    },
    setMappedComplaints: (state, action) => {
      const { mappedItems } = state;
      const {
        payload: { complaints, unmappedComplaints },
      } = action;

      const update = {
        ...mappedItems,
        items: complaints,
        unmapped: unmappedComplaints,
      };

      return { ...state, mappedItems: update };
    },
  },

  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {},
});

// export the actions/reducers
export const {
  setComplaints,
  setTotalCount,
  setComplaint,
  setGeocodedComplaintCoordinates,
  setZoneAtAGlance,
  updateWildlifeComplaintByRow,
  updateAllegationComplaintByRow,
  setMappedComplaints,
} = complaintSlice.actions;

//-- redux thunks
export const getComplaints =
  (complaintType: string, payload: ComplaintFilters): AppThunk =>
  async (dispatch, getState) => {
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
      violationFilter,
      complaintStatusFilter,
      page,
      pageSize,
      query,
    } = payload;

    try {
      dispatch(setComplaint(null));

      let parameters = generateApiParameters(`${config.API_BASE_URL}/v1/complaint/search/${complaintType}`, {
        sortBy: sortColumn,
        orderBy: sortOrder,
        region: regionCodeFilter?.value,
        zone: zoneCodeFilter?.value,
        community: areaCodeFilter?.value,
        officerAssigned: officerFilter?.value,
        natureOfComplaint: natureOfComplaintFilter?.value,
        speciesCode: speciesCodeFilter?.value,
        incidentReportedStart: startDateFilter,
        incidentReportedEnd: endDateFilter,
        violationCode: violationFilter?.value,
        status: complaintStatusFilter?.value,
        page: page,
        pageSize: pageSize,
        query: query,
      });

      const { complaints, totalCount } = await get<ComplaintSearchResults, ComplaintQueryParams>(dispatch, parameters);

      dispatch(setComplaints({ type: complaintType, data: complaints }));
      dispatch(setTotalCount(totalCount));
    } catch (error) {
      console.log(`Unable to retrieve ${complaintType} complaints: ${error}`);
    }
  };

export const getMappedComplaints =
  (complaintType: string, payload: ComplaintFilters): AppThunk =>
  async (dispatch, getState) => {
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
      violationFilter,
      complaintStatusFilter,
      page,
      pageSize,
      query,
    } = payload;

    try {
      dispatch(setComplaint(null));

      let parameters = generateApiParameters(`${config.API_BASE_URL}/v1/complaint/map/search/${complaintType}`, {
        sortBy: sortColumn,
        orderBy: sortOrder,
        region: regionCodeFilter?.value,
        zone: zoneCodeFilter?.value,
        community: areaCodeFilter?.value,
        officerAssigned: officerFilter?.value,
        natureOfComplaint: natureOfComplaintFilter?.value,
        speciesCode: speciesCodeFilter?.value,
        incidentReportedStart: startDateFilter,
        incidentReportedEnd: endDateFilter,
        violationCode: violationFilter?.value,
        status: complaintStatusFilter?.value,
        page: page,
        pageSize: pageSize,
        query: query,
      });

      const response = await get<MapSearchResults, ComplaintQueryParams>(dispatch, parameters);

      dispatch(setMappedComplaints(response));
    } catch (error) {
      console.log(`Unable to retrieve ${complaintType} complaints: ${error}`);
    }
  };

export const getWildlifeComplaintByComplaintIdentifier =
  (id: string): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(setComplaint(null));

      const parameters = generateApiParameters(
        `${config.API_BASE_URL}/v1/hwcr-complaint/by-complaint-identifier/${id}`
      );
      const response = await get<HwcrComplaint>(dispatch, parameters);

      dispatch(setComplaint({ ...response }));
    } catch (error) {}
  };

export const getWildlifeComplaintByComplaintIdentifierSetUpdate =
  (id: string, setUpdateComplaint: Function): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(setComplaint(null));

      const parameters = generateApiParameters(
        `${config.API_BASE_URL}/v1/hwcr-complaint/by-complaint-identifier/${id}`
      );
      const response = await get<HwcrComplaint>(dispatch, parameters);

      setUpdateComplaint(response);

      dispatch(setComplaint({ ...response }));
    } catch (error) {
      //-- handle the error
    }
  };

export const getAllegationComplaintByComplaintIdentifier =
  (id: string): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(setComplaint(null));

      const parameters = generateApiParameters(
        `${config.API_BASE_URL}/v1/allegation-complaint/by-complaint-identifier/${id}`
      );
      const response = await get<AllegationComplaint>(dispatch, parameters);

      dispatch(setComplaint({ ...response }));
    } catch (error) {
      //-- handle the error
    }
  };

export const getAllegationComplaintByComplaintIdentifierSetUpdate =
  (id: string, setUpdateComplaint: Function): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(setComplaint(null));

      const parameters = generateApiParameters(
        `${config.API_BASE_URL}/v1/allegation-complaint/by-complaint-identifier/${id}`
      );
      const response = await get<AllegationComplaint>(dispatch, parameters);

      setUpdateComplaint(response);

      dispatch(setComplaint({ ...response }));
    } catch (error) {
      //-- handle the error
    }
  };

export const getZoneAtAGlanceStats =
  (zone: string, type: ComplaintType): AppThunk =>
  async (dispatch) => {
    try {
      const parameters = generateApiParameters(
        `${config.API_BASE_URL}/v1/${
          type === ComplaintType.HWCR_COMPLAINT ? "hwcr" : "allegation"
        }-complaint/stats/by-zone/${zone}`
      );

      const response = await get<ZoneAtAGlanceStats>(dispatch, parameters);

      dispatch(setZoneAtAGlance({ ...response, type }));
    } catch (error) {
      //-- handle the error message
    }
  };

// used by the autocomplete
export const getComplaintLocationByAddress =
  (address: string): AppThunk =>
  async (dispatch) => {
    try {
      const parameters = generateApiParameters(`${config.API_BASE_URL}/bc-geo-coder/address?addressString=${address}`);
      const response = await get<Feature>(dispatch, parameters);
      dispatch(setGeocodedComplaintCoordinates(response));
    } catch (error) {}
  };

// Used to get the complaint location by area and address
export const getGeocodedComplaintCoordinates =
  (area: string, address?: string): AppThunk =>
  async (dispatch) => {
    try {
      let parameters;
      if (address && area) {
        parameters = generateApiParameters(
          `${config.API_BASE_URL}/bc-geo-coder/address?localityName=${area}&addressString=${address}`
        );
      } else {
        parameters = generateApiParameters(`${config.API_BASE_URL}/bc-geo-coder/address?localityName=${area}`);
      }
      const response = await get<Feature>(dispatch, parameters);
      dispatch(setGeocodedComplaintCoordinates(response));
    } catch (error) {}
  };

const updateComplaintStatus = async (dispatch: Dispatch, id: string, status: string) => {
  const parameters = generateApiParameters(`${config.API_BASE_URL}/v1/complaint/${id}`, {
    complaint_status_code: `${status}`,
  });

  await patch<Complaint>(dispatch, parameters);
};

export const createAllegationComplaint =
  (
    allegationComplaint: AllegationComplaint
  ): ThunkAction<Promise<string | undefined>, RootState, unknown, Action<string>> =>
  async (dispatch) => {
    let newComplaintId: string = "";
    try {
      if (
        allegationComplaint.complaint_identifier.location_geometry_point.coordinates[Coordinates.Latitude] === 0 &&
        allegationComplaint.complaint_identifier.location_geometry_point.coordinates[Coordinates.Longitude] === 0
      ) {
        const geocodeParameters = generateApiParameters(
          `${config.API_BASE_URL}/bc-geo-coder/address?localityName=${allegationComplaint.complaint_identifier.geo_organization_unit_code.long_description}&addressString=${allegationComplaint.complaint_identifier.location_summary_text}`
        );
        const geocodeResponse = await get<Feature>(dispatch, geocodeParameters);
        if (geocodeResponse?.features && geocodeResponse?.features.length === 1 && geocodeResponse?.minScore >= 90) {
          const coordinates = geocodeResponse?.features[0].geometry.coordinates;
          allegationComplaint.complaint_identifier.location_geometry_point.coordinates[Coordinates.Latitude] =
            coordinates[Coordinates.Latitude];
          allegationComplaint.complaint_identifier.location_geometry_point.coordinates[Coordinates.Longitude] =
            coordinates[Coordinates.Longitude];
        }
      }

      const postParameters = generateApiParameters(`${config.API_BASE_URL}/v1/allegation-complaint/`, {
        allegationComplaint: JSON.stringify(allegationComplaint),
      });
      await post<AllegationComplaint>(dispatch, postParameters).then(async (res) => {
        const newAllegationComplaint: AllegationComplaint = res;

        //-- get the created wildlife conflict
        const parameters = generateApiParameters(
          `${config.API_BASE_URL}/v1/allegation-complaint/by-complaint-identifier/${res}`
        );
        const response = await get<AllegationComplaint>(dispatch, parameters);

        dispatch(setComplaint({ ...response }));
        newComplaintId = newAllegationComplaint.complaint_identifier.complaint_identifier;
      });
      ToggleSuccess("Complaint has been saved");
      return newComplaintId;
    } catch (error) {
      ToggleError("Unable to create complaint");
      //-- add error handling
    }
  };

export const updateAllegationComplaint =
  (allegationComplaint: AllegationComplaint): AppThunk =>
  async (dispatch) => {
    try {
      const updateParams = generateApiParameters(
        `${config.API_BASE_URL}/v1/allegation-complaint/${allegationComplaint.allegation_complaint_guid}`,
        { allegationComplaint: JSON.stringify(allegationComplaint) }
      );

      await patch<AllegationComplaint>(dispatch, updateParams);

      //-- get the updated wildlife conflict
      const parameters = generateApiParameters(
        `${config.API_BASE_URL}/v1/allegation-complaint/by-complaint-identifier/${allegationComplaint.complaint_identifier.complaint_identifier}`
      );
      const response = await get<AllegationComplaint>(dispatch, parameters);

      dispatch(setComplaint({ ...response }));
      ToggleSuccess("Updates have been saved");
    } catch (error) {
      ToggleError("Unable to update complaint");
    }
  };

export const createWildlifeComplaint =
  (hwcrComplaint: HwcrComplaint): ThunkAction<Promise<string | undefined>, RootState, unknown, Action<string>> =>
  async (dispatch) => {
    let newComplaintId: string = "";
    try {
      if (
        hwcrComplaint.complaint_identifier.location_geometry_point.coordinates[Coordinates.Latitude] === 0 &&
        hwcrComplaint.complaint_identifier.location_geometry_point.coordinates[Coordinates.Longitude] === 0
      ) {
        const geocodeParameters = generateApiParameters(
          `${config.API_BASE_URL}/bc-geo-coder/address?localityName=${hwcrComplaint.complaint_identifier.geo_organization_unit_code.long_description}&addressString=${hwcrComplaint.complaint_identifier.location_summary_text}`
        );
        const geocodeResponse = await get<Feature>(dispatch, geocodeParameters);
        if (geocodeResponse?.features && geocodeResponse?.features.length === 1 && geocodeResponse?.minScore >= 90) {
          const coordinates = geocodeResponse?.features[0].geometry.coordinates;
          hwcrComplaint.complaint_identifier.location_geometry_point.coordinates[Coordinates.Latitude] =
            coordinates[Coordinates.Latitude];
          hwcrComplaint.complaint_identifier.location_geometry_point.coordinates[Coordinates.Longitude] =
            coordinates[Coordinates.Longitude];
        }
      }

      const postParameters = generateApiParameters(`${config.API_BASE_URL}/v1/hwcr-complaint/`, {
        hwcrComplaint: JSON.stringify(hwcrComplaint),
      });
      await post<HwcrComplaint>(dispatch, postParameters).then(async (res) => {
        const newHwcrComplaint: HwcrComplaint = res;

        //-- get the created wildlife conflict
        const parameters = generateApiParameters(
          `${config.API_BASE_URL}/v1/hwcr-complaint/by-complaint-identifier/${res}`
        );
        const response = await get<HwcrComplaint>(dispatch, parameters);

        dispatch(setComplaint({ ...response }));
        newComplaintId = newHwcrComplaint.complaint_identifier.complaint_identifier;
      });
      ToggleSuccess("Complaint has been saved");
      return newComplaintId;
    } catch (error) {
      ToggleError("Unable to create complaint");
      //-- add error handling
    }
  };

export const updateWildlifeComplaint =
  (hwcrComplaint: HwcrComplaint): AppThunk =>
  async (dispatch) => {
    try {
      const updateParams = generateApiParameters(
        `${config.API_BASE_URL}/v1/hwcr-complaint/${hwcrComplaint.hwcr_complaint_guid}`,
        { hwcrComplaint: JSON.stringify(hwcrComplaint) }
      );

      await patch<HwcrComplaint>(dispatch, updateParams);

      //-- get the updated wildlife conflict
      const parameters = generateApiParameters(
        `${config.API_BASE_URL}/v1/hwcr-complaint/by-complaint-identifier/${hwcrComplaint.complaint_identifier.complaint_identifier}`
      );
      const response = await get<HwcrComplaint>(dispatch, parameters);

      dispatch(setComplaint({ ...response }));
      ToggleSuccess("Updates have been saved");
    } catch (error) {
      ToggleError("Unable to update complaint");
    }
  };

export const updateWildlifeComplaintStatus =
  (complaint_identifier: string, newStatus: string): AppThunk =>
  async (dispatch) => {
    try {
      //-- update the status of the complaint
      await updateComplaintStatus(dispatch, complaint_identifier, newStatus);

      //-- get the wildlife conflict and update its status
      const parameters = generateApiParameters(
        `${config.API_BASE_URL}/v1/hwcr-complaint/by-complaint-identifier/${complaint_identifier}`
      );
      const response = await get<HwcrComplaint>(dispatch, parameters);

      dispatch(updateWildlifeComplaintByRow(response));
      const result = response;

      dispatch(setComplaint({ ...result }));
    } catch (error) {
      //-- add error handling
    }
  };

export const updateAllegationComplaintStatus =
  (complaint_identifier: string, newStatus: string): AppThunk =>
  async (dispatch) => {
    try {
      //-- update the status of the complaint
      await updateComplaintStatus(dispatch, complaint_identifier, newStatus);

      //-- get the wildlife conflict and update its status
      const parameters = generateApiParameters(
        `${config.API_BASE_URL}/v1/allegation-complaint/by-complaint-identifier/${complaint_identifier}`
      );
      const response = await get<AllegationComplaint>(dispatch, parameters);

      dispatch(updateAllegationComplaintByRow(response));
      const result = response;

      dispatch(setComplaint({ ...result }));
    } catch (error) {
      //-- add error handling
    }
  };

const convertPersonXrefToDelegate = (person: any): Delegate => {
  const {
    personComplaintXrefGuid: xrefId,
    active_ind: isActive,
    person_guid: { first_name: firstName, last_name: lastName, person_guid: id },
  } = person;

  const result: Delegate = {
    isActive: isActive,
    person: {
      id,
      firstName,
      lastName,
      middleName1: "",
      middleName2: "",
    },
    type: "ASSIGNEE",
    xrefId,
  };

  return result;
};

export const refreshComplaintItem =
  (id: string, complaintType: string): AppThunk =>
  async (dispatch, getState) => {
    try {
      const {
        complaints: {
          complaintItems: { wildlife },
        },
      } = getState();

      switch (complaintType) {
        case COMPLAINT_TYPES.ERS: {
          break;
        }
        case COMPLAINT_TYPES.HWCR:
        default: {
          //-- get all complaints from list of complaints except the updated complaint and readd it
          //-- to the list of complaints
          const items = wildlife.filter((item) => item.id !== id);
          const original = wildlife.find((item) => item.id === id);
          if (original) {
            //-- get the updated complaint
            const parameters = generateApiParameters(
              `${config.API_BASE_URL}/v1/hwcr-complaint/by-complaint-identifier/${id}`
            );
            const response = await get<HwcrComplaint>(dispatch, parameters);
            debugger;
            //-- refactor this when findById is updated
            const {
              complaint_identifier: {
                person_complaint_xref,
                complaint_status_code: { complaint_status_code },
              },
            } = response;

            const assigned = convertPersonXrefToDelegate(person_complaint_xref[0]);

            const updated = { ...original, status: complaint_status_code, delegates: [assigned] };

            const udpatedItems = [...items, updated];

            dispatch(setComplaints({ type: complaintType, data: udpatedItems }));
          }

          break;
        }
      }
    } catch (error) {
      //-- add error handling
    }
  };

//-- selectors
export const selectComplaint = (state: RootState): HwcrComplaint | AllegationComplaint | undefined | null => {
  const { complaints: root } = state;
  const { complaint } = root;
  return complaint;
};

export const selectGeocodedComplaintCoordinates = (state: RootState): Feature | null | undefined => {
  const {
    complaints: { complaintLocation },
  } = state;
  return complaintLocation;
};

export const selectComplaintHeader =
  (complaintType: string) =>
  (state: RootState): any => {
    const selectSharedHeader = (ceComplaint: Complaint, result: any) => {
      let officerAssigned = "Not Assigned";
      let personGuid = "";
      const {
        incident_reported_utc_timestmp: loggedDate,
        create_user_id: createdBy,
        update_utc_timestamp: lastUpdated,
        complaint_status_code: ceStatusCode,
      } = ceComplaint;

      const zone_code = ceComplaint.cos_geo_org_unit?.zone_code ?? "";
      const owned_by_agency_code = ceComplaint.owned_by_agency_code.agency_code ?? "";

      if (ceComplaint.person_complaint_xref.length > 0) {
        const firstName = ceComplaint.person_complaint_xref[0].person_guid.first_name;
        const lastName = ceComplaint.person_complaint_xref[0].person_guid.last_name;
        officerAssigned = `${firstName} ${lastName}`;
        personGuid = ceComplaint.person_complaint_xref[0].person_guid.person_guid;
      }

      const { complaint_status_code: statusCode, long_description: status } = ceStatusCode;

      result = {
        ...result,
        loggedDate,
        createdBy,
        lastUpdated,
        officerAssigned: officerAssigned,
        status,
        statusCode,
        zone: zone_code,
        personGuid,
        complaintAgency: owned_by_agency_code,
      };

      return result;
    };

    const selectWildlifeComplaintHeader = (state: RootState): ComplaintHeader => {
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
        statusCode: "",
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
          result = selectSharedHeader(ceComplaint, result);

          if (ceComplaintNatureCode) {
            const { long_description: natureOfComplaint, hwcr_complaint_nature_code: natureOfComplaintCode } =
              ceComplaintNatureCode;
            result = { ...result, natureOfComplaint, natureOfComplaintCode };
          }

          if (ceSpeciesCode) {
            const { short_description: species, species_code: speciesCode } = ceSpeciesCode;
            result = { ...result, species, speciesCode };
          }
        }
      }
      return result;
    };

    const selectAllegationComplaintHeader = (state: RootState): ComplaintHeader => {
      const {
        complaints: { complaint },
      } = state;

      let result = {
        loggedDate: "",
        createdBy: "",
        lastUpdated: "",
        officerAssigned: "",
        status: "",
        statusCode: "",
        zone: "",
        violationType: "", //-- needs to be violation as well
        personGuid: "",
        violationTypeCode: "",
      };

      if (complaint) {
        const { complaint_identifier: ceComplaint, violation_code: ceViolation } = complaint as AllegationComplaint;

        if (ceComplaint) {
          result = selectSharedHeader(ceComplaint, result);
        }

        if (ceViolation) {
          const { long_description: violationType, violation_code: violationTypeCode } = ceViolation;
          result = { ...result, violationType, violationTypeCode };
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

export const selectComplaintDetails =
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
          incident_utc_datetime,
          location_geometry_point: { coordinates },
        } = ceComplaint;

        const area_name = ceComplaint.cos_geo_org_unit?.area_name ?? "";
        const region_name = ceComplaint.cos_geo_org_unit?.region_name ?? "";
        const zone_name = ceComplaint.cos_geo_org_unit?.zone_name ?? "";
        const zone_code = ceComplaint.cos_geo_org_unit?.zone_code ?? "";
        const office_location_name = ceComplaint.cos_geo_org_unit?.office_location_name ?? "";

        results = {
          ...results,
          details: detail_text,
          location: location_summary_text,
          locationDescription: location_detailed_text,
          incidentDateTime: incident_utc_datetime,
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
          const { in_progress_ind: violationInProgress, observed_ind: violationObserved }: any = complaint;

          results = { ...results, violationInProgress, violationObserved };
          break;
        }
        case COMPLAINT_TYPES.HWCR: {
          const { attractant_hwcr_xref }: any = complaint;

          if (attractant_hwcr_xref) {
            const attractants = attractant_hwcr_xref.map(
              ({
                attractant_hwcr_xref_guid: key,
                attractant_code: { attractant_code: code, short_description: description },
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

export const selectComplaintCallerInformation = (state: RootState): ComplaintCallerInformation => {
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
      owned_by_agency_code,
    }: any = ceComplaint;

    results = {
      ...results,
      name: caller_name,
      primaryPhone: caller_phone_1,
      secondaryPhone: caller_phone_2,
      alternatePhone: caller_phone_3,
      address: caller_address,
      email: caller_email,
      referredByAgencyCode: referred_by_agency_code,
      ownedByAgencyCode: owned_by_agency_code,
    };
  }
  return results;
};

export const selectComplaintSuspectWitnessDetails = (state: RootState): ComplaintSuspectWitness => {
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

export const selectWildlifeZagOpenComplaints = (state: RootState): ZoneAtAGlanceStats => {
  const {
    complaints: { zoneAtGlance },
  } = state;

  return zoneAtGlance.hwcr;
};

export const selectAllegationZagOpenComplaints = (state: RootState): ZoneAtAGlanceStats => {
  const {
    complaints: { zoneAtGlance },
  } = state;

  return zoneAtGlance.allegation;
};

export const selectWildlifeComplaints = (state: RootState): Array<WildlifeComplaint> => {
  const {
    complaints: { complaintItems },
  } = state;
  const { wildlife } = complaintItems;

  return wildlife;
};

export const selectAllegationComplaints = (state: RootState): Array<any> => {
  const {
    complaints: { complaintItems },
  } = state;
  const { allegations } = complaintItems;

  return allegations;
};

export const selectTotalComplaintsByType =
  (complaintType: string) =>
  (state: RootState): number => {
    const {
      complaints: { totalCount },
    } = state;

    return totalCount;
  };

export const selectComplaintsByType =
  (complaintType: string) =>
  (state: RootState): Array<WildlifeComplaint> | Array<AllegationComplaintModel> => {
    switch (complaintType) {
      case COMPLAINT_TYPES.ERS:
        return selectAllegationComplaints(state);
      case COMPLAINT_TYPES.HWCR:
      default:
        return selectWildlifeComplaints(state);
    }
  };

///---
export const selectTotalMappedComplaints = (state: RootState): number => {
  const {
    complaints: {
      mappedItems: { items },
    },
  } = state;

  return items ? items.length : 0;
};

export const selectTotalUnmappedComplaints = (state: RootState): number => {
  const {
    complaints: {
      mappedItems: { unmapped },
    },
  } = state;

  return unmapped;
};

export const selectMappedComplaints = (state: RootState): Array<ComplaintMapItem> => {
  const {
    complaints: {
      mappedItems: { items },
    },
  } = state;

  if (items) {
    const records = items.map(({ id, location: { coordinates } }) => {
      const record: ComplaintMapItem = {
        id,
        latitude: coordinates[Coordinates.Latitude],
        longitude: coordinates[Coordinates.Longitude],
      };

      return record;
    });

    return records;
  } else {
    return new Array<ComplaintMapItem>();
  }
};

export default complaintSlice.reducer;
