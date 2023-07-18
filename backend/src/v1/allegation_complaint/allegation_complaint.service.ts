import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { CreateAllegationComplaintDto } from "./dto/create-allegation_complaint.dto";
import { UpdateAllegationComplaintDto } from "./dto/update-allegation_complaint.dto";
import { AllegationComplaint } from "./entities/allegation_complaint.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { UUID } from "crypto";
import { ComplaintService } from "../complaint/complaint.service";
import { CreateComplaintDto } from "../complaint/dto/create-complaint.dto";
import { OfficeStats, ZoneAtAGlanceStats } from 'src/types/zone_at_a_glance/zone_at_a_glance_stats';
import { CosGeoOrgUnit } from "../cos_geo_org_unit/entities/cos_geo_org_unit.entity";

@Injectable()
export class AllegationComplaintService {

  private readonly logger = new Logger(AllegationComplaintService.name);

  constructor(private dataSource: DataSource) {}
  @InjectRepository(AllegationComplaint)
  private allegationComplaintsRepository: Repository<AllegationComplaint>;
  @InjectRepository(CosGeoOrgUnit)
  private cosGeoOrgUnitRepository: Repository<CosGeoOrgUnit>;
  @Inject(ComplaintService)
  protected readonly complaintService: ComplaintService;

