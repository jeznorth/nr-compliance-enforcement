import { Mapper, createMap, forMember, mapFrom } from "@automapper/core";

//-- entities
import { CosGeoOrgUnit } from "src/v1/cos_geo_org_unit/entities/cos_geo_org_unit.entity";
import { PersonComplaintXref } from "src/v1/person_complaint_xref/entities/person_complaint_xref.entity";
import { Complaint } from "src/v1/complaint/entities/complaint.entity";
import { SpeciesCode } from "src/v1/species_code/entities/species_code.entity";
import { HwcrComplaintNatureCode } from "src/v1/hwcr_complaint_nature_code/entities/hwcr_complaint_nature_code.entity";
import { AttractantCode } from "src/v1/attractant_code/entities/attractant_code.entity";
import { HwcrComplaint } from "src/v1/hwcr_complaint/entities/hwcr_complaint.entity";
import { AgencyCode } from "src/v1/agency_code/entities/agency_code.entity";
import { AttractantHwcrXref } from "src/v1/attractant_hwcr_xref/entities/attractant_hwcr_xref.entity";
import { ViolationCode } from "src/v1/violation_code/entities/violation_code.entity";
import { AllegationComplaint } from "src/v1/allegation_complaint/entities/allegation_complaint.entity";

//-- models (dto for now)
import {
  Agency,
  Attractant,
  NatureOfComplaint,
  OrganizationCodeTable,
  Species,
  Violation,
} from "src/types/models/code-tables";
import { DelegateDto } from "src/types/models/people/delegate";
import { ComplaintDto } from "src/types/models/complaints/complaint";
import { WildlifeComplaintDto } from "src/types/models/complaints/wildlife-complaint";
import { AttractantXrefDto } from "src/types/models/complaints/attractant-ref";
import { AllegationComplaintDto } from "src/types/models/complaints/allegation-complaint";

//-- define entity -> model mapping
const cosGeoOrgUnitToOrganizationDtoMap = (mapper: Mapper) => {
  createMap<CosGeoOrgUnit, OrganizationCodeTable>(
    mapper,
    "CosGeoOrgUnit", //-- source
    "OrganizationCodeTable", //-- destination
    forMember(
      (destination) => destination.area,
      mapFrom((source) => source.area_code)
    ),
    forMember(
      (destination) => destination.officeLocation,
      mapFrom((source) => source.office_location_code)
    ),
    forMember(
      (destination) => destination.region,
      mapFrom((source) => source.region_code)
    ),
    forMember(
      (destination) => destination.zone,
      mapFrom((source) => source.zone_code)
    )
  );
};

const personComplaintToDelegateDtoMap = (mapper: Mapper) => {
  createMap<PersonComplaintXref, DelegateDto>(
    mapper,
    "PersonComplaintXref",
    "Delegate",
    forMember(
      (destination) => destination.xrefId,
      mapFrom((source) => source.personComplaintXrefGuid)
    ),
    forMember(
      (destination) => destination.isActive,
      mapFrom((source) => source.active_ind)
    ),
    forMember(
      (destination) => destination.type,
      mapFrom(
        (source) => source.person_complaint_xref_code.person_complaint_xref_code
      )
    ),
    forMember(
      (destination) => destination.person,
      mapFrom((source) => {
        return {
          id: source.person_guid.person_guid,
          firstName: source.person_guid.first_name,
          middleName1: source.person_guid.middle_name_1,
          middleName2: source.person_guid.middle_name_2,
          lastName: source.person_guid.last_name,
        };
      })
    )
  );
};

