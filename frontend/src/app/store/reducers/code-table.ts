import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState, store } from "../store";
import { from } from "linq-to-typescript";
import config from "../../../config";
import { CodeTableState } from "../../types/state/code-table-state";
import { ComplaintStatusCode } from "../../types/code-tables/complaint-status-code";
import Option from "../../types/app/option";
import { generateApiParameters, get } from "../../common/api";
import { DropdownOption } from "../../types/app/drop-down-option";
import { Agency } from "../../types/app/code-tables/agency";
import { Attractant } from "../../types/app/code-tables/attactant";
import { CODE_TABLE_TYPES } from "../../constants/code-table-types";
import { NatureOfComplaint } from "../../types/app/code-tables/nature-of-complaint";
import { Species } from "../../types/app/code-tables/species";
import { Violation } from "../../types/app/code-tables/violation";
import { ComplaintType } from "../../types/app/code-tables/complaint-type";
import { Region } from "../../types/app/code-tables/region";
import { Zone } from "../../types/app/code-tables/zone";
import { Community } from "../../types/app/code-tables/community";
import { OrganizationCodeTable } from "../../types/app/code-tables/organization-code-table";
import { ReportedBy } from "../../types/app/code-tables/reported-by";
import { Justification } from "../../types/app/code-tables/justification";
import { AssessmentType } from "../../types/app/code-tables/assesment-type";

const initialState: CodeTableState = {
  agency: [],
  attractant: [],
  "complaint-status": [],
  "complaint-type": [],
  "nature-of-complaint": [],
  species: [],
  violation: [],
  regions: [],
  zones: [],
  communities: [],
  "area-codes": [],
  "reported-by": [],
  justification: [],
  "assessment-type": [],
};

export const codeTableSlice = createSlice({
  name: "code-table",
  initialState,

  reducers: {
    setCodeTable: (
      state: CodeTableState,
      action: PayloadAction<{ key: string; data: Array<any> }>
    ) => {
      const {
        payload: { key, data },
      } = action;
      return { ...state, [key]: data };
    },
  },

  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {},
});

export const { setCodeTable } = codeTableSlice.actions;

export const fetchCodeTables = (): AppThunk => async (dispatch) => {
  const state = store.getState();
  const {
    codeTables: {
      "complaint-type": complaintType,
      "area-codes": areaCodes,
      "complaint-status": complaintStatus,
      attractant,
      agency,
      violation,
      species,
      "nature-of-complaint": natureOfComplaint,
      regions,
      zones,
      communities,
      "reported-by": reportedBy,
      justification,
      "assessment-type": assessmentType,
    },
  } = state;

  try {
    if (!from(agency).any()) {
      dispatch(fetchAgencies());
    }

    if (!from(complaintStatus).any()) {
      dispatch(fetchComplaintStatus());
    }

    if (!from(violation).any()) {
      dispatch(fetchViolations());
    }

    if (!from(species).any()) {
      dispatch(fetchSpecies());
    }

    if (!from(natureOfComplaint).any()) {
      dispatch(fetchNatureOfComplaints());
    }

    if (!from(attractant).any()) {
      dispatch(fetchAttractants());
    }

    if (!from(regions).any()) {
      dispatch(fetchRegions());
    }

    if (!from(zones).any()) {
      dispatch(fetchZones());
    }

    if (!from(communities).any()) {
      dispatch(fetchCommunities());
    }

    if (!from(areaCodes).any()) {
      dispatch(fetchAreaCodes());
    }

    if (!from(complaintType).any()) {
      dispatch(fetchComplaintTypeCodes());
    }
    if (!from(reportedBy).any()) {
      dispatch(fetchReportedByCodes());
    }
    if (!from(justification).any()) {
      dispatch(fetchJustificationCodes());
    }
    if (!from(assessmentType).any()) {
      dispatch(fetchAssessmentTypeCodes());
    }
  } catch (error) {}
};

