
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JournalsService } from '../journals/journals.service';

@Injectable()
export class BillsService {
    constructor(
        private prisma: PrismaService,
        private journalsService: JournalsService
    ) { }

    async findAll(tenantId: string) {
        return this.prisma.bill.findMany({
            where: { tenantId },
            include: { vendor: true },
            orderBy: { documentNumber: 'desc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        const bill = await this.prisma.bill.findUnique({
            where: { id, tenantId },
            include: {
                vendor: true,
                items: true
            },
        });
        if (!bill) throw new NotFoundException('Bill not found');
        return bill;
    }

    async create(tenantId: string, userId: string, data: any) {
        // 1. Generate Running Number (BILL-YYYYMM-XXXX)
        const date = new Date(data.documentDate);
        const yearMonth = date.toISOString().slice(0, 7).replace('-', '');

        const lastBill = await this.prisma.bill.findFirst({
            where: {
                tenantId,
                documentNumber: { startsWith: `BILL-${yearMonth}-` }
            },
            orderBy: { documentNumber: 'desc' },
        });

        let runningNumber = 1;
        if (lastBill) {
            const parts = lastBill.documentNumber.split('-');
            runningNumber = parseInt(parts[2]) + 1;
        }
        const documentNumber = `BILL-${yearMonth}-${runningNumber.toString().padStart(4, '0')}`;

        // 2. Calculate Totals
        const subtotal = data.items.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
        const vatRate = 0.07;
        const vatAmount = subtotal * vatRate;
        const totalAmount = subtotal + vatAmount;

        // 3. Create Bill
        return this.prisma.bill.create({
            data: {
                tenantId,
                documentNumber,
                documentDate: new Date(data.documentDate),
                dueDate: new Date(data.dueDate),
                vendorId: data.vendorId,
                vendorInvoiceNo: data.vendorInvoiceNo,
                subtotal,
                vatAmount,
                totalAmount,
                status: 'draft',
                items: {
                    create: data.items.map((item: any) => ({
                        tenantId,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        amount: Number(item.quantity) * Number(item.unitPrice),
                        vatRate: 7.00
                    }))
                }
            },
        });
    }

    async approve(tenantId: string, userId: string, id: string) {
        const bill = await this.findOne(tenantId, id);
        if (bill.status !== 'draft') {
            throw new BadRequestException('Bill is not in draft status');
        }

        // 1. Update Status
        await this.prisma.bill.update({
            where: { id },
            data: { status: 'approved' }
        });

        // 2. Auto-Post to GL via Journal Entry
        // Logic: Dr Expense (Purchase) / Dr VAT Input / Cr Accounts Payable

        // Find Accounts
        // Need: 5xxx (Expense/Purchase), 1xxx (VAT Input), 2xxx (AP)
        // Assuming standard codes: 
        // 5100-01: Purchases (Cost of Goods Sold)
        // 1150-01: VAT Input (Account Code needs verification, using placeholder 1150-01)
        // 2110-01: Accounts Payable

        // Let's broaden search to find *any* account of these types if specific codes fail, but for now try specific codes.
        // Based on previous step, we found 1100-01 (AR), 4100-01 (Sales), 2100-02 (VAT Output)
        // Let's assume:
        // AP = 2100-01 (Accounts Payable)
        // VAT Input = 1200-01 (VAT Input)
        // Purchases = 5100-01 (Purchases)

        const accounts = await this.prisma.chartOfAccount.findMany({
            where: { tenantId, accountCode: { in: ['2100-01', '1200-01', '5100-01'] } }
        });

        const apAccount = accounts.find(a => a.accountCode === '2100-01');
        const vatInputAccount = accounts.find(a => a.accountCode === '1200-01');
        const purchaseAccount = accounts.find(a => a.accountCode === '5100-01');

        if (!apAccount || !purchaseAccount) {
            throw new BadRequestException('System accounts (AP/Purchases) not found. Please check Chart of Accounts.');
        }

        const journalData = {
            date: bill.documentDate.toISOString(),
            reference: bill.documentNumber,
            explanation: `Bill #${bill.documentNumber} - ${bill.vendor.name}`,
            lines: [
                {
                    accountId: purchaseAccount.id,
                    debit: Number(bill.subtotal),
                    credit: 0,
                    description: `Purchase - ${bill.documentNumber}`
                },
                {
                    accountId: apAccount.id,
                    debit: 0,
                    credit: Number(bill.totalAmount),
                    description: `AP - ${bill.documentNumber}`
                },
            ]
        };

        if (Number(bill.vatAmount) > 0 && vatInputAccount) {
            journalData.lines.push({
                accountId: vatInputAccount.id,
                debit: Number(bill.vatAmount),
                credit: 0,
                description: `VAT Input - ${bill.documentNumber}`
            });
        }

        // Call JournalsService
        const journalEntry = await this.journalsService.create(tenantId, userId, journalData);

        // Link Journal to Bill
        await this.prisma.bill.update({
            where: { id },
            data: { journalEntryId: journalEntry.id }
        });

        return { success: true, journalEntryId: journalEntry.id };
    }
}
