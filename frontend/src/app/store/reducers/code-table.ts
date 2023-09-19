import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState, store } from "../store";
import { from } from "linq-to-typescript";
import config from "../../../config";
import { CodeTableState } from "../../types/state/code-table-state";
import { AgencyCode } from "../../types/code-tables/agency-code";
import { CodeTable } from "../../types/code-tables/code-table";
import { ComplaintStatusCode } from "../../types/code-tables/complaint-status-code";
import { ViolationCode } from "../../types/code-tables/violation-code";
import { SpeciesCode } from "../../types/code-tables/species-code";
import { HwcrNatureOfComplaintCode } from '../../types/code-tables/hwcr-nature-of-complaint-code';
import { CosGeoOrgUnit } from "../../types/person/person";
import { AttractantCode } from "../../types/code-tables/attractant-code";
import Option from "../../types/app/option";
import { toggleLoading } from "./app";
import { generateApiParameters, get } from "../../common/api";
import { GeoOrganizationCode } from "../../types/code-tables/geo-orginaization-code";
import { DropdownOption } from '../../types/code-tables/option';

const initialState: CodeTableState = {
  agencyCodes: [],
  complaintStatusCodes: [],
  violationCodes: [],
  speciesCodes: [],
  wildlifeNatureOfComplaintCodes: [],
  areaCodes: [],
  attractantCodes: [],
  regions: [],
  zones: [],
  communities: [],
};

export const codeTableSlice = createSlice({
  name: "code-table",
  initialState,

  reducers: {
    setAgencyCodes: (
      state: CodeTableState,
      action: PayloadAction<Array<AgencyCode>>
    ) => {
      const { payload } = action;
      const data = payload.map(
        ({
          agency_code: value,
          long_description: label,
          short_description: description,
        }) => {
          return { value, label, description } as CodeTable;
        }
      );
      data.unshift({value: "", label: "", description: ""});
      return { ...state, agencyCodes: data };
    },
    setComplaintStatusCodes: (
      state: CodeTableState,
      action: PayloadAction<Array<ComplaintStatusCode>>
    ) => {
      const { payload } = action;
      const data = payload.map(
        ({
          complaint_status_code: value,
          long_description: label,
          short_description: description,
        }) => {
          return { value, label, description } as CodeTable;
        }
      );
      return { ...state, complaintStatusCodes: data };
    },
    setViolationCodes: (
      state: CodeTableState,
      action: PayloadAction<Array<ViolationCode>>
    ) => {
      const { payload } = action;
      const data = payload.map(
        ({
          violation_code: value,
          long_description: label,
          short_description: description,
        }) => {
          return { value, label, description } as CodeTable;
        }
      );
      return { ...state, violationCodes: data };
    },
    setSpeciesCodes: (
      state: CodeTableState,
      action: PayloadAction<Array<SpeciesCode>>
    ) => {
      const { payload } = action;
      const data = payload.map(
        ({
          species_code: value,
          long_description: label,
          short_description: description,
        }) => {
          return { value, label, description } as CodeTable;
        }
      );
      return { ...state, speciesCodes: data };
    },
    setWildlifeNatureOfComplaintCodes: (
      state: CodeTableState,
      action: PayloadAction<Array<HwcrNatureOfComplaintCode>>
    ) => {
      const { payload } = action;
      const data = payload.map(
        ({
          hwcr_complaint_nature_code: value,
          long_description: label,
          short_description: description,
        }) => {
          return { value, label, description } as CodeTable;
        }
      );
      return { ...state, wildlifeNatureOfComplaintCodes: data };
    },
    setAreaCodes: (
      state: CodeTableState,
      action: PayloadAction<Array<CosGeoOrgUnit>>
    ) => {
      const { payload } = action;
      const data = payload.map(({ area_code: value, area_name: label }) => {
        return { value, label, description: label } as CodeTable;
      });
      return { ...state, areaCodes: data };
    },
    setAttractantCodes: (
      state: CodeTableState,
      action: PayloadAction<Array<AttractantCode>>
    ) => {
      const { payload } = action;
      const data = payload.map(
        ({
          attractant_code: value,
          long_description: label,
          short_description: description,
        }) => {
          return { value, label, description } as CodeTable;
        }
      );
      return { ...state, attractantCodes: data };
    },
    setRegions: (
      state: CodeTableState,
      action: PayloadAction<Array<GeoOrganizationCode>>
    ) => {
      const { payload } = action;
      const data = payload.map(
        ({
          geo_organization_unit_code: value,
          long_description: label,
          short_description: description,
        }) => {
          return { value, label, description } as CodeTable;
        }
      );
      return { ...state, regions: data };
    },
    setZones: (
      state: CodeTableState,
      action: PayloadAction<Array<GeoOrganizationCode>>
    ) => {
      const { payload } = action;
      const data = payload.map(
        ({
          geo_organization_unit_code: value,
          long_description: label,
          short_description: description,
        }) => {
          return { value, label, description } as CodeTable;
        }
      );
      return { ...state, zones: data };
    },
    setCommunities: (
      state: CodeTableState,
      action: PayloadAction<Array<GeoOrganizationCode>>
    ) => {
      const { payload } = action;
      const data = payload.map(
        ({
          geo_organization_unit_code: value,
          long_description: label,
          short_description: description,
        }) => {
          return { value, label, description } as CodeTable;
        }
      );
      return { ...state, communities: data };
    },
  },

  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {},
});

