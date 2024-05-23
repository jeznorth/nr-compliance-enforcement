import { Test, TestingModule } from "@nestjs/testing";
import { ComplaintUpdatesController } from "./complaint_updates.controller";
import { ComplaintUpdatesService } from "./complaint_updates.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ComplaintUpdate } from "./entities/complaint_updates.entity";

describe("ConfigurationController", () => {
  let controller: ComplaintUpdatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintUpdatesController],
      providers: [
        ComplaintUpdatesService,
        {
          provide: getRepositoryToken(ComplaintUpdate),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ComplaintUpdatesController>(ComplaintUpdatesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