const complaintToComplaintDtoMap = (mapper: Mapper) => {
  createMap<Complaint, ComplaintDto>(
    mapper,
    "Complaint", //-- source
    "ComplaintDto", //-- destination
    forMember(
      (destination) => destination.id,
      mapFrom((source) => source.complaint_identifier)
    ),
    forMember(
      (destination) => destination.details,
      mapFrom((source) => source.detail_text)
    ),
    forMember(
      (destination) => destination.name,
      mapFrom((source) => source.caller_name)
    ),
    forMember(
      (destination) => destination.address,
      mapFrom((source) => source.caller_address)
    ),
    forMember(
      (destination) => destination.email,
      mapFrom((source) => source.caller_email)
    ),
    forMember(
      (destination) => destination.phone1,
      mapFrom((source) => source.caller_phone_1)
    ),
    forMember(
      (destination) => destination.phone2,
      mapFrom((source) => source.caller_phone_2)
    ),
    forMember(
      (destination) => destination.phone3,
      mapFrom((source) => source.caller_phone_3)
    ),
    forMember(
      (destination) => destination.location,
      mapFrom((source) => {
        const {
          location_geometry_point: { type: locationType, coordinates },
        } = source;
        return { type: locationType, coordinates };
      })
    ),
    forMember(
      (destination) => destination.locationSummary,
      mapFrom((source) => source.location_summary_text)
    ),
    forMember(
      (destination) => destination.locationDetail,
      mapFrom((source) => source.location_detailed_text)
    ),
    forMember(
      (destination) => destination.status,
      mapFrom((source) => {
        const {
          complaint_status_code: { complaint_status_code },
        } = source;
        return complaint_status_code;
      })
    ),
    forMember(
      (destination) => destination.referredBy,
      mapFrom((source) => {
        if (source.referred_by_agency_code !== null) {
          const {
            referred_by_agency_code: { agency_code },
          } = source;
          return agency_code;
        } else {
          return "";
        }
      })
    ),
    forMember(
      (destination) => destination.ownedBy,
      mapFrom((source) => {
        if (source.owned_by_agency_code !== null) {
          const {
            owned_by_agency_code: { agency_code },
          } = source;
          return agency_code;
        } else {
          return "";
        }
      })
    ),
    forMember(
      (destination) => destination.referredByAgencyOther,
      mapFrom((source) => source.referred_by_agency_other_text)
    ),
    forMember(
      (destination) => destination.incidentDateTime,
      mapFrom((source) => source.incident_utc_datetime)
    ),
    forMember(
      (destination) => destination.reportedOn,
      mapFrom((source) => source.incident_reported_utc_timestmp)
    ),
    forMember(
      (destination) => destination.organization,
      mapFrom((source) => {
        if (source.cos_geo_org_unit !== null) {
          const {
            cos_geo_org_unit: {
              area_code: area,
              region_code: region,
              zone_code: zone,
              office_location_code: officeLocation,
            },
          } = source;

          return { region, zone, area, officeLocation };
        }
      })
    ),
    forMember(
      (destination) => destination.delegates,
      mapFrom((source) => {
        const { person_complaint_xref: people } = source;
        const delegates = mapper.mapArray<PersonComplaintXref, DelegateDto>(
          people,
          "PersonComplaintXref",
          "Delegate"
        );

        return delegates;
      })
    )
  );
};

const speciesCodeToSpeciesDtoMap = (mapper: Mapper) => {
  createMap<SpeciesCode, Species>(
    mapper,
    "SpeciesCode",
    "SpeciesDto",
    forMember(
      (destination) => destination.species,
      mapFrom((source) => source.species_code)
    ),
    forMember(
      (destination) => destination.legacy,
      mapFrom((source) => source.legacy_code)
    ),
    forMember(
      (destination) => destination.shortDescription,
      mapFrom((source) => source.short_description)
    ),
    forMember(
      (destination) => destination.longDescription,
      mapFrom((source) => source.long_description)
    ),
    forMember(
      (destination) => destination.isActive,
      mapFrom((source) => source.active_ind)
    ),
    forMember(
      (destination) => destination.displayOrder,
      mapFrom((source) => source.display_order)
    )
  );
};

