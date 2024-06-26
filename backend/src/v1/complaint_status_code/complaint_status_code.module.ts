import { Module } from "@nestjs/common";
import { ComplaintStatusCodeService } from "./complaint_status_code.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ComplaintStatusCode } from "./entities/complaint_status_code.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintStatusCode])],
  controllers: [],
  providers: [ComplaintStatusCodeService],
})
export class ComplaintStatusCodeModule {}
