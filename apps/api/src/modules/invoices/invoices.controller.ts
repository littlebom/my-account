
import { Controller, Get, Post, Body, Param, Put, Patch, UseGuards, Request } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Get()
    findAll(@Request() req: any) {
        return this.invoicesService.findAll(req.user.tenantId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.invoicesService.findOne(req.user.tenantId, id);
    }

    @Post()
    create(@Request() req: any, @Body() body: any) {
        return this.invoicesService.create(req.user.tenantId, req.user.userId, body);
    }

    @Patch(':id/approve')
    approve(@Request() req: any, @Param('id') id: string) {
        return this.invoicesService.approve(req.user.tenantId, req.user.userId, id);
    }
}
