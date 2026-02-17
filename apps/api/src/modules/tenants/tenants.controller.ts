
import { Controller, Get, Body, Patch, UseGuards, Request } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
    constructor(private tenantsService: TenantsService) { }

    @Get('profile')
    async getProfile(@Request() req: any) {
        return this.tenantsService.findOne(req.user.tenantId);
    }

    @Patch('profile')
    async updateProfile(@Request() req: any, @Body() data: any) {
        return this.tenantsService.update(req.user.tenantId, data);
    }
}