  async create(allegationComplaint: any): Promise<AllegationComplaint> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    let newAllegationComplaint;
    try {
      await this.complaintService.create(
        <CreateComplaintDto>allegationComplaint,
        queryRunner
      );
      newAllegationComplaint = await this.allegationComplaintsRepository.create(
        <CreateAllegationComplaintDto>allegationComplaint
      );
      await queryRunner.manager.save(newAllegationComplaint);
      await queryRunner.commitTransaction();
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err);
    } finally {
      await queryRunner.release();
    }
    return newAllegationComplaint;
  }

  async findAll(
    sortColumn: string,
    sortOrder: string
  ): Promise<AllegationComplaint[]> {
    //compiler complains if you don't explicitly set the sort order to 'DESC' or 'ASC' in the function
    const sortOrderString = sortOrder === "DESC" ? "DESC" : "ASC";
    const sortTable = (sortColumn === 'complaint_identifier' || sortColumn === 'violation_code' || sortColumn === 'in_progress_ind') ? 'allegation_complaint.' : 'complaint_identifier.';
    const sortString =  sortColumn !== 'update_timestamp' ? sortTable + sortColumn : 'GREATEST(complaint_identifier.update_timestamp, allegation_complaint.update_timestamp)';
    return this.allegationComplaintsRepository.createQueryBuilder('allegation_complaint')
      .leftJoinAndSelect('allegation_complaint.complaint_identifier', 'complaint_identifier')
      .leftJoinAndSelect('allegation_complaint.violation_code','violation_code')
      .leftJoinAndSelect('complaint_identifier.complaint_status_code', 'complaint_status_code')
      .leftJoinAndSelect('complaint_identifier.referred_by_agency_code', 'referred_by_agency_code')
      .leftJoinAndSelect('complaint_identifier.owned_by_agency_code', 'owned_by_agency_code')
      .leftJoinAndSelect(
        'complaint_identifier.cos_geo_org_unit',
        'area_code'
      )      
      .leftJoinAndSelect('complaint_identifier.person_complaint_xref', 'person_complaint_xref', 'person_complaint_xref.active_ind = true')
      .leftJoinAndSelect('person_complaint_xref.person_guid', 'person', 'person_complaint_xref.active_ind = true')

      .orderBy(sortString, sortOrderString)
      .addOrderBy(
        "complaint_identifier.incident_reported_datetime",
        sortColumn === "incident_reported_datetime" ? sortOrderString : "DESC"
      )
      .getMany();
  }

  async search(sortColumn: string, sortOrder: string, community?: string, zone?: string, region?: string, officerAssigned?: string, violationCode?: string, 
    incidentReportedStart?: string, incidentReportedEnd?: string, status?: string): Promise<AllegationComplaint[]> {

    //compiler complains if you don't explicitly set the sort order to 'DESC' or 'ASC' in the function
    const sortOrderString = sortOrder === "DESC" ? "DESC" : "ASC";
    let sortTable = 'complaint_identifier.';
    if (sortColumn === 'complaint_identifier' || sortColumn === 'violation_code' || sortColumn === 'in_progress_ind')
    {
      sortTable ='allegation_complaint.';
    }
    else if(sortColumn === 'last_name')
    {
      sortTable ='person.';
    }
    const sortString =  sortColumn !== 'update_timestamp' ? sortTable + sortColumn : 'GREATEST(complaint_identifier.update_timestamp, allegation_complaint.update_timestamp)';

    const queryBuilder = this.allegationComplaintsRepository.createQueryBuilder('allegation_complaint')
    .leftJoinAndSelect('allegation_complaint.complaint_identifier', 'complaint_identifier')
    .leftJoinAndSelect('allegation_complaint.violation_code','violation_code')
    .leftJoinAndSelect('complaint_identifier.complaint_status_code', 'complaint_status_code')
    .leftJoinAndSelect('complaint_identifier.referred_by_agency_code', 'referred_by_agency_code')
    .leftJoinAndSelect('complaint_identifier.owned_by_agency_code', 'owned_by_agency_code')
    .leftJoinAndSelect('complaint_identifier.cos_geo_org_unit', 'cos_geo_org_unit')
    .leftJoinAndSelect('complaint_identifier.person_complaint_xref', 'person_complaint_xref', 'person_complaint_xref.active_ind = true')
    .leftJoinAndSelect('person_complaint_xref.person_guid', 'person', 'person_complaint_xref.active_ind = true')
    .orderBy(sortString, sortOrderString)
    .addOrderBy('complaint_identifier.incident_reported_datetime', sortColumn === 'incident_reported_datetime' ? sortOrderString : "DESC");
    if(community !== null && community !== undefined && community !== '')
      {
        queryBuilder.andWhere('cos_geo_org_unit.area_code = :Community', { Community: community });
      }
      if(zone !== null && zone !== undefined && zone !== '')
      {
        queryBuilder.andWhere('cos_geo_org_unit.zone_code = :Zone', { Zone: zone });
      }
      if(region !== null && region !== undefined && region !== '')
      {
        queryBuilder.andWhere('cos_geo_org_unit.region_code = :Region', { Region: region });
      }
      if(officerAssigned !== null && officerAssigned !== undefined && officerAssigned !== '' && officerAssigned !== 'null')
      {
        queryBuilder.andWhere('person_complaint_xref.person_complaint_xref_code = :Assignee', { Assignee: 'ASSIGNEE' });
        queryBuilder.andWhere('person_complaint_xref.person_guid = :PersonGuid', { PersonGuid: officerAssigned });
      }
      else if(officerAssigned === 'null')
      {
        queryBuilder.andWhere('person_complaint_xref.person_guid IS NULL');
      }
    if(violationCode !== null && violationCode !== undefined && violationCode !== "")
    {
      queryBuilder.andWhere('allegation_complaint.violation_code = :ViolationCode', { ViolationCode:violationCode });
    }
    if(incidentReportedStart !== null && incidentReportedStart !== undefined && incidentReportedStart !== "")
    {
      queryBuilder.andWhere('complaint_identifier.incident_reported_datetime >= :IncidentReportedStart', { IncidentReportedStart:incidentReportedStart });
    }
    if(incidentReportedEnd !== null && incidentReportedEnd !== undefined && incidentReportedEnd !== "")
    {
      queryBuilder.andWhere('complaint_identifier.incident_reported_datetime <= :IncidentReportedEnd', { IncidentReportedEnd:incidentReportedEnd });
    }
    if(status !== null && status !== undefined && status !== "")
    {
      queryBuilder.andWhere('complaint_identifier.complaint_status_code = :Status', { Status:status });
    }
    return queryBuilder.getMany();
  }

  async findOne(id: any): Promise<AllegationComplaint> {
    return this.allegationComplaintsRepository.createQueryBuilder('allegation_complaint')
    .leftJoinAndSelect('allegation_complaint.complaint_identifier', 'complaint_identifier')
    .leftJoinAndSelect('allegation_complaint.violation_code','violation_code')
    .leftJoinAndSelect('complaint_identifier.complaint_status_code', 'complaint_status_code')
    .leftJoinAndSelect('complaint_identifier.referred_by_agency_code', 'referred_by_agency_code')
    .leftJoinAndSelect('complaint_identifier.owned_by_agency_code', 'owned_by_agency_code')
    .leftJoinAndSelect(
      "complaint_identifier.cos_geo_org_unit",
      "area_code"
    )      
    .leftJoinAndSelect('complaint_identifier.person_complaint_xref', 'person_complaint_xref', 'person_complaint_xref.active_ind = true')
    .leftJoinAndSelect('person_complaint_xref.person_guid', 'person', 'person_complaint_xref.active_ind = true')
    .where("allegation_complaint_guid = :id", {id})
    .getOne();
  }

  async update(
    allegation_complaint_guid: UUID,
    updateAllegationComplaint: UpdateAllegationComplaintDto
  ): Promise<AllegationComplaint> {
    await this.allegationComplaintsRepository.update(
      { allegation_complaint_guid },
      updateAllegationComplaint
    );
    return this.findOne(allegation_complaint_guid);
  }

  async remove(id: UUID): Promise<{ deleted: boolean; message?: string }> {
    try {
      let complaint_identifier = (
        await this.allegationComplaintsRepository.findOneOrFail({
          where: { allegation_complaint_guid: id },
          relations: {
            complaint_identifier: true,
          },
        })
      ).complaint_identifier.complaint_identifier;
      await this.allegationComplaintsRepository.delete(id);
      await this.complaintService.remove(complaint_identifier);
      return { deleted: true };
    } catch (err) {
      return { deleted: false, message: err.message };
    }
  }

  async findByComplaintIdentifier(id: any): Promise<AllegationComplaint> {
    return this.allegationComplaintsRepository.createQueryBuilder('allegation_complaint')
    .leftJoinAndSelect('allegation_complaint.complaint_identifier', 'complaint_identifier')
    .leftJoinAndSelect('allegation_complaint.violation_code','violation_code')
    .leftJoinAndSelect('complaint_identifier.complaint_status_code', 'complaint_status_code')
    .leftJoinAndSelect('complaint_identifier.referred_by_agency_code', 'referred_by_agency_code')
    .leftJoinAndSelect('complaint_identifier.owned_by_agency_code', 'owned_by_agency_code')
    .leftJoinAndSelect('complaint_identifier.cos_geo_org_unit', 'geo_organization_unit_code')
    .leftJoinAndSelect(
      "complaint_identifier.cos_geo_org_unit",
      "area_code"
    )      
    .leftJoinAndSelect('complaint_identifier.person_complaint_xref', 'person_complaint_xref', 'person_complaint_xref.active_ind = true')
    .leftJoinAndSelect('person_complaint_xref.person_guid', 'person', 'person_complaint_xref.active_ind = true')
    .where("complaint_identifier.complaint_identifier = :id", {id})
    .getOne();

  }

  async getZoneAtAGlanceStatistics(zone: string): Promise<ZoneAtAGlanceStats> {
    let results: ZoneAtAGlanceStats = { total: 0, assigned: 0, unassigned: 0 };

    //-- get total complaints for the zone
    let totalComplaints = await this.allegationComplaintsRepository
      .createQueryBuilder("allegation_complaint")
      .leftJoinAndSelect(
        "allegation_complaint.complaint_identifier",
        "complaint_identifier"
      )
      .leftJoinAndSelect("complaint_identifier.cos_geo_org_unit", "area_code")
      .where("area_code.zone_code = :zone", { zone })
      .andWhere("complaint_identifier.complaint_status_code = :status", {
        status: "OPEN",
      })
      .getCount();

    const totalAssignedComplaints = await this.allegationComplaintsRepository
      .createQueryBuilder("allegation_complaint")
      .leftJoinAndSelect(
        "allegation_complaint.complaint_identifier",
        "complaint_identifier"
      )
      .leftJoinAndSelect("complaint_identifier.cos_geo_org_unit", "area_code")
      .innerJoinAndSelect(
        "complaint_identifier.person_complaint_xref",
        "person_complaint_xref",
        "person_complaint_xref.active_ind = true"
      )
      .where("area_code.zone_code = :zone", { zone })
      .andWhere("complaint_identifier.complaint_status_code = :status", {
        status: "OPEN",
      })
      .getCount();

    const officeQuery = await this.cosGeoOrgUnitRepository.createQueryBuilder('cos_geo_org_unit')
      .where('cos_geo_org_unit.zone_code = :zone', { zone })
      .distinctOn(['cos_geo_org_unit.offloc_code'])
      .orderBy('cos_geo_org_unit.offloc_code');

    const zoneOffices = await officeQuery.getMany();

      let offices: OfficeStats[] = [];
 
      for(let i = 0; i < zoneOffices.length; i++)
      {
        offices[i] = { name: zoneOffices[i].office_location_name,
          assigned: 0,
          unassigned: 0,
          officers: [] };
        const zoneOfficeCode = zoneOffices[i].office_location_code;
  
        const assignedComplaintsQuery = await this.allegationComplaintsRepository.createQueryBuilder('assigned_allegation_complaint')
          .leftJoinAndSelect('assigned_allegation_complaint.complaint_identifier', 'complaint_identifier')
          .leftJoinAndSelect('complaint_identifier.cos_geo_org_unit', 'area_code')
          .innerJoinAndSelect('complaint_identifier.person_complaint_xref', 'person_complaint_xref',)
          .where('area_code.offloc_code = :zoneOfficeCode', { zoneOfficeCode })
          .andWhere('person_complaint_xref.active_ind = true')
          .andWhere('person_complaint_xref.person_complaint_xref_code = :Assignee', { Assignee: 'ASSIGNEE' });
  
          offices[i].assigned = await assignedComplaintsQuery.getCount();
        
  
        const totalComplaintsQuery = await this.allegationComplaintsRepository.createQueryBuilder('unassigned_allegation_complaint')
          .leftJoinAndSelect('unassigned_allegation_complaint.complaint_identifier', 'complaint_identifier')
          .leftJoinAndSelect('complaint_identifier.cos_geo_org_unit', 'area_code')
          .where('area_code.offloc_code = :zoneOfficeCode', { zoneOfficeCode });
  

        offices[i].unassigned = await totalComplaintsQuery.getCount() - offices[i].assigned;
  
    
      }
  
      results = { ...results, total: totalComplaints, assigned: totalAssignedComplaints, unassigned: totalComplaints - totalAssignedComplaints, offices: offices }

    return results;
  }
}
