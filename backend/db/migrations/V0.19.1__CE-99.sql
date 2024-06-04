CREATE TABLE
	public.complaint_update (
		complaint_update_guid uuid DEFAULT uuid_generate_v4 () NOT NULL,
		complaint_identifier varchar(20) NOT NULL,
		update_seq_number int4 NOT NULL,
		upd_detail_text text NULL,
		upd_location_summary_text varchar(120) NULL,
		upd_location_detailed_text varchar(4000) NULL,
		upd_location_geometry_point public.geometry NULL,
		create_user_id varchar(32) NOT NULL,
		create_utc_timestamp timestamp NOT NULL,
		update_user_id varchar(32) NOT NULL,
		update_utc_timestamp timestamp NULL,
		CONSTRAINT complaint_update_pk PRIMARY KEY (complaint_update_guid),
		CONSTRAINT complaint_update_fk FOREIGN KEY (complaint_identifier) REFERENCES public.complaint (complaint_identifier)
	); 

COMMENT ON TABLE public.complaint_update IS 'Callers will sometimes call in with a COMPLAINT_UPDATE.   This table is used to track items that are considered to be amendments to the complaint information such as additional details, or location information.';

-- Column comments
COMMENT ON COLUMN public.complaint_update.complaint_update_guid IS 'System generated unique key for a complaint update.  This key should never be exposed to users via any system utilizing the tables.';

COMMENT ON COLUMN public.complaint_update.complaint_identifier IS 'Natural key for a complaint generated by webEOC.  Format is YY-250744772125074477212507447721 where the number portion of the sequence resets to 0 on the new year.';

COMMENT ON COLUMN public.complaint_update.update_seq_number IS 'An integer that is used to reflect the order that complaint updates were entered into the call center system.';

COMMENT ON COLUMN public.complaint_update.upd_detail_text IS 'Verbatim details of the complaint as recorded by the call centre or through the web form.';

COMMENT ON COLUMN public.complaint_update.upd_location_summary_text IS 'A brief summary of the location of the complaint.';

COMMENT ON COLUMN public.complaint_update.upd_location_detailed_text IS 'A more detailed description of the location of the complaint.';

COMMENT ON COLUMN public.complaint_update.upd_location_geometry_point IS 'The closest approximation to where the incident occurred.   Stored as a geometric point using the EPSG:3005 Projected Coordinate System (BC Albers)';

COMMENT ON COLUMN public.complaint_update.create_user_id IS 'The id of the user that created the complaint update record.';

COMMENT ON COLUMN public.complaint_update.create_utc_timestamp IS 'The timestamp when the complaint update record was created.  The timestamp is stored in UTC with no Offset.';

COMMENT ON COLUMN public.complaint_update.update_user_id IS 'The id of the user that updated the complaint update record.';

COMMENT ON COLUMN public.complaint_update.update_utc_timestamp IS 'The timestamp when the complaint_update record was updated.  The timestamp is stored in UTC with no Offset.';

-- history table
CREATE TABLE
	public.complaint_update_h (
		h_complaint_update_guid uuid NOT NULL DEFAULT uuid_generate_v4 (),
		target_row_id uuid NOT NULL,
		operation_type char(1) NOT NULL,
		operation_user_id varchar(32) NOT NULL DEFAULT current_user,
		operation_executed_at timestamp NOT NULL DEFAULT now (),
		data_after_executed_operation jsonb,
		CONSTRAINT "PK_h_complaint_update" PRIMARY KEY (h_complaint_update_guid)
	);

CREATE
or REPLACE TRIGGER complaint_update_history_trigger BEFORE INSERT
OR DELETE
OR
UPDATE ON complaint_update FOR EACH ROW EXECUTE PROCEDURE audit_history ('complaint_update_h', 'complaint_update_guid');

COMMENT on table public.complaint_update_h is 'History table for complaint_update table';

COMMENT on column public.complaint_update_h.h_complaint_update_guid is 'System generated unique key for complaint update history. This key should never be exposed to users via any system utilizing the tables.';

COMMENT on column public.complaint_update_h.target_row_id is 'The unique key for the complaint update that has been created or modified.';

COMMENT on column public.complaint_update_h.operation_type is 'The operation performed: I = Insert, U = Update, D = Delete';

COMMENT on column public.complaint_update_h.operation_user_id is 'The id of the user that created or modified the data in the complaint update table.  Defaults to the logged in user if not passed in by the application.';

COMMENT on column public.complaint_update_h.operation_executed_at is 'The timestamp when the data in the complaint update table was created or modified.  The timestamp is stored in UTC with no Offset.';

COMMENT on column public.complaint_update_h.data_after_executed_operation is 'A JSON representation of the row in the table after the operation was completed successfully.   This implies that the latest row in the audit table will always match with the current row in the live table.';