export const {
  setAgencyCodes,
  setComplaintStatusCodes,
  setViolationCodes,
  setSpeciesCodes,
  setWildlifeNatureOfComplaintCodes,
  setAreaCodes,
  setAttractantCodes,
  setRegions,
  setZones,
  setCommunities,
} = codeTableSlice.actions;

export const fetchCodeTables = (): AppThunk => async (dispatch) => {
  const state = store.getState();
  const {
    codeTables: {
      agencyCodes,
      complaintStatusCodes,
      violationCodes,
      speciesCodes,
      wildlifeNatureOfComplaintCodes,
      areaCodes,
      attractantCodes,
      regions,
      zones,
      communities
    },
  } = state;

  dispatch(toggleLoading(true));

  try {
    console.log(JSON.stringify(agencyCodes));
    if (!from(agencyCodes).any()) {
      dispatch(fetchAgencyCodes());
    }

    if (!from(complaintStatusCodes).any()) {
      dispatch(fetchComplaintStatusCodes());
    }

    if (!from(violationCodes).any()) {
      dispatch(fetchViolationCodes());
    }

    if (!from(speciesCodes).any()) {
      dispatch(fetchSpeciesCodes());
    }

    if (!from(wildlifeNatureOfComplaintCodes).any()) {
      dispatch(fetchWildlifeNatureOfComplaintCodes());
    }

    if (!from(areaCodes).any()) {
      dispatch(fetchAreaCodes());
    }

    if (!from(attractantCodes).any()) {
      dispatch(fetchAttractantCodes());
    }

    if(!from(regions).any()){
      dispatch(fetchRegions())
    }

    if(!from(zones).any()){
      dispatch(fetchZones())
    }

    if(!from(communities).any()){
      dispatch(fetchCommunities())
    }
  } catch (error) {
  } finally {
    dispatch(toggleLoading(false));
  }
};

export const fetchAgencyCodes = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/agency-code`
  );
  const response = await get<Array<AgencyCode>>(dispatch, parameters);

  if (response && from(response).any()) {
    dispatch(setAgencyCodes(response));
  }
};

export const fetchViolationCodes = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/violation-code`
  );
  const response = await get<Array<ViolationCode>>(dispatch, parameters);

  if (response && from(response).any()) {
    dispatch(setViolationCodes(response));
  }
};

export const fetchSpeciesCodes = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/species-code`
  );
  const response = await get<Array<SpeciesCode>>(dispatch, parameters);

  if (response && from(response).any()) {
    dispatch(setSpeciesCodes(response));
  }
};

export const fetchWildlifeNatureOfComplaintCodes =
  (): AppThunk => async (dispatch) => {
    const parameters = generateApiParameters(
      `${config.API_BASE_URL}/v1/hwcr-complaint-nature-code`
    );
    const response = await get<Array<HwcrNatureOfComplaintCode>>(
      dispatch,
      parameters
    );

    if (response && from(response).any()) {
      dispatch(setWildlifeNatureOfComplaintCodes(response));
    }
  };

export const fetchComplaintStatusCodes = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/complaint-status-code`
  );
  const response = await get<Array<ComplaintStatusCode>>(dispatch, parameters);

  if (response && from(response).any()) {
    dispatch(setComplaintStatusCodes(response));
  }
};

