
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CoaService } from './coa.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('coa')
@UseGuards(JwtAuthGuard)
export class CoaController {
    constructor(private readonly coaService: CoaService) { }

    @Post()
    create(@Request() req: any, @Body() createCoaDto: any) {
        return this.coaService.create(req.user.tenantId, createCoaDto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.coaService.findAll(req.user.tenantId);
    }

    @Get('tree')
    getTree(@Request() req: any) {
        return this.coaService.getTree(req.user.tenantId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.coaService.findOne(req.user.tenantId, id);
    }

    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() updateCoaDto: any) {
        return this.coaService.update(req.user.tenantId, id, updateCoaDto);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.coaService.remove(req.user.tenantId, id);
    }
}
