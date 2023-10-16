export interface SpeciesCode {
  species_code: string;
  legacy_code: string | null;
  short_description: string;
  long_description: string;
  display_order: number;
  active_ind: boolean;
  create_user_id: string;
  create_timestamp: string;
  update_user_id: string;
  update_timestamp: string;
}
