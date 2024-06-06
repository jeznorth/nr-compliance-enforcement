import { Controller, Post, Body, Param, UseGuards } from "@nestjs/common";
import { StagingComplaintService } from "./staging_complaint.service";
import { ApiTags } from "@nestjs/swagger";
import { WebEOCComplaint } from "../../types/webeoc-complaint";
import { ApiKeyGuard } from "../../auth/apikey.guard";
import { Public } from "../../auth/decorators/public.decorator";
import { WebEOCComplaintUpdate } from "src/types/webeoc-complaint-update";

@ApiTags("staging-complaint")
@Public()
@Controller({
  path: "staging-complaint",
  version: "1",
})
export class StagingComplaintController {
  constructor(private readonly stagingComplaintService: StagingComplaintService) {}

  @Post("/webeoc-complaint")
  @UseGuards(ApiKeyGuard)
  createNewComplaint(@Body() createStagingComplaint: WebEOCComplaint) {
    return this.stagingComplaintService.stageNewComplaint(createStagingComplaint);
  }

  @Post("/webeoc-complaint-update")
  @UseGuards(ApiKeyGuard)
  createComplaintUpdate(@Body() createStagingComplaint: WebEOCComplaintUpdate) {
    return this.stagingComplaintService.stageUpdateComplaint(createStagingComplaint);
  }

  @Post("/process/:complaintIdentifier")
  @UseGuards(ApiKeyGuard)
  async processWebEOCComplaint(@Param("complaintIdentifier") complaintIdentifier: string): Promise<any> {
    return await this.stagingComplaintService.processWebEOCComplaint(complaintIdentifier);
  }

  @Post("/process/:complaintIdentifier/:updateNumber")
  @UseGuards(ApiKeyGuard)
  async processWebEOCComplaintUpdate(
    @Param("complaintIdentifier") complaintIdentifier: string,
    @Param("updateNumber") updateNumber: string,
  ): Promise<any> {
    const updateNumberAsNumber: number = parseInt(updateNumber, 10);
    return await this.stagingComplaintService.processWebEOCComplaintUpdate(complaintIdentifier, updateNumberAsNumber);
  }
}