const natureOfComplaintCodeToNatureOfComplaintDtoMap = (mapper: Mapper) => {
  createMap<HwcrComplaintNatureCode, NatureOfComplaint>(
    mapper,
    "NatureOfComplaintCode",
    "NatureOfComplaintDto",
    forMember(
      (destination) => destination.natureOfComplaint,
      mapFrom((source) => source.hwcr_complaint_nature_code)
    ),
    forMember(
      (destination) => destination.shortDescription,
      mapFrom((source) => source.short_description)
    ),
    forMember(
      (destination) => destination.longDescription,
      mapFrom((source) => source.long_description)
    ),
    forMember(
      (destination) => destination.displayOrder,
      mapFrom((source) => source.display_order)
    ),
    forMember(
      (destination) => destination.isActive,
      mapFrom((source) => source.active_ind)
    )
  );
};

const attractantCodeToAttractantDtoMap = (mapper: Mapper) => {
  createMap<AttractantCode, Attractant>(
    mapper,
    "AttractantCode",
    "AttractantDto",
    forMember(
      (destination) => destination.attractant,
      mapFrom((source) => source.attractant_code)
    ),
    forMember(
      (destination) => destination.shortDescription,
      mapFrom((source) => source.short_description)
    ),
    forMember(
      (destination) => destination.longDescription,
      mapFrom((source) => source.long_description)
    ),
    forMember(
      (destination) => destination.displayOrder,
      mapFrom((source) => source.display_order)
    ),
    forMember(
      (destination) => destination.isActive,
      mapFrom((source) => source.active_ind)
    )
  );
};

const agencyCodeToAgencyDto = (mapper: Mapper) => {
  createMap<AgencyCode, Agency>(
    mapper,
    "AgencyCode",
    "AgencyCodeDto",
    forMember(
      (destination) => destination.agency,
      mapFrom((source) => source.agency_code)
    ),
    forMember(
      (destination) => destination.shortDescription,
      mapFrom((source) => source.short_description)
    ),
    forMember(
      (destination) => destination.longDescription,
      mapFrom((source) => source.long_description)
    ),
    forMember(
      (destination) => destination.displayOrder,
      mapFrom((source) => source.display_order)
    ),
    forMember(
      (destination) => destination.isActive,
      mapFrom((source) => source.active_ind)
    )
  );
};

const attractantXrefToAttractantXrefDto = (mapper: Mapper) => {
  createMap<AttractantHwcrXref, AttractantXrefDto>(
    mapper,
    "AttractantXref",
    "AttractantXrefDto",
    forMember(
      (destination) => destination.xrefId,
      mapFrom((source) => source.attractant_hwcr_xref_guid)
    ),
    forMember(
      (destination) => destination.attractant,
      mapFrom((src) => {
        const item = mapper.map<AttractantCode, Attractant>(
          src.attractant_code,
          "AttractantCode",
          "AttractantDto"
        );
        return item.attractant;
      })
    ),
    forMember(
      (destination) => destination.isActive,
      mapFrom((source) => source.active_ind)
    )
  );
};

const violationCodeToViolationDto = (mapper: Mapper) => {
  createMap<ViolationCode, Violation>(
    mapper,
    "ViolationCode",
    "ViolationCodeDto",
    forMember(
      (destination) => destination.violation,
      mapFrom((source) => source.violation_code)
    ),
    forMember(
      (destination) => destination.shortDescription,
      mapFrom((source) => source.short_description)
    ),
    forMember(
      (destination) => destination.longDescription,
      mapFrom((source) => source.long_description)
    ),
    forMember(
      (destination) => destination.displayOrder,
      mapFrom((source) => source.display_order)
    ),
    forMember(
      (destination) => destination.isActive,
      mapFrom((source) => source.active_ind)
    )
  );
};

