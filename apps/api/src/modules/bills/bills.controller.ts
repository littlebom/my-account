
import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { BillsService } from './bills.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bills')
@UseGuards(JwtAuthGuard)
export class BillsController {
    constructor(private readonly billsService: BillsService) { }

    @Get()
    findAll(@Request() req: any) {
        return this.billsService.findAll(req.user.tenantId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.billsService.findOne(req.user.tenantId, id);
    }

    @Post()
    create(@Request() req: any, @Body() body: any) {
        return this.billsService.create(req.user.tenantId, req.user.userId, body);
    }

    @Patch(':id/approve')
    approve(@Request() req: any, @Param('id') id: string) {
        return this.billsService.approve(req.user.tenantId, req.user.userId, id);
    }
}
