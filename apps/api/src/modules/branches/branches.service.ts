
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Branch } from '@prisma/client';

@Injectable()
export class BranchesService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, data: any): Promise<Branch> {
        return this.prisma.branch.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string): Promise<Branch[]> {
        return this.prisma.branch.findMany({
            where: { tenantId },
        });
    }

    async findOne(tenantId: string, id: string): Promise<Branch | null> {
        return this.prisma.branch.findUnique({
            where: { id },
        });
    }

    async update(tenantId: string, id: string, data: any): Promise<Branch> {
        // Verify ownership
        await this.findOne(tenantId, id);
        return this.prisma.branch.update({
            where: { id },
            data,
        });
    }

    async remove(tenantId: string, id: string): Promise<Branch> {
        // Verify ownership
        await this.findOne(tenantId, id);
        return this.prisma.branch.delete({
            where: { id },
        });
    }
}
