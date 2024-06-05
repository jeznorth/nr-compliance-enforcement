import { Test, TestingModule } from "@nestjs/testing";
import { REQUEST } from "@nestjs/core";
import { AutomapperModule, getMapperToken } from "@automapper/nestjs";
import { createMapper } from "@automapper/core";
import { pojos } from "@automapper/pojos";
import { CaseFileService } from "./case_file.service";
import { DataSource } from "typeorm";
import { dataSourceMockFactory } from "../../../test/mocks/datasource";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Complaint } from "../complaint/entities/complaint.entity";
import {
  MockComplaintsAgencyRepository,
  MockComplaintsOfficerRepository,
  MockComplaintsRepositoryV2,
} from "../../../test/mocks/mock-complaints-repositories";
import { HwcrComplaint } from "../hwcr_complaint/entities/hwcr_complaint.entity";
import { MockWildlifeConflictComplaintRepository } from "../../../test/mocks/mock-wildlife-conflict-complaint-repository";
import { ComplaintService } from "../complaint/complaint.service";
import { CodeTableService } from "../code-table/code-table.service";
import { PersonComplaintXrefService } from "../person_complaint_xref/person_complaint_xref.service";
import { AttractantHwcrXrefService } from "../attractant_hwcr_xref/attractant_hwcr_xref.service";
import { AgencyCode } from "../agency_code/entities/agency_code.entity";
import { AttractantCode } from "../attractant_code/entities/attractant_code.entity";
import {
  MockAttractantCodeTableRepository,
  MockComplaintStatusCodeTableRepository,
  MockComplaintTypeCodeTableRepository,
  MockCosOrganizationUnitCodeTableRepository,
  MockNatureOfComplaintCodeTableRepository,
  MockOrganizationUnitCodeTableRepository,
  MockOrganizationUnitTypeCodeTableRepository,
  MockPersonComplaintCodeTableRepository,
  MockReportedByCodeTableRepository,
  MockSpeciesCodeTableRepository,
  MockViolationsCodeTableRepository,
} from "../../../test/mocks/mock-code-table-repositories";
import { ComplaintStatusCode } from "../complaint_status_code/entities/complaint_status_code.entity";
import { HwcrComplaintNatureCode } from "../hwcr_complaint_nature_code/entities/hwcr_complaint_nature_code.entity";
import { GeoOrgUnitTypeCode } from "../geo_org_unit_type_code/entities/geo_org_unit_type_code.entity";
import { GeoOrganizationUnitCode } from "../geo_organization_unit_code/entities/geo_organization_unit_code.entity";
import { PersonComplaintXrefCode } from "../person_complaint_xref_code/entities/person_complaint_xref_code.entity";
import { SpeciesCode } from "../species_code/entities/species_code.entity";
import { ViolationCode } from "../violation_code/entities/violation_code.entity";
import { CosGeoOrgUnit } from "../cos_geo_org_unit/entities/cos_geo_org_unit.entity";
import { ComplaintTypeCode } from "../complaint_type_code/entities/complaint_type_code.entity";
import { ReportedByCode } from "../reported_by_code/entities/reported_by_code.entity";
import { PersonComplaintXref } from "../person_complaint_xref/entities/person_complaint_xref.entity";
import { AttractantHwcrXref } from "../attractant_hwcr_xref/entities/attractant_hwcr_xref.entity";
import { AllegationComplaint } from "../allegation_complaint/entities/allegation_complaint.entity";
import { MockAllegationComplaintRepository } from "../../../test/mocks/mock-allegation-complaint-repository";
import { Office } from "../office/entities/office.entity";
import { Officer } from "../officer/entities/officer.entity";

describe("Testing: Case File Service", () => {
  let service: CaseFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AutomapperModule],
      providers: [
        AutomapperModule,
        {
          provide: getMapperToken(),
          useValue: createMapper({
            strategyInitializer: pojos(),
          }),
        },
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
        {
          provide: getRepositoryToken(Complaint),
          useFactory: MockComplaintsRepositoryV2,
        },
        {
          provide: getRepositoryToken(HwcrComplaint),
          useFactory: MockWildlifeConflictComplaintRepository,
        },
        {
          provide: getRepositoryToken(AgencyCode),
          useFactory: MockComplaintsAgencyRepository,
        },
        {
          provide: getRepositoryToken(Officer),
          useFactory: MockComplaintsOfficerRepository,
        },
        {
          provide: getRepositoryToken(Office),
          useFactory: MockWildlifeConflictComplaintRepository,
        },
        {
          provide: getRepositoryToken(AttractantCode),
          useFactory: MockAttractantCodeTableRepository,
        },

        {
          provide: getRepositoryToken(ComplaintStatusCode),
          useFactory: MockComplaintStatusCodeTableRepository,
        },
        {
          provide: getRepositoryToken(HwcrComplaintNatureCode),
          useFactory: MockNatureOfComplaintCodeTableRepository,
        },
        {
          provide: getRepositoryToken(GeoOrgUnitTypeCode),
          useFactory: MockOrganizationUnitTypeCodeTableRepository,
        },
        {
          provide: getRepositoryToken(GeoOrganizationUnitCode),
          useFactory: MockOrganizationUnitCodeTableRepository,
        },
        {
          provide: getRepositoryToken(PersonComplaintXrefCode),
          useFactory: MockPersonComplaintCodeTableRepository,
        },
        {
          provide: getRepositoryToken(SpeciesCode),
          useFactory: MockSpeciesCodeTableRepository,
        },
        {
          provide: getRepositoryToken(ViolationCode),
          useFactory: MockViolationsCodeTableRepository,
        },
        {
          provide: getRepositoryToken(CosGeoOrgUnit),
          useFactory: MockCosOrganizationUnitCodeTableRepository,
        },
        {
          provide: getRepositoryToken(ComplaintTypeCode),
          useFactory: MockComplaintTypeCodeTableRepository,
        },
        {
          provide: getRepositoryToken(ReportedByCode),
          useFactory: MockReportedByCodeTableRepository,
        },
        {
          provide: getRepositoryToken(PersonComplaintXref),
          useValue: {},
        },
        {
          provide: getRepositoryToken(AttractantHwcrXref),
          useValue: {},
        },
        {
          provide: getRepositoryToken(AllegationComplaint),
          useFactory: MockAllegationComplaintRepository,
        },
        CaseFileService,
        ComplaintService,
        CodeTableService,
        PersonComplaintXrefService,
        AttractantHwcrXrefService,
        {
          provide: REQUEST,
          useValue: {
            user: { idir_username: "TEST" },
          },
        },
      ],
    }).compile();

    service = await module.resolve<CaseFileService>(CaseFileService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();

    const unused = null;
  });
});
