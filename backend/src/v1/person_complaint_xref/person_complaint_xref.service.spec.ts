import { Test, TestingModule } from "@nestjs/testing";
import { PersonComplaintXrefService } from "./person_complaint_xref.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { dataSourceMockFactory } from "../../../test/mocks/datasource";
import { PersonComplaintXref } from "./entities/person_complaint_xref.entity";

describe("PersonComplaintXrefService", () => {
  let service: PersonComplaintXrefService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonComplaintXrefService,
        {
          provide: getRepositoryToken(PersonComplaintXref),
          useValue: {},
        },
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
      ],
    }).compile();

    service = module.get<PersonComplaintXrefService>(PersonComplaintXrefService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
