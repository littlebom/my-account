
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('trial-balance')
    getTrialBalance(@Request() req: any, @Query('date') date: string) {
        return this.reportsService.getTrialBalance(req.user.tenantId, date || new Date().toISOString());
    }

    @Get('general-ledger')
    getGeneralLedger(
        @Request() req: any,
        @Query('accountId') accountId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.reportsService.getGeneralLedger(
            req.user.tenantId,
            accountId,
            startDate || new Date().toISOString(),
            endDate || new Date().toISOString()
        );
    }
}
