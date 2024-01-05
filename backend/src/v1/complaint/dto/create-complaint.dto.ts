import { PickType } from "@nestjs/swagger";
import { ComplaintDto } from "./complaint.dto";

export class CreateComplaintDto extends PickType(ComplaintDto, [
  "detail_text",
  "caller_name",
  "caller_address",
  "caller_email",
  "caller_phone_1",
  "caller_phone_2",
  "caller_phone_3",
  "location_geometry_point",
  "location_summary_text",
  "location_detailed_text",
  "incident_reported_utc_timestmp",
  "incident_utc_datetime",
  "reported_by_other_text",
  "create_user_id",
  "create_utc_timestamp",
  "update_user_id",
  "update_utc_timestamp",
  "complaint_identifier",
  "reported_by_code",
  "owned_by_agency_code",
  "complaint_status_code",
  "geo_organization_unit_code",
  "cos_geo_org_unit",
] as const) {}
