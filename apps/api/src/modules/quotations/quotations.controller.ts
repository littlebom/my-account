import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('quotations')
@UseGuards(JwtAuthGuard)
export class QuotationsController {
    constructor(private readonly quotationsService: QuotationsService) { }

    @Get()
    findAll(@Request() req: any) {
        return this.quotationsService.findAll(req.user.tenantId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.quotationsService.findOne(req.user.tenantId, id);
    }

    @Post()
    create(@Request() req: any, @Body() body: any) {
        return this.quotationsService.create(req.user.tenantId, body);
    }

    @Put(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
        return this.quotationsService.update(req.user.tenantId, id, body);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.quotationsService.remove(req.user.tenantId, id);
    }
}
