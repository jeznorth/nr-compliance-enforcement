import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AttractantHwcrXrefService } from './attractant_hwcr_xref.service';
import { CreateAttractantHwcrXrefDto } from './dto/create-attractant_hwcr_xref.dto';
import { UpdateAttractantHwcrXrefDto } from './dto/update-attractant_hwcr_xref.dto';

@Controller('attractant-hwcr-xref')
export class AttractantHwcrXrefController {
  constructor(private readonly attractantHwcrXrefService: AttractantHwcrXrefService) {}

  @Post()
  create(@Body() createAttractantHwcrXrefDto: CreateAttractantHwcrXrefDto) {
    return this.attractantHwcrXrefService.create(createAttractantHwcrXrefDto);
  }

  @Get()
  findAll() {
    return this.attractantHwcrXrefService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attractantHwcrXrefService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttractantHwcrXrefDto: UpdateAttractantHwcrXrefDto) {
    return this.attractantHwcrXrefService.update(+id, updateAttractantHwcrXrefDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attractantHwcrXrefService.remove(+id);
  }
}
