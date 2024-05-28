import { UUID } from "crypto";

export interface BaseCaseFileCreateInput {
  leadIdentifier: string;
  agencyCode: string;
  caseCode: string;
  actor?: string;
  createUserId: string;
}

export interface BaseCaseFileUpdateInput {
  caseIdentifier: UUID;
  actor?: string;
  updateUserId: string;
  actionId?: string;
}
