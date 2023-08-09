import { Controller, Param, UseGuards, Post, Body } from "@nestjs/common";
import { PersonComplaintXrefService } from "./person_complaint_xref.service";
import { ApiTags } from "@nestjs/swagger";
import { JwtRoleGuard } from "../../auth/jwtrole.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { Role } from "../../enum/role.enum";
import { CreatePersonComplaintXrefDto } from "./dto/create-person_complaint_xref.dto";

@UseGuards(JwtRoleGuard)
@ApiTags("person-complaint-xref")
@Controller({
  path: "person-complaint-xref",
  version: "1",
})
export class PersonComplaintXrefController {
  constructor(
    private readonly personComplaintXrefService: PersonComplaintXrefService
  ) {}

  @Post(":complaint_id")
  @Roles(Role.COS_OFFICER)
  assignOfficer(
    @Param("complaint_id") complaintId: string,
    @Body() createPersonComplaintXrefDto: CreatePersonComplaintXrefDto
  ) {
    return this.personComplaintXrefService.assignOfficer(
      complaintId,
      createPersonComplaintXrefDto
    );
  }
}
