import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { CreateHwcrComplaintDto } from "./dto/create-hwcr_complaint.dto";
import { UpdateHwcrComplaintDto } from "./dto/update-hwcr_complaint.dto";
import { HwcrComplaint } from "./entities/hwcr_complaint.entity";
import { ComplaintService } from "../complaint/complaint.service";
import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UUID } from "crypto";
import { CreateComplaintDto } from "../complaint/dto/create-complaint.dto";
import { AttractantHwcrXrefService } from "../attractant_hwcr_xref/attractant_hwcr_xref.service";

@Injectable()
export class HwcrComplaintService {

  private readonly logger = new Logger(HwcrComplaintService.name);

  constructor(private dataSource: DataSource) {}
  @InjectRepository(HwcrComplaint)
  private hwcrComplaintsRepository: Repository<HwcrComplaint>;
  @Inject(ComplaintService)
  protected readonly complaintService: ComplaintService;
  @Inject(AttractantHwcrXrefService)
  protected readonly attractantHwcrXrefService: AttractantHwcrXrefService;

  async create(hwcrComplaint: any): Promise<HwcrComplaint> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    let newHwcrComplaintString;
    try {
      await this.complaintService.create(
        <CreateComplaintDto>hwcrComplaint,
        queryRunner
      );
      newHwcrComplaintString = await this.hwcrComplaintsRepository.create(
        <CreateHwcrComplaintDto>hwcrComplaint
      );
      let newHwcrComplaint: HwcrComplaint;
      newHwcrComplaint = <HwcrComplaint>(
        await queryRunner.manager.save(newHwcrComplaintString)
      );
      if (newHwcrComplaint.attractant_hwcr_xref != null) {
        for (let i = 0; i < newHwcrComplaint.attractant_hwcr_xref.length; i++) {
          const blankHwcrComplaint = new HwcrComplaint();
          blankHwcrComplaint.hwcr_complaint_guid =
            newHwcrComplaint.hwcr_complaint_guid;
          newHwcrComplaint.attractant_hwcr_xref[i].hwcr_complaint =
            blankHwcrComplaint;
          await this.attractantHwcrXrefService.create(
            newHwcrComplaint.attractant_hwcr_xref[i],
            queryRunner
          );
        }
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
      newHwcrComplaintString = "Error Occured";
      } finally {
        await queryRunner.release();
      }
      return newHwcrComplaintString;
    }
  
    async findAll(sortColumn: string, sortOrder: string): Promise<HwcrComplaint[]> {
      //compiler complains if you don't explicitly set the sort order to 'DESC' or 'ASC' in the function
      const sortOrderString = sortOrder === "DESC" ? "DESC" : "ASC";
      const sortTable = (sortColumn === 'complaint_identifier' || sortColumn === 'species_code' || sortColumn === 'hwcr_complaint_nature_code') ? 'hwcr_complaint.' : 'complaint_identifier.';
      const sortString =  sortColumn !== 'update_timestamp' ? sortTable + sortColumn : 'GREATEST(complaint_identifier.update_timestamp, hwcr_complaint.update_timestamp)';
      return this.hwcrComplaintsRepository.createQueryBuilder('hwcr_complaint')
      .leftJoinAndSelect('hwcr_complaint.complaint_identifier', 'complaint_identifier')
      .leftJoinAndSelect('hwcr_complaint.species_code','species_code')
      .leftJoinAndSelect('hwcr_complaint.hwcr_complaint_nature_code', 'hwcr_complaint_nature_code')
      .leftJoinAndSelect('hwcr_complaint.attractant_hwcr_xref', 'attractant_hwcr_xref')
      .leftJoinAndSelect('complaint_identifier.complaint_status_code', 'complaint_status_code')
      .leftJoinAndSelect('complaint_identifier.referred_by_agency_code', 'referred_by_agency_code')
      .leftJoinAndSelect('complaint_identifier.owned_by_agency_code', 'owned_by_agency_code')
      .leftJoinAndSelect('complaint_identifier.cos_geo_org_unit', 'area_code')
      .leftJoinAndSelect('attractant_hwcr_xref.attractant_code', 'attractant_code')
      .leftJoinAndSelect('complaint_identifier.person_complaint_xref', 'person_complaint_xref', 'person_complaint_xref.active_ind = true')
      .leftJoinAndSelect('person_complaint_xref.person_guid', 'person', 'person_complaint_xref.active_ind = true')
      .orderBy(sortString, sortOrderString)
      .addOrderBy('complaint_identifier.incident_reported_datetime', sortColumn === 'incident_reported_datetime' ? sortOrderString : "DESC")
      .getMany();
    }
  
