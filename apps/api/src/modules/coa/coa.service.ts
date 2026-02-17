
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChartOfAccount } from '@prisma/client';

@Injectable()
export class CoaService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, data: any): Promise<ChartOfAccount> {
        return this.prisma.chartOfAccount.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string): Promise<ChartOfAccount[]> {
        return this.prisma.chartOfAccount.findMany({
            where: { tenantId },
            orderBy: { accountCode: 'asc' },
        });
    }

    async findOne(tenantId: string, id: string): Promise<ChartOfAccount | null> {
        return this.prisma.chartOfAccount.findUnique({
            where: { id },
        });
    }

    async update(tenantId: string, id: string, data: any): Promise<ChartOfAccount> {
        await this.findOne(tenantId, id);
        return this.prisma.chartOfAccount.update({
            where: { id },
            data,
        });
    }

    async remove(tenantId: string, id: string): Promise<ChartOfAccount> {
        await this.findOne(tenantId, id);
        return this.prisma.chartOfAccount.delete({
            where: { id },
        });
    }

    async getTree(tenantId: string): Promise<any[]> {
        const accounts = await this.findAll(tenantId);
        return this.buildTree(accounts);
    }

    private buildTree(accounts: ChartOfAccount[], parentId: string | null = null): any[] {
        return accounts
            .filter((acc) => acc.parentId === parentId)
            .map((acc) => ({
                ...acc,
                children: this.buildTree(accounts, acc.id),
            }));
    }
}
