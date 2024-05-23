export interface WebEOCComplaintUpdate {
  tablename: string;
  dataid: string;
  username: string;
  positionname: string;
  entrydate: string;
  subscribername: string;
  prevdataid: string;
  parent_table_reference: string;
  parent_incident_number: string;
  parent_report_type: string;
  parent_dataID: string;
  update_number: string;
  update_created_by_datetime: string;
  remove: string;
  update_address: string;
  update_address_coordinates_lat: string;
  update_address_coordinates_long: string;
  update_area_community: string;
  update_district: string;
  update_zone: string;
  update_region: string;
  update_location_description: string;
  update_caller_name: string;
  update_primary_phone_lst: string;
  update_primary_phone: string;
  update_alt_phone_lst: string;
  update_alt_phone: string;
  update_alt_phone_2_lst: string;
  update_alt_phone_2: string;
  update_caller_email: string;
  update_caller_address: string;
  update_reffered_by_txt: string;
  update_reffered_by_lst: string;
  update_call_details: string;
  update_species: string;
  update_violation_type: string;
  parent_nature_of_complaint: string;
  parent_species: string;
  update_created_by_username: string;
  update_created_by_position: string;
  back_number_of_days: string;
  back_number_of_hours: string;
  back_number_of_minutes: string;
}
