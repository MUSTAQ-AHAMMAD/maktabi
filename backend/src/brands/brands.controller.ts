import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BrandsService } from './brands.service';

@ApiTags('Brands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('brands')
export class BrandsController {
  constructor(private service: BrandsService) {}

  @Get()
  findAll(@Query('includeInactive') includeInactive: string) {
    return this.service.findAll(includeInactive === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() body: { name: string; code: string; description?: string; color?: string }) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; code?: string; description?: string; color?: string; isActive?: boolean }) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
