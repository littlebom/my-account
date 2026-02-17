import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuotationsService {
    constructor(private prisma: PrismaService) { }

    async findAll(tenantId: string) {
        return this.prisma.quotation.findMany({
            where: { tenantId },
            include: { customer: true },
            orderBy: { documentNumber: 'desc' },
        });
    }

    async findOne(tenantId: string, idOrDocNo: string) {
        const quotation = await this.prisma.quotation.findFirst({
            where: {
                tenantId,
                OR: [
                    { id: idOrDocNo },
                    { documentNumber: idOrDocNo }
                ]
            },
            include: { customer: true, items: true },
        });

        if (!quotation) {
            throw new NotFoundException('Quotation not found');
        }

        return quotation;
    }

    async create(tenantId: string, data: any) {
        const { items, ...quotationData } = data;

        // Convert dates
        if (typeof quotationData.documentDate === 'string') {
            quotationData.documentDate = new Date(quotationData.documentDate);
        }
        if (typeof quotationData.validUntil === 'string') {
            quotationData.validUntil = new Date(quotationData.validUntil);
        }

        // Generate Document Number (Simple version)
        // In prod, use a dedicated sequence generator
        const count = await this.prisma.quotation.count({ where: { tenantId } });
        const documentNumber = `QT-${new Date().getFullYear()}${(count + 1).toString().padStart(4, '0')}`;

        return this.prisma.quotation.create({
            data: {
                ...quotationData,
                tenantId,
                documentNumber,
                items: {
                    create: items.map((item: any, index: number) => ({
                        ...item,
                        tenantId,
                        lineNumber: index + 1,
                    })),
                },
            },
            include: { items: true },
        });
    }

    async update(tenantId: string, id: string, data: any) {
        const { items, ...quotationData } = data;

        // Convert dates
        if (typeof quotationData.documentDate === 'string') {
            quotationData.documentDate = new Date(quotationData.documentDate);
        }
        if (typeof quotationData.validUntil === 'string') {
            quotationData.validUntil = new Date(quotationData.validUntil);
        }

        // Verify existence
        await this.findOne(tenantId, id);

        // Transaction to update header and replace items
        return this.prisma.$transaction(async (tx) => {
            // Update Header
            const updated = await tx.quotation.update({
                where: { id },
                data: quotationData,
            });

            if (items) {
                // Delete old items
                await tx.quotationItem.deleteMany({ where: { quotationId: id } });

                // Create new items
                await tx.quotationItem.createMany({
                    data: items.map((item: any, index: number) => ({
                        ...item,
                        tenantId,
                        quotationId: id,
                        lineNumber: index + 1,
                    })),
                });
            }

            return updated;
        });
    }

    async remove(tenantId: string, id: string) {
        await this.findOne(tenantId, id);

        // Items cascade delete usually handled by DB, but here we do it explicit or rely on schema generic relation
        // Prisma schema didn't specify onDelete: Cascade, so we might need to delete items first.

        return this.prisma.$transaction(async (tx) => {
            await tx.quotationItem.deleteMany({ where: { quotationId: id } });
            return tx.quotation.delete({ where: { id } });
        });
    }
}