export const applyWildlifeComplaintMap = (mapper: Mapper) => {
  speciesCodeToSpeciesDtoMap(mapper)
  natureOfComplaintCodeToNatureOfComplaintDtoMap(mapper);
  attractantCodeToAttractantDtoMap(mapper);
  attractantXrefToAttractantXrefDto(mapper);
  agencyCodeToAgencyDto(mapper);
  cosGeoOrgUnitToOrganizationDtoMap(mapper);
  personComplaintToDelegateDtoMap(mapper)

  createMap<HwcrComplaint, WildlifeComplaintDto>(
    mapper,
    "WildlifeComplaint",
    "WildlifeComplaintDto",
    forMember(
      (destination) => destination.id,
      mapFrom((source) => source.complaint_identifier.complaint_identifier)
    ),
    forMember(
      (destination) => destination.details,
      mapFrom((source) => {
        const { complaint_identifier: complaint } = source;
        return complaint.detail_text !== null ? complaint.detail_text : "";
      })
    ),
    forMember(
      (destination) => destination.name,
      mapFrom((source) => {
        const { complaint_identifier: complaint } = source;
        return complaint.caller_name !== null ? complaint.caller_name : "";
      })
    ),
    forMember(
      (destination) => destination.address,
      mapFrom((source) => {
        const { complaint_identifier: complaint } = source;
        return complaint.caller_address !== null
          ? complaint.caller_address
          : "";
      })
    ),
    forMember(
      (destination) => destination.email,
      mapFrom((source) => {
        const { complaint_identifier: complaint } = source;
        return complaint.caller_email !== null ? complaint.caller_email : "";
      })
    ),
    forMember(
      (destination) => destination.phone1,
      mapFrom((source) => {
        const { complaint_identifier: complaint } = source;
        return complaint.caller_phone_1 !== null
          ? complaint.caller_phone_1
          : "";
      })
    ),
    forMember(
      (destination) => destination.phone2,
      mapFrom((source) => {
        const { complaint_identifier: complaint } = source;
        return complaint.caller_phone_2 !== null
          ? complaint.caller_phone_2
          : "";
      })
    ),
    forMember(
      (destination) => destination.phone3,
      mapFrom((source) => {
        const { complaint_identifier: complaint } = source;
        return complaint.caller_phone_3 !== null
          ? complaint.caller_phone_3
          : "";
      })
    ),
    forMember(
      (destination) => destination.location,
      mapFrom((source) => {
        const {
          complaint_identifier: {
            location_geometry_point: { type: locationType, coordinates },
          },
        } = source;
        return { type: locationType, coordinates };
      })
    ),
    forMember(
      (destination) => destination.locationSummary,
      mapFrom((source) => source.complaint_identifier.location_summary_text)
    ),
    forMember(
      (destination) => destination.locationDetail,
      mapFrom((source) => source.complaint_identifier.location_detailed_text)
    ),
    forMember(
      (destination) => destination.status,
      mapFrom((source) => {
        const {
          complaint_identifier: {
            complaint_status_code: { complaint_status_code },
          },
        } = source;
        return complaint_status_code;
      })
    ),
    forMember(
      (destination) => destination.referredBy,
      mapFrom((source) => {
        const {
          complaint_identifier: { referred_by_agency_code: agency },
        } = source;
        if (agency !== null) {
          const code = mapper.map<AgencyCode, Agency>(
            agency,
            "AgencyCode",
            "AgencyCodeDto"
          );
          return code.agency;
        }

        return "";
      })
    ),
    forMember(
      (destination) => destination.ownedBy,
      mapFrom((source) => {
        const {
          complaint_identifier: { owned_by_agency_code: agency },
        } = source;
        if (agency !== null) {
          const code = mapper.map<AgencyCode, Agency>(
            agency,
            "AgencyCode",
            "AgencyCodeDto"
          );
          return code.agency;
        }

        return "";
      })
    ),
    forMember(
      (destination) => destination.referredByAgencyOther,
      mapFrom(
        (source) => source.complaint_identifier.referred_by_agency_other_text
      )
    ),
    forMember(
      (destination) => destination.incidentDateTime,
      mapFrom((source) => source.complaint_identifier.incident_utc_datetime)
    ),
    forMember(
      (destination) => destination.reportedOn,
      mapFrom(
        (source) => source.complaint_identifier.incident_reported_utc_timestmp
      )
    ),
    forMember(
      (destination) => destination.organization,
      mapFrom((source) => {
        const {
          complaint_identifier: { cos_geo_org_unit: sourceOrganization },
        } = source;
        return mapper.map<CosGeoOrgUnit, OrganizationCodeTable>(
          sourceOrganization,
          "CosGeoOrgUnit",
          "OrganizationCodeTable"
        );
      })
    ),
    forMember(
      (destination) => destination.delegates,
      mapFrom((source) => {
        const {
          complaint_identifier: { person_complaint_xref: people },
        } = source;

        const delegates = mapper.mapArray<PersonComplaintXref, DelegateDto>(
          people,
          "PersonComplaintXref",
          "Delegate"
        );

        return delegates;
      })
    ),
    forMember(
      (destination) => destination.hwcrId,
      mapFrom((src) => src.hwcr_complaint_guid)
    ),
    forMember(
      (destination) => destination.attractants,
      mapFrom((src) => {
        if (src.attractant_hwcr_xref !== null) {
          return mapper.mapArray<AttractantHwcrXref, AttractantXrefDto>(
            src.attractant_hwcr_xref,
            "AttractantXref",
            "AttractantXrefDto"
          );
        }

        return [];
      })
    ),
    forMember(
      (destination) => destination.otherAttractants,
      mapFrom((src) => {
        if (src.other_attractants_text !== null) {
          return src.other_attractants_text;
        }

        return "";
      })
    ),
    forMember(
      (destination) => destination.species,
      mapFrom((src) => {
        const item = mapper.map<SpeciesCode, Species>(
          src.species_code,
          "SpeciesCode",
          "SpeciesDto"
        );
        if (item !== null) {
          return item.species;
        }

        return "";
      })
    ),
    forMember(
      (destination) => destination.natureOfComplaint,
      mapFrom((src) => {
        const item = mapper.map<HwcrComplaintNatureCode, NatureOfComplaint>(
          src.hwcr_complaint_nature_code,
          "NatureOfComplaintCode",
          "NatureOfComplaintDto"
        );
        if (item !== null) {
          return item.natureOfComplaint;
        }

        return "";
      })
    )
  );
};

