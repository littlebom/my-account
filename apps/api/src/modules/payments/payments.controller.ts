
import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Get()
    findAll(@Request() req: any, @Query('type') type?: string) {
        return this.paymentsService.findAll(req.user.tenantId, type);
    }

    // POST /payments/receipt (receive money from customer)
    @Post('receipt')
    createReceipt(@Request() req: any, @Body() body: any) {
        return this.paymentsService.createReceipt(req.user.tenantId, req.user.userId, body);
    }

    // POST /payments/pay (pay money to vendor)
    @Post('pay')
    createPayment(@Request() req: any, @Body() body: any) {
        return this.paymentsService.createPayment(req.user.tenantId, req.user.userId, body);
    }
}
