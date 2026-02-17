import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { BillingNotesService } from './billing-notes.service';
import { CreateBillingNoteDto } from './billing-notes.dto';

@Controller('billing-notes')
export class BillingNotesController {
    constructor(private readonly billingNotesService: BillingNotesService) { }

    @Post()
    create(@Request() req: any, @Body() dto: CreateBillingNoteDto) {
        // Mock user/tenant for now if not fully auth-guarded, but usually req.user exists
        const tenantId = req.headers['x-tenant-id'] || 'default-tenant-id';
        const userId = 'user-id-placeholder'; // In real app, get from req.user
        return this.billingNotesService.create(tenantId, userId, dto);
    }

    @Get()
    findAll(@Request() req: any) {
        const tenantId = req.headers['x-tenant-id'] || 'default-tenant-id';
        return this.billingNotesService.findAll(tenantId);
    }

    @Get('unpaid-invoices')
    getUnpaidInvoices(@Request() req: any, @Query('customerId') customerId: string) {
        const tenantId = req.headers['x-tenant-id'] || 'default-tenant-id';
        return this.billingNotesService.findUnpaidInvoices(tenantId, customerId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.headers['x-tenant-id'] || 'default-tenant-id';
        return this.billingNotesService.findOne(tenantId, id);
    }
}
