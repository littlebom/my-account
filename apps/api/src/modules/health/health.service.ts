import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
    constructor(private readonly prisma: PrismaService) { }

    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'cloud-accounting-api',
            version: '0.1.0',
        };
    }

    async checkDatabase() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                status: 'ok',
                database: 'connected',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                status: 'error',
                database: 'disconnected',
                message: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
}
