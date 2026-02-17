
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JournalEntry, JournalLine, Prisma } from '@prisma/client';

@Injectable()
export class JournalsService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, userId: string, data: any): Promise<JournalEntry> {
        const { date, description, lines } = data;

        // 1. Validate Totals
        const totalDebit = lines.reduce((sum: number, line: any) => sum + Number(line.debitAmount || 0), 0);
        const totalCredit = lines.reduce((sum: number, line: any) => sum + Number(line.creditAmount || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new BadRequestException(`Debit (${totalDebit}) and Credit (${totalCredit}) must be equal.`);
        }

        if (totalDebit === 0) {
            throw new BadRequestException('Journal entry must have non-zero amounts.');
        }

        // 2. Generate Running Number (Simplified)
        // Format: JV-YYYYMM-XXXX
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const prefix = `JV-${year}${month}`;

        const lastEntry = await this.prisma.journalEntry.findFirst({
            where: {
                tenantId,
                entryNumber: { startsWith: prefix },
            },
            orderBy: { entryNumber: 'desc' },
        });

        let sequence = 1;
        if (lastEntry) {
            const parts = lastEntry.entryNumber.split('-');
            sequence = parseInt(parts[2]) + 1;
        }
        const entryNumber = `${prefix}-${String(sequence).padStart(4, '0')}`;

        // 3. Create Entry and Lines
        return this.prisma.journalEntry.create({
            data: {
                tenantId,
                entryNumber,
                entryDate: dateObj,
                journalType: 'general',
                description,
                totalDebit,
                totalCredit,
                status: 'posted',
                createdBy: userId,
                lines: {
                    create: lines.map((line: any, index: number) => ({
                        tenantId,
                        lineNumber: index + 1,
                        accountId: line.accountId,
                        description: line.description || description,
                        debitAmount: line.debitAmount || 0,
                        creditAmount: line.creditAmount || 0,
                    })),
                },
            },
            include: {
                lines: true,
            },
        });
    }

    async findAll(tenantId: string): Promise<JournalEntry[]> {
        return this.prisma.journalEntry.findMany({
            where: { tenantId },
            orderBy: { entryNumber: 'desc' },
            include: {
                lines: {
                    include: {
                        account: true
                    }
                }
            }
        });
    }

    async findOne(tenantId: string, id: string): Promise<JournalEntry | null> {
        return this.prisma.journalEntry.findUnique({
            where: { id },
            include: {
                lines: {
                    include: {
                        account: true,
                    },
                    orderBy: { lineNumber: 'asc' },
                },
            },
        });
    }
}