export const applyAllegationComplaintMap = (mapper: Mapper) => {
  violationCodeToViolationDto(mapper);
  agencyCodeToAgencyDto(mapper);
  cosGeoOrgUnitToOrganizationDtoMap(mapper);
  personComplaintToDelegateDtoMap(mapper)

  createMap<AllegationComplaint, AllegationComplaintDto>(
    mapper,
    "AllegationComplaint",
    "AllegationComplaintDto",
    forMember(
      (destination) => destination.id,
      mapFrom((source) => source.complaint_identifier.complaint_identifier)
    ),
    forMember(
      (destination) => destination.details,
      mapFrom((source) => {
        const { complaint_identifier: complaint } = source;
        return complaint.detail_text !== null ? complaint.detail_text : "";
      })
    ),
    forMember(
      (destination) => destination.name,
      mapFrom((source) => {
        const { complaint_identifier: complaint } = source;
        return complaint.caller_name !== null ? complaint.caller_name : "";
      })
    ),
    forMember(
      (destination) => destination.address,
      mapFrom((source) => {
        const { complaint_identifier: complaint } = source;
        return complaint.caller_address !== null
          ? complaint.caller_address
          : "";
      })
    ),
    forMember(
      (destination) => destination.email,
      mapFrom((source) => {
        const { complaint_identifier: complaint } = source;
        return complaint.caller_email !== null ? complaint.caller_email : "";
      })
    ),
    forMember(
      (destination) => destination.phone1,
      mapFrom((source) => {
        const { complaint_identifier: complaint } = source;
        return complaint.caller_phone_1 !== null
          ? complaint.caller_phone_1
          : "";
      })
    ),
    forMember(
      (destination) => destination.phone2,
      mapFrom((source) => {
        const { complaint_identifier: complaint } = source;
        return complaint.caller_phone_2 !== null
          ? complaint.caller_phone_2
          : "";
      })
    ),
    forMember(
      (destination) => destination.phone3,
      mapFrom((source) => {
        const { complaint_identifier: complaint } = source;
        return complaint.caller_phone_3 !== null
          ? complaint.caller_phone_3
          : "";
      })
    ),
    forMember(
      (destination) => destination.location,
      mapFrom((source) => {
        const {
          complaint_identifier: {
            location_geometry_point: { type: locationType, coordinates },
          },
        } = source;
        return { type: locationType, coordinates };
      })
    ),
    forMember(
      (destination) => destination.locationSummary,
      mapFrom((source) => source.complaint_identifier.location_summary_text)
    ),
    forMember(
      (destination) => destination.locationDetail,
      mapFrom((source) => source.complaint_identifier.location_detailed_text)
    ),
    forMember(
      (destination) => destination.status,
      mapFrom((source) => {
        const {
          complaint_identifier: {
            complaint_status_code: { complaint_status_code },
          },
        } = source;
        return complaint_status_code;
      })
    ),
    forMember(
      (destination) => destination.referredBy,
      mapFrom((source) => {
        const {
          complaint_identifier: { referred_by_agency_code: agency },
        } = source;
        if (agency !== null) {
          const code = mapper.map<AgencyCode, Agency>(
            agency,
            "AgencyCode",
            "AgencyCodeDto"
          );
          return code.agency;
        }

        return "";
      })
    ),
    forMember(
      (destination) => destination.ownedBy,
      mapFrom((source) => {
        const {
          complaint_identifier: { owned_by_agency_code: agency },
        } = source;
        if (agency !== null) {
          const code = mapper.map<AgencyCode, Agency>(
            agency,
            "AgencyCode",
            "AgencyCodeDto"
          );
          return code.agency;
        }

        return "";
      })
    ),
    forMember(
      (destination) => destination.referredByAgencyOther,
      mapFrom(
        (source) => source.complaint_identifier.referred_by_agency_other_text
      )
    ),
    forMember(
      (destination) => destination.incidentDateTime,
      mapFrom((source) => source.complaint_identifier.incident_utc_datetime)
    ),
    forMember(
      (destination) => destination.reportedOn,
      mapFrom(
        (source) => source.complaint_identifier.incident_reported_utc_timestmp
      )
    ),
    forMember(
      (destination) => destination.organization,
      mapFrom((source) => {
        const {
          complaint_identifier: { cos_geo_org_unit: sourceOrganization },
        } = source;
        return mapper.map<CosGeoOrgUnit, OrganizationCodeTable>(
          sourceOrganization,
          "CosGeoOrgUnit",
          "OrganizationCodeTable"
        );
      })
    ),
    forMember(
      (destination) => destination.delegates,
      mapFrom((source) => {
        const {
          complaint_identifier: { person_complaint_xref: people },
        } = source;

        const delegates = mapper.mapArray<PersonComplaintXref, DelegateDto>(
          people,
          "PersonComplaintXref",
          "Delegate"
        );

        return delegates;
      })
    ),
    forMember(
      (destination) => destination.ersId,
      mapFrom((src) => src.allegation_complaint_guid)
    ),
    forMember(
      (destination) => destination.violation,
      mapFrom((src) => {
        const item = mapper.map<ViolationCode, Violation>(
          src.violation_code,
          "ViolationCode",
          "ViolationCodeDto"
        );
        if (item !== null) {
          return item.violation;
        }

        return "";
      })
    ),
    forMember(
      (destination) => destination.isInProgress,
      mapFrom((src) => src.in_progress_ind)
    ),
    forMember(
      (destination) => destination.wasObserved,
      mapFrom((src) => src.observed_ind)
    ),
    forMember(
      (destination) => destination.violationDetails,
      mapFrom((src) => src.suspect_witnesss_dtl_text)
    )
  );
};