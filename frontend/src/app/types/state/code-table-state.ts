import { Agency } from "../app/code-tables/agency";
import { Attractant } from "../app/code-tables/attactant";
import { ComplaintStatus } from "../app/code-tables/complaint-status";
import { NatureOfComplaint } from "../app/code-tables/nature-of-complaint";
import { OrganizationUnitType } from "../app/code-tables/organization-unit-type";
import { OrganizationUnit } from "../app/code-tables/organization-unit";
import { PersonComplaintType } from "../app/code-tables/person-complaint-type";
import { Species } from "../app/code-tables/species";
import { Violation } from "../app/code-tables/violation";
import { OrganizationCodeTable } from "../app/code-tables/organization-code-table";
import { ComplaintType } from "../app/code-tables/complaint-type";
import { Region } from "../app/code-tables/region";
import { Zone } from "../app/code-tables/zone";
import { Community } from "../app/code-tables/community";
import { ReportedBy } from "../app/code-tables/reported-by";
import { Justification } from "../app/code-tables/justification";
import { AssessmentType } from "../app/code-tables/assesment-type";

export interface CodeTableState {
  [key: string]:
    | Array<Agency>
    | Array<Attractant>
    | Array<ComplaintStatus>
    | Array<NatureOfComplaint>
    | Array<OrganizationUnitType>
    | Array<OrganizationUnit>
    | Array<PersonComplaintType>
    | Array<Species>
    | Array<Violation>
    | Array<OrganizationCodeTable>
    | Array<ComplaintType>
    | Array<Region>
    | Array<Zone>
    | Array<Community>
    | Array<ReportedBy>
    | Array<Justification>
    | Array<AssessmentType>;

  agency: Array<Agency>;
  attractant: Array<Attractant>;
  "complaint-status": Array<ComplaintStatus>;
  "complaint-type": Array<ComplaintType>;
  "nature-of-complaint": Array<NatureOfComplaint>;
  species: Array<Species>;
  violation: Array<Violation>;
  "area-codes": Array<OrganizationCodeTable>;
  regions: Array<Region>;
  zones: Array<Zone>;
  communities: Array<Community>;
  "reported-by": Array<ReportedBy>;
  justification: Array<Justification>;
  "assessment-type": Array<AssessmentType>;
}
