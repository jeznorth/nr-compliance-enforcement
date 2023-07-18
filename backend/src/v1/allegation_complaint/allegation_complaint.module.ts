import { Module } from '@nestjs/common';
import { AllegationComplaintService } from './allegation_complaint.service';
import { AllegationComplaintController } from './allegation_complaint.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { AllegationComplaint } from './entities/allegation_complaint.entity';
import { ComplaintService } from '../complaint/complaint.service';
import { Complaint } from '../complaint/entities/complaint.entity';
import { ViolationCodeService } from '../violation_code/violation_code.service';
import { AgencyCodeService } from '../agency_code/agency_code.service';
import { ComplaintStatusCode } from '../complaint_status_code/entities/complaint_status_code.entity';
import { ComplaintStatusCodeService } from '../complaint_status_code/complaint_status_code.service';
import { GeoOrganizationUnitCodeService } from '../geo_organization_unit_code/geo_organization_unit_code.service';
import { ViolationCode } from '../violation_code/entities/violation_code.entity';
import { AgencyCode } from '../agency_code/entities/agency_code.entity';
import { GeoOrganizationUnitCode } from '../geo_organization_unit_code/entities/geo_organization_unit_code.entity';
import { CosGeoOrgUnitService } from '../cos_geo_org_unit/cos_geo_org_unit.service';
import { CosGeoOrgUnit } from '../cos_geo_org_unit/entities/cos_geo_org_unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AllegationComplaint]), TypeOrmModule.forFeature([Complaint]), TypeOrmModule.forFeature([ViolationCode]), TypeOrmModule.forFeature([AgencyCode]), TypeOrmModule.forFeature([ComplaintStatusCode]), TypeOrmModule.forFeature([GeoOrganizationUnitCode]), TypeOrmModule.forFeature([CosGeoOrgUnit]) ],
  controllers: [AllegationComplaintController],
  providers: [AllegationComplaintService, ComplaintService, ViolationCodeService, AgencyCodeService, ComplaintStatusCodeService, GeoOrganizationUnitCodeService, CosGeoOrgUnitService]
})
export class AllegationComplaintModule {}