export const fetchAgencies = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/code-table/${CODE_TABLE_TYPES.AGENCY}`
  );
  const response = await get<Array<Agency>>(dispatch, parameters);

  if (response && from(response).any()) {
    const payload = { key: CODE_TABLE_TYPES.AGENCY, data: response };
    dispatch(setCodeTable(payload));
  }
};

export const fetchAttractants = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/code-table/${CODE_TABLE_TYPES.ATTRACTANT}`
  );
  const response = await get<Array<Attractant>>(dispatch, parameters);

  if (response && from(response).any()) {
    const payload = { key: CODE_TABLE_TYPES.ATTRACTANT, data: response };
    dispatch(setCodeTable(payload));
  }
};

export const fetchComplaintStatus = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/code-table/${CODE_TABLE_TYPES.COMPLAINT_STATUS}`
  );
  const response = await get<Array<ComplaintStatusCode>>(dispatch, parameters);

  if (response && from(response).any()) {
    const payload = { key: CODE_TABLE_TYPES.COMPLAINT_STATUS, data: response };
    dispatch(setCodeTable(payload));
  }
};

export const fetchNatureOfComplaints = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/code-table/${CODE_TABLE_TYPES.NATURE_OF_COMPLAINT}`
  );
  const response = await get<Array<NatureOfComplaint>>(dispatch, parameters);

  if (response && from(response).any()) {
    const payload = {
      key: CODE_TABLE_TYPES.NATURE_OF_COMPLAINT,
      data: response,
    };
    dispatch(setCodeTable(payload));
  }
};

export const fetchSpecies = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/code-table/${CODE_TABLE_TYPES.SPECIES}`
  );
  const response = await get<Array<Species>>(dispatch, parameters);

  if (response && from(response).any()) {
    const payload = {
      key: CODE_TABLE_TYPES.SPECIES,
      data: response,
    };
    dispatch(setCodeTable(payload));
  }
};

export const fetchViolations = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/code-table/${CODE_TABLE_TYPES.VIOLATIONS}`
  );
  const response = await get<Array<Violation>>(dispatch, parameters);

  if (response && from(response).any()) {
    const payload = {
      key: CODE_TABLE_TYPES.VIOLATIONS,
      data: response,
    };
    dispatch(setCodeTable(payload));
  }
};

export const fetchComplaintTypeCodes = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/code-table/${CODE_TABLE_TYPES.COMPLAINT_TYPE}`
  );
  const response = await get<Array<ComplaintType>>(dispatch, parameters);

  if (response && from(response).any()) {
    const payload = {
      key: CODE_TABLE_TYPES.COMPLAINT_TYPE,
      data: response,
    };
    dispatch(setCodeTable(payload));
  }
};

//-- these are going to need to come from the organizations
export const fetchAreaCodes = (): AppThunk => async (dispatch) => {
  const agency = "cos"; //-- TODO: when CE-212 is started this needs to be updated

  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/code-table/organization-by-agency/${agency}`
  );
  const response = await get<Array<OrganizationCodeTable>>(
    dispatch,
    parameters
  );

  if (response && from(response).any()) {
    const payload = {
      key: CODE_TABLE_TYPES.AREA_CODES,
      data: response,
    };
    dispatch(setCodeTable(payload));
  }
};

export const fetchRegions = (): AppThunk => async (dispatch) => {
  const agency = "cos"; //-- TODO: when CE-212 is started this needs to be updated

  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/code-table/regions-by-agency/${agency}`
  );
  const response = await get<Array<Region>>(dispatch, parameters);

  if (response && from(response).any()) {
    const payload = {
      key: CODE_TABLE_TYPES.REGIONS,
      data: response,
    };
    dispatch(setCodeTable(payload));
  }
};

export const fetchZones = (): AppThunk => async (dispatch) => {
  const agency = "cos"; //-- TODO: when CE-212 is started this needs to be updated

  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/code-table/zones-by-agency/${agency}`
  );
  const response = await get<Array<Zone>>(dispatch, parameters);

  if (response && from(response).any()) {
    const payload = {
      key: CODE_TABLE_TYPES.ZONES,
      data: response,
    };
    dispatch(setCodeTable(payload));
  }
};

