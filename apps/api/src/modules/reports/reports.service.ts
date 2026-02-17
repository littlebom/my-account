
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getTrialBalance(tenantId: string, date: string) {
        // 1. Get all accounts to ensure we show even those with 0 balance (optional, but good practice)
        // For now, let's just query lines and aggregate.

        // Aggregate by Account
        const lines = await this.prisma.journalLine.groupBy({
            by: ['accountId'],
            where: {
                tenantId,
                journalEntry: {
                    entryDate: { lte: new Date(date) },
                    status: 'posted',
                },
            },
            _sum: {
                debitAmount: true,
                creditAmount: true,
            },
        });

        // Get Account Details
        const accounts = await this.prisma.chartOfAccount.findMany({
            where: { tenantId },
            select: { id: true, accountCode: true, accountName: true, accountType: true, normalBalance: true },
        });

        // Map aggregation to accounts
        const trialBalance = accounts.map((acc) => {
            const agg = lines.find((l) => l.accountId === acc.id);
            const debit = Number(agg?._sum.debitAmount || 0);
            const credit = Number(agg?._sum.creditAmount || 0);

            let netDebit = 0;
            let netCredit = 0;

            // Simple Netting logic
            if (debit > credit) {
                netDebit = debit - credit;
            } else {
                netCredit = credit - debit;
            }

            return {
                accountId: acc.id,
                accountCode: acc.accountCode,
                accountName: acc.accountName,
                debit,
                credit,
                netDebit,
                netCredit
            };
        }).filter(item => item.debit !== 0 || item.credit !== 0); // Filter out zero balance?? Maybe keep them.
        // Let's filter out true zeros to keep it clean, or keep them if standard demands.
        // For now, return all that have activity OR just return all accounts. 
        // Let's return only those with activity for cleaner report initially.

        return trialBalance.filter(acc => acc.netDebit !== 0 || acc.netCredit !== 0);
    }

    async getGeneralLedger(tenantId: string, accountId: string, startDate: string, endDate: string) {
        const lines = await this.prisma.journalLine.findMany({
            where: {
                tenantId,
                accountId,
                journalEntry: {
                    entryDate: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                    status: 'posted',
                },
            },
            include: {
                journalEntry: {
                    select: { id: true, entryDate: true, entryNumber: true, description: true },
                },
            },
            orderBy: {
                journalEntry: { entryDate: 'asc' },
            },
        });

        // Calculate running balance (Client-side or here? Here is better)
        let balance = 0;
        const result = lines.map((line) => {
            const debit = Number(line.debitAmount);
            const credit = Number(line.creditAmount);
            // Assuming Asset/Expense (Debit normal) increases with Debit.
            // We really need account specific logic, but simplest is Dr - Cr.
            // Only if we know the account normal balance.
            // For GL Report, usually we just show Dr/Cr and current balance relative to start.

            balance += (debit - credit);

            return {
                id: line.id,
                date: line.journalEntry.entryDate,
                documentNumber: line.journalEntry.entryNumber,
                description: line.journalEntry.description || line.description,
                debit,
                credit,
                balance // This is "Movement Balance", not necessarily absolute if we didn't fetch opening.
            };
        });

        return result;
    }
}
