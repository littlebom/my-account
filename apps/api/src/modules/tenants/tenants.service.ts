
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tenant } from '@prisma/client';

@Injectable()
export class TenantsService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: string): Promise<Tenant | null> {
        return this.prisma.tenant.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
        return this.prisma.tenant.update({
            where: { id },
            data,
        });
    }
}
