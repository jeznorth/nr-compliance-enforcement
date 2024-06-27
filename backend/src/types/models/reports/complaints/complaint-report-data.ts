import { ComplaintUpdateDto } from "../../complaint-updates/complaint-update-dto";

export interface ComplaintReportData {
  reportDate: string;
  reportTime: string;

  id: string;
  reportedOn: Date | string;
  generatedOn: string;
  updatedOn: Date | string;
  createdBy: string;
  officerAssigned: string;
  status: string;
  incidentDateTime: Date | string;
  location: string;
  latitude: string;
  longitude: string;
  community: string;
  office: string;
  zone: string;
  region: string;
  locationDescription: string;
  description: string;

  //-- caller information
  name: string;
  phone1: string;
  phone2: string;
  phone3: string;
  email: string;
  address: string;
  reportedBy: string;

  updates: Array<ComplaintUpdateDto>;
}
