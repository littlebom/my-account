
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JournalsService } from '../journals/journals.service';

@Injectable()
export class InvoicesService {
    constructor(
        private prisma: PrismaService,
        private journalsService: JournalsService
    ) { }

    async findAll(tenantId: string) {
        return this.prisma.invoice.findMany({
            where: { tenantId },
            include: { customer: true },
            orderBy: { documentNumber: 'desc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id, tenantId },
            include: {
                customer: true,
                items: true
            },
        });
        if (!invoice) throw new NotFoundException('Invoice not found');
        return invoice;
    }

    async create(tenantId: string, userId: string, data: any) {
        // 1. Generate Running Number (INV-YYYYMM-XXXX)
        const date = new Date(data.documentDate);
        const yearMonth = date.toISOString().slice(0, 7).replace('-', ''); // 202401

        // Find last invoice of this month
        const lastInvoice = await this.prisma.invoice.findFirst({
            where: {
                tenantId,
                documentNumber: { startsWith: `INV-${yearMonth}-` }
            },
            orderBy: { documentNumber: 'desc' },
        });

        let runningNumber = 1;
        if (lastInvoice) {
            const parts = lastInvoice.documentNumber.split('-');
            runningNumber = parseInt(parts[2]) + 1;
        }
        const documentNumber = `INV-${yearMonth}-${runningNumber.toString().padStart(4, '0')}`;

        // 2. Calculate Totals
        const subtotal = data.items.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
        const vatRate = 0.07; // Hardcoded for now, ideal to get from settings
        const vatAmount = subtotal * vatRate;
        const totalAmount = subtotal + vatAmount;

        // 3. Create Invoice
        return this.prisma.invoice.create({
            data: {
                tenantId,
                documentNumber,
                documentType: 'invoice',
                documentDate: new Date(data.documentDate),
                dueDate: new Date(data.dueDate),
                customerId: data.customerId,
                subtotal,
                vatAmount,
                totalAmount,
                status: 'draft', // Always draft first
                createdBy: userId,
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
        const invoice = await this.findOne(tenantId, id);
        if (invoice.status !== 'draft') {
            throw new BadRequestException('Invoice is not in draft status');
        }

        // 1. Update Status
        await this.prisma.invoice.update({
            where: { id },
            data: { status: 'approved' }
        });

        // 2. Auto-Post to GL via Journal Entry
        // Logic: Dr Accounts Receivable / Cr Sales Income / Cr VAT Payable
        // For MVP, we need to find appropriate Account IDs. 
        // We will query by code or type. Assuming standard codes exist from Seed.

        const accounts = await this.prisma.chartOfAccount.findMany({
            where: { tenantId, accountCode: { in: ['11210', '41200', '21210'] } } // AR, Sales, VAT Output
        });

        const arAccount = accounts.find(a => a.accountCode === '11210'); // Look for AR
        const salesAccount = accounts.find(a => a.accountCode === '41200'); // Look for Sales
        const vatAccount = accounts.find(a => a.accountCode === '21210'); // Look for VAT Output

        if (!arAccount || !salesAccount) {
            throw new BadRequestException('System accounts (AR/Sales) not found. Please check Chart of Accounts.');
        }

        const journalData = {
            date: invoice.documentDate.toISOString(), // Use Invoice Date logic
            reference: invoice.documentNumber,
            explanation: `Invoice #${invoice.documentNumber} - ${invoice.customer.name}`,
            lines: [
                {
                    accountId: arAccount.id,
                    debit: Number(invoice.totalAmount),
                    credit: 0,
                    description: `AR - ${invoice.documentNumber}`
                },
                {
                    accountId: salesAccount.id,
                    debit: 0,
                    credit: Number(invoice.subtotal),
                    description: `Sales - ${invoice.documentNumber}`
                },
            ]
        };

        if (Number(invoice.vatAmount) > 0 && vatAccount) {
            journalData.lines.push({
                accountId: vatAccount.id,
                debit: 0,
                credit: Number(invoice.vatAmount),
                description: `VAT Output - ${invoice.documentNumber}`
            });
        }

        // Call JournalsService to create the GL entry
        const journalEntry = await this.journalsService.create(tenantId, userId, journalData);

        // Link Journal to Invoice
        await this.prisma.invoice.update({
            where: { id },
            data: { journalEntryId: journalEntry.id }
        });

        return { success: true, journalEntryId: journalEntry.id };
    }
}