    async findOne(id: any): Promise<HwcrComplaint> {
      return this.hwcrComplaintsRepository.createQueryBuilder('hwcr_complaint')
      .leftJoinAndSelect('hwcr_complaint.complaint_identifier', 'complaint_identifier')
      .leftJoinAndSelect('hwcr_complaint.species_code','species_code')
      .leftJoinAndSelect('hwcr_complaint.hwcr_complaint_nature_code', 'hwcr_complaint_nature_code')
      .leftJoinAndSelect('hwcr_complaint.attractant_hwcr_xref', 'attractant_hwcr_xref')
      .leftJoinAndSelect('complaint_identifier.complaint_status_code', 'complaint_status_code')
      .leftJoinAndSelect('complaint_identifier.referred_by_agency_code', 'referred_by_agency_code')
      .leftJoinAndSelect('complaint_identifier.owned_by_agency_code', 'owned_by_agency_code')
      .leftJoinAndSelect('complaint_identifier.cos_geo_org_unit', 'area_code')
      .leftJoinAndSelect('attractant_hwcr_xref.attractant_code', 'attractant_code')
      .leftJoinAndSelect('complaint_identifier.person_complaint_xref', 'person_complaint_xref', 'person_complaint_xref.active_ind = true')
      .leftJoinAndSelect('person_complaint_xref.person_guid', 'person', 'person_complaint_xref.active_ind = true')
      .where('hwcr_complaint.hwcr_complaint_guid = :id', {id})
      .getOne();
    }
  
  async update(
    hwcr_complaint_guid: UUID,
    updateHwcrComplaint: UpdateHwcrComplaintDto
  ): Promise<HwcrComplaint> {
    await this.hwcrComplaintsRepository.update(
      { hwcr_complaint_guid },
      updateHwcrComplaint
    );
      return this.findOne(hwcr_complaint_guid);
    }
  
    async remove(id: UUID): Promise<{ deleted: boolean; message?: string }> {
      try {
      let complaint_identifier = (
        await this.hwcrComplaintsRepository.findOneOrFail({
          where: { hwcr_complaint_guid: id },
          relations: {
            complaint_identifier: true,
          },
        })
      ).complaint_identifier.complaint_identifier;
      await this.hwcrComplaintsRepository.delete(id);
      await this.complaintService.remove(complaint_identifier);
      return { deleted: true };
    } catch (err) {
      return { deleted: false, message: err.message };
    }
  }

  async findByComplaintIdentifier(id: any): Promise<HwcrComplaint> {
    return this.hwcrComplaintsRepository.createQueryBuilder('hwcr_complaint')
    .leftJoinAndSelect('hwcr_complaint.complaint_identifier', 'complaint_identifier')
    .leftJoinAndSelect('hwcr_complaint.species_code','species_code')
    .leftJoinAndSelect('hwcr_complaint.hwcr_complaint_nature_code', 'hwcr_complaint_nature_code')
    .leftJoinAndSelect('hwcr_complaint.attractant_hwcr_xref', 'attractant_hwcr_xref')
    .leftJoinAndSelect('complaint_identifier.complaint_status_code', 'complaint_status_code')
    .leftJoinAndSelect('complaint_identifier.referred_by_agency_code', 'referred_by_agency_code')
    .leftJoinAndSelect('complaint_identifier.owned_by_agency_code', 'owned_by_agency_code')
    .leftJoinAndSelect('complaint_identifier.cos_geo_org_unit', 'area_code')
    .leftJoinAndSelect('attractant_hwcr_xref.attractant_code', 'attractant_code')
    .leftJoinAndSelect('complaint_identifier.person_complaint_xref', 'person_complaint_xref', 'person_complaint_xref.active_ind = true')
    .leftJoinAndSelect('person_complaint_xref.person_guid', 'person', 'person_complaint_xref.active_ind = true')
    .where('complaint_identifier.complaint_identifier = :id', {id})
    .getOne();
  }
}
