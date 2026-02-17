import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    @Get()
    @ApiOperation({ summary: 'Check API health status' })
    @ApiResponse({ status: 200, description: 'API is healthy' })
    check() {
        return this.healthService.check();
    }

    @Get('db')
    @ApiOperation({ summary: 'Check database connection' })
    @ApiResponse({ status: 200, description: 'Database is connected' })
    @ApiResponse({ status: 503, description: 'Database connection failed' })
    async checkDatabase() {
        return this.healthService.checkDatabase();
    }
}