export const fetchCommunities = (): AppThunk => async (dispatch) => {
  const agency = "cos"; //-- TODO: when CE-212 is started this needs to be updated

  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/code-table/communities-by-agency/${agency}`
  );
  const response = await get<Array<Community>>(dispatch, parameters);

  if (response && from(response).any()) {
    const payload = {
      key: CODE_TABLE_TYPES.COMMUNITIES,
      data: response,
    };
    dispatch(setCodeTable(payload));
  }
};

export const fetchReportedByCodes = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/code-table/${CODE_TABLE_TYPES.REPORTED_BY}`
  );
  const response = await get<Array<ReportedBy>>(dispatch, parameters);
  if (response && from(response).any()) {
    const payload = { key: CODE_TABLE_TYPES.REPORTED_BY, data: response };
    dispatch(setCodeTable(payload));
  }
};

export const fetchJustificationCodes = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/code-table/case-management/${CODE_TABLE_TYPES.JUSTIFICATION}`
  );
  const response = await get<Array<Justification>>(dispatch, parameters);
  if (response && from(response).any()) {
    const payload = { key: CODE_TABLE_TYPES.JUSTIFICATION, data: response };
    dispatch(setCodeTable(payload));
  }
};

export const fetchAssessmentTypeCodes = (): AppThunk => async (dispatch) => {
  const parameters = generateApiParameters(
    `${config.API_BASE_URL}/v1/code-table/case-management/${CODE_TABLE_TYPES.ASSESSMENT_TYPE}`
  );
  const response = await get<Array<AssessmentType>>(dispatch, parameters);
  if (response && from(response).any()) {
    const payload = { key: CODE_TABLE_TYPES.ASSESSMENT_TYPE, data: response };
    dispatch(setCodeTable(payload));
  }
};

export const selectCodeTable =
  (table: string) =>
  (state: RootState): Array<any> => {
    const { codeTables } = state;
    const selected = codeTables[table as keyof CodeTableState];

    return selected;
  };

export const selectComplaintTypeDropdown = (
  state: RootState
): Array<Option> => {
  const {
    codeTables: { "complaint-type": complaintTypes },
  } = state;

  const data = complaintTypes.map(({ complaintType, longDescription }) => {
    const item: Option = { label: longDescription, value: complaintType };
    return item;
  });
  return data;
};

export const selectAgencyDropdown = (state: RootState): Array<Option> => {
  const {
    codeTables: { agency },
  } = state;

  const data = agency.map(({ agency, longDescription }) => {
    const item: Option = { label: longDescription, value: agency };
    return item;
  });
  return data;
};

export const selectReportedByDropdown = (state: RootState): Array<Option> => {
  const {
    codeTables: { "reported-by": reportedBy },
  } = state;

  const data = reportedBy.map(({ reportedBy, longDescription }) => {
    const item: Option = { label: longDescription, value: reportedBy };
    return item;
  });
  return data;
};

export const selectComplaintStatusCodeDropdown = (
  state: RootState
): Array<Option> => {
  const {
    codeTables: { "complaint-status": complaintStatus },
  } = state;

  const data = complaintStatus.map(({ complaintStatus, longDescription }) => {
    const item: Option = { label: longDescription, value: complaintStatus };
    return item;
  });
  return data;
};

export const selectSpeciesCodeDropdown = (state: RootState): Array<Option> => {
  const {
    codeTables: { species },
  } = state;

  const data = species.map(({ species, longDescription }) => {
    const item: Option = { label: longDescription, value: species };
    return item;
  });
  return data;
};

export const selectViolationCodeDropdown = (
  state: RootState
): Array<Option> => {
  const {
    codeTables: { violation },
  } = state;

  const data = violation.map(({ violation, longDescription }) => {
    const item: Option = { label: longDescription, value: violation };
    return item;
  });
  return data;
};

export const selectJustificationCodeDropdown = (
  state: RootState
): Array<Option> => {
  const {
    codeTables: { justification },
  } = state;

  const data = justification.map(({ justification, longDescription }) => {
    const item: Option = { label: longDescription, value: justification };
    return item;
  });
  return data;
};

export const selectAssessmentTypeCodeDropdown = (
  state: RootState
): Array<Option> => {
  const {
    codeTables: { "assessment-type": assessmentType },
  } = state;

  const data = assessmentType.map(({ assessmentType, longDescription }) => {
    const item: Option = { label: longDescription, value: assessmentType };
    return item;
  });
  return data;
};

export const selectYesNoCodeDropdown = (
): Array<Option> => {
  const data: Option[] = 
    [ 
      {value: "Yes", label: "Yes"}, 
      {value: "No", label: "No"},
    ]
  return data;
};

export const selectHwcrNatureOfComplaintCodeDropdown = (
  state: RootState
): Array<Option> => {
  const {
    codeTables: { "nature-of-complaint": natureOfComplaints },
  } = state;

  const data = natureOfComplaints.map(
    ({ natureOfComplaint, longDescription }) => {
      const item: Option = { label: longDescription, value: natureOfComplaint };
      return item;
    }
  );
  return data;
};

export const selectAreaCodeDropdown = (state: RootState): Array<Option> => {
  const {
    codeTables: { "area-codes": areaCodes },
  } = state;

  const data = areaCodes.map(({ area, areaName }) => {
    const option: Option = { value: area, label: areaName };
    return option;
  });

  return data;
};

export const selectAttractantCodeDropdown = (
  state: RootState
): Array<Option> => {
  const {
    codeTables: { attractant },
  } = state;

  const data = attractant.map(({ attractant, shortDescription }) => {
    const item: Option = { label: shortDescription, value: attractant };
    return item;
  });

  return data;
};

export const selectZoneCodeDropdown = (
  state: RootState
): Array<DropdownOption> => {
  const {
    codeTables: { zones },
  } = state;

  const data = zones.map(({ code, name }) => {
      const item: DropdownOption = {
        label: name,
        value: code,
        description: name,
      };
      return item;
    });
  return data;
};

export const selectRegionCodeDropdown = (
  state: RootState
): Array<DropdownOption> => {
  const {
    codeTables: { regions },
  } = state;

  const data = regions.map(({ code, name }) => {
      const item: DropdownOption = {
        label: name,
        value: code,
        description: name,
      };
      return item;
    });
  return data;
};

export const selectCommunityCodeDropdown = (
  state: RootState
): Array<DropdownOption> => {
  const {
    codeTables: { communities },
  } = state;

  const data = communities
    .map(({ code, name }) => {
      const item: DropdownOption = {
        label: name,
        value: code,
        description: name,
      };
      return item;
    });

  return data;
};

export const selectCascadedFilter =
  (type: string, value?: string) =>
  (state: RootState): Array<DropdownOption> => {
    const {
      codeTables: { regions, zones },
    } = state;

    switch (type) {
      case "region": {
        const data = regions.map(({ code, name }) => {
          const item: DropdownOption = {
            label: name,
            value: code,
            description: name,
          };
          return item;
        });

        if (value) {
          return data.filter((item) => item.value === value);
        }

        return data;
      }
      case "zone": {
        const data = zones.map(({ code, name }) => {
          const item: DropdownOption = {
            label: name,
            value: code,
            description: name,
          };
          return item;
        });

        if (value) {
          const items = zones.filter(({ region }) => region === value);
          return items.map(({ code, name }) => {
            const item: DropdownOption = {
              label: name,
              value: code,
              description: name,
            };
            return item;
          });
        }

        return data;
      }
      case "community":
      default:
        break;
    }

    return [];
  };

export const selectCascadedFilters =
  (region?: string, zone?: string, community?: string) =>
  (state: RootState): any => {
    const {
      codeTables: { regions, zones, communities },
    } = state;

    let _regions: Array<DropdownOption> = [];
    let _zones: Array<DropdownOption> = [];
    let _communities: Array<DropdownOption> = [];

    if (!region && zone && !community) {
      const selected = zones.find((item) => item.code === zone);

      if (selected) {
        _regions = regions
          .filter((item) => item.code === selected.region)
          .map(({ code, name }) => {
            return {
              label: name,
              value: code,
              description: name,
            };
          });

        _zones = [
          {
            label: selected.name,
            value: selected.code,
            description: selected.name,
          },
        ];

        _communities = communities
          .filter((item) => item.zone === zone)
          .map(({ code, name }) => {
            return {
              label: name,
              value: code,
              description: name,
            };
          });
      }
    } else if (region && !zone && !community) {
      const selected = regions.find((item) => item.code === region);
      if (selected) {
        _regions = [
          {
            label: selected.name,
            value: selected.code,
            description: selected.name,
          },
        ];

        _zones = zones
          .filter((item) => item.region === region)
          .map(({ code, name }) => {
            return {
              label: name,
              value: code,
              description: name,
            };
          });

        _communities = communities
          .filter((item) => item.region === region)
          .map(({ code, name }) => {
            return {
              label: name,
              value: code,
              description: name,
            };
          });
      }
    } else if (!region && !zone && !community) {
      _regions = regions.map(({ code, name }) => {
        return {
          label: name,
          value: code,
          description: name,
        };
      });
      _zones = zones.map(({ code, name }) => {
        return {
          label: name,
          value: code,
          description: name,
        };
      });

      _communities = communities.map(({ code, name }) => {
        return {
          label: name,
          value: code,
          description: name,
        };
      });
      return {
        regions: _regions,
        zones: _zones,
        communities: _communities,
      };
    }

    return {
      regions: _regions,
      zones: _zones,
      communities: _communities,
    };
  };

export const selectCascadedRegion =
  (region?: string, zone?: string, community?: string) =>
  (state: RootState): Array<Option> => {
    const {
      codeTables: { regions, zones, communities },
    } = state;

    let results = regions;

    if (region) {
      return regions
        .filter((item) => item.code === region)
        .map(({ code, name }) => {
          return {
            label: name,
            value: code,
            description: name,
          };
        });
    }

    if (zone) {
      const selected = zones.find((item) => item.code === zone);

      if (selected) {
        results = regions.filter((item) => item.code === selected.region);
      }
    }

    if (community) {
      const selected = communities.find((item) => item.code === community);

      if (selected) {
        results = regions.filter((item) => item.code === selected.region);
      }
    }

    return results.map(({ code, name }) => {
      return {
        label: name,
        value: code,
        description: name,
      };
    });
  };

export const selectCascadedZone =
  (region?: string, zone?: string, community?: string) =>
  (state: RootState): Array<Option> => {
    const {
      codeTables: { zones, communities },
    } = state;

    let results = zones;

    if (zone) {
      return zones
        .filter((item) => item.code === zone)
        .map(({ code, name }) => {
          return {
            label: name,
            value: code,
            description: name,
          };
        });
    }

    if (region) {
      results = zones.filter((item) => item.region === region);
    }

    if (community) {
      const selected = communities.find((item) => item.code === community);
      if (selected) {
        results = zones.filter((item) => item.code === selected.zone);
      }
    }

    return results.map(({ code, name }) => {
      return {
        label: name,
        value: code,
        description: name,
      };
    });
  };

  export const selectCascadedCommunity =
  (region?: string, zone?: string, community?: string) =>
  (state: RootState): Array<Option> => {
    const {
      codeTables: { communities },
    } = state;

    let results = communities;

    if (community) {
      const selected = communities.find((item) => item.code === community);
      if (selected) {
        results = communities.filter((item) => item.zone === selected.zone);
      }
    }

    if(zone){ 
      return communities
      .filter((item) => item.zone === zone)
      .map(({ code, name }) => {
        return {
          label: name,
          value: code,
          description: name,
        };
      });
    }

    if(region){ 
      return communities
      .filter((item) => item.region === region)
      .map(({ code, name }) => {
        return {
          label: name,
          value: code,
          description: name,
        };
      });
    }

    return results.map(({ code, name }) => {
      return {
        label: name,
        value: code,
        description: name,
      };
    });
  };

export default codeTableSlice.reducer;