export const fetchAreaCodes = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/cos-geo-org-unit`
  );
  const response = await get<Array<CosGeoOrgUnit>>(dispatch, parameters);

  if (response && from(response).any()) {
    dispatch(setAreaCodes(response));
  }
};

export const fetchAttractantCodes = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/attractant-code`
  );
  const response = await get<Array<AttractantCode>>(dispatch, parameters);

  if (response && from(response).any()) {
    dispatch(setAttractantCodes(response));
  }
};


export const fetchRegions = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/geo-organization-unit-code/find-all-regions`
  );
  const response = await get<Array<GeoOrganizationCode>>(dispatch, parameters);

  if (response && from(response).any()) {
    dispatch(setRegions(response));
  }
};

export const fetchZones = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/geo-organization-unit-code/find-all-zones`
  );
  const response = await get<Array<GeoOrganizationCode>>(dispatch, parameters);

  if (response && from(response).any()) {
    dispatch(setZones(response));
  }
};

export const fetchCommunities = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/geo-organization-unit-code/find-all-areas`
  );
  const response = await get<Array<GeoOrganizationCode>>(dispatch, parameters);

  if (response && from(response).any()) {
    dispatch(setCommunities(response));
  }
};

export const selectCodeTable =
  (table: string) =>
  (state: RootState): Array<CodeTable> => {
    const { codeTables } = state;
    const selected = codeTables[table as keyof CodeTableState];

    return selected;
  };

export const selectSortedCodeTable =
  (table: string, sortBy: string) =>
  (state: RootState): Array<CodeTable> => {
    const { codeTables } = state;
    const data = codeTables[table as keyof CodeTableState];

    let sorted = data.sort((a: any, b: any) =>
      a[sortBy].localeCompare(b[sortBy])
    );

    return sorted;
  };

export const selectAgencyDropdown = (
  state: RootState
): Array<Option> => {
  const {
    codeTables: { agencyCodes },
  } = state;
  return agencyCodes as Array<Option>;
};

export const selectComplaintStatusCodeDropdown = (
  state: RootState
): Array<Option> => {
  const {
    codeTables: { complaintStatusCodes },
  } = state;
  return complaintStatusCodes;
};

export const selectSpeciesCodeDropdown = (
  state: RootState
): Array<Option> => {
  const {
    codeTables: { speciesCodes },
  } = state;
  return speciesCodes;
};

export const selectViolationCodeDropdown = (
  state: RootState
): Array<Option> => {
  const {
    codeTables: { violationCodes },
  } = state;
  return violationCodes;
};

export const selectHwcrNatureOfComplaintCodeDropdown = (
  state: RootState
): Array<Option> => {
  const {
    codeTables: { wildlifeNatureOfComplaintCodes },
  } = state;
  return wildlifeNatureOfComplaintCodes;
};

export const selectAreaCodeDropdown = (
  state: RootState
): Array<Option> => {
  const {
    codeTables: { areaCodes },
  } = state;
  return areaCodes;
};

export const selectAttractantCodeDropdown = (
  state: RootState
): Array<Option> => {
  const {
    codeTables: { attractantCodes },
  } = state;
  return attractantCodes;
};

export const selectedZoneCodeDropdown = (
  state: RootState
): Array<DropdownOption> => {
  const {
    codeTables: { regions },
  } = state;
  return regions;
};

export const selectRegionCodeDropdown = (
  state: RootState
): Array<DropdownOption> => {
  const {
    codeTables: { zones },
  } = state;
  return zones;
};

export const selectCommunityCodeDropdown = (
  state: RootState
): Array<DropdownOption> => {
  const {
    codeTables: { communities },
  } = state;
  return communities;
};

export default codeTableSlice.reducer;
