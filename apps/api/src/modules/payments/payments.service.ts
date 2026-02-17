
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JournalsService } from '../journals/journals.service';

@Injectable()
export class PaymentsService {
    constructor(
        private prisma: PrismaService,
        private journalsService: JournalsService
    ) { }

    async findAll(tenantId: string, type?: string) {
        const where: any = { tenantId };
        if (type) {
            where.paymentType = type;
        }

        return this.prisma.payment.findMany({
            where,
            include: { invoice: { include: { customer: true } }, bill: { include: { vendor: true } } },
            orderBy: { documentNumber: 'desc' },
        });
    }

    // Record a payment for an Invoice (Receipt)
    async createReceipt(tenantId: string, userId: string, data: any) {
        const { invoiceId, amount, paymentMethod, notes, bankAccountId, paymentDate } = data;

        const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId, tenantId } });
        if (!invoice) throw new NotFoundException('Invoice not found');

        if (invoice.status !== 'approved' && invoice.status !== 'overdue') {
            throw new BadRequestException('Cannot pay an invoice that is not approved');
        }

        // 1. Generate Running Number (RCT-YYYYMM-XXXX)
        const date = new Date(paymentDate);
        const yearMonth = date.toISOString().slice(0, 7).replace('-', '');

        const lastPayment = await this.prisma.payment.findFirst({
            where: {
                tenantId,
                documentNumber: { startsWith: `RCT-${yearMonth}-` }
            },
            orderBy: { documentNumber: 'desc' },
        });

        let runningNumber = 1;
        if (lastPayment) {
            const parts = lastPayment.documentNumber.split('-');
            runningNumber = parseInt(parts[2]) + 1;
        }
        const documentNumber = `RCT-${yearMonth}-${runningNumber.toString().padStart(4, '0')}`;

        // 2. Create Payment Record
        const payment = await this.prisma.payment.create({
            data: {
                tenantId,
                documentNumber,
                paymentDate: new Date(paymentDate),
                paymentMethod,
                paymentType: 'receive',
                invoiceId,
                amount,
                notes,
                status: 'posted', // Auto-post
                createdBy: userId
            }
        });

        // 3. Update Invoice
        const newPaidAmount = Number(invoice.paidAmount) + Number(amount);
        const newStackStatus = newPaidAmount >= Number(invoice.totalAmount) ? 'paid' : 'partial';

        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                paidAmount: newPaidAmount,
                paymentStatus: newStackStatus,
                status: newStackStatus === 'paid' ? 'paid' : invoice.status // Update main status too if fully paid
            }
        });

        // 4. Auto-GL Posting
        // Dr Cash/Bank (Selected Account)
        // Cr Accounts Receivable (Find from Chart of Accounts)

        // Using 11200-Trade Accounts Receivable (from seed) or similar
        const arAccount = await this.prisma.chartOfAccount.findFirst({
            where: { tenantId, accountCode: { startsWith: '112' } } // 112xx Accounts Receivable
        });
        if (!arAccount) throw new BadRequestException('AR Account not found');

        const journalEntry = await this.journalsService.create(tenantId, userId, {
            date: date.toISOString(),
            reference: documentNumber,
            explanation: `Receipt for Invoice #${invoice.documentNumber}`,
            lines: [
                {
                    accountId: bankAccountId, // User selected Cash/Bank account
                    debit: Number(amount),
                    credit: 0,
                    description: `Receipt - ${invoice.documentNumber}`
                },
                {
                    accountId: arAccount.id,
                    debit: 0,
                    credit: Number(amount),
                    description: `AR - ${invoice.documentNumber}`
                }
            ]
        });

        // Link Journal to Payment
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: { journalEntryId: journalEntry.id }
        });

        return payment;
    }

    // Record a payment for a Bill (Payment Voucher)
    async createPayment(tenantId: string, userId: string, data: any) {
        const { billId, amount, paymentMethod, notes, bankAccountId, paymentDate } = data;

        const bill = await this.prisma.bill.findUnique({ where: { id: billId, tenantId } });
        if (!bill) throw new NotFoundException('Bill not found');

        if (bill.status !== 'approved') {
            throw new BadRequestException('Cannot pay a bill that is not approved');
        }

        // 1. Generate Running Number (PV-YYYYMM-XXXX)
        const date = new Date(paymentDate);
        const yearMonth = date.toISOString().slice(0, 7).replace('-', '');

        const lastPayment = await this.prisma.payment.findFirst({
            where: {
                tenantId,
                documentNumber: { startsWith: `PV-${yearMonth}-` }
            },
            orderBy: { documentNumber: 'desc' },
        });

        let runningNumber = 1;
        if (lastPayment) {
            const parts = lastPayment.documentNumber.split('-');
            runningNumber = parseInt(parts[2]) + 1;
        }
        const documentNumber = `PV-${yearMonth}-${runningNumber.toString().padStart(4, '0')}`;

        // 2. Create Payment Record (Outgoing)
        const payment = await this.prisma.payment.create({
            data: {
                tenantId,
                documentNumber,
                paymentDate: new Date(paymentDate),
                paymentMethod,
                paymentType: 'pay',
                billId,
                amount,
                notes,
                status: 'posted',
                createdBy: userId
            }
        });

        // 3. Update Bill
        const newPaidAmount = Number(bill.paidAmount) + Number(amount);
        const newStatus = newPaidAmount >= Number(bill.totalAmount) ? 'paid' : 'partial'; // Bills use 'status' field

        await this.prisma.bill.update({
            where: { id: billId },
            data: {
                paidAmount: newPaidAmount,
                status: newStatus === 'paid' ? 'paid' : newStatus // Update status
            }
        });

        // 4. Auto-GL Posting
        // Dr Accounts Payable (Find from Chart of Accounts)
        // Cr Cash/Bank (Selected Account)

        // Using 21100-Accounts Payable (from seed) or similar
        const apAccount = await this.prisma.chartOfAccount.findFirst({
            where: { tenantId, accountCode: { startsWith: '211' } } // 211xx AP
        });
        if (!apAccount) throw new BadRequestException('AP Account not found');

        const journalEntry = await this.journalsService.create(tenantId, userId, {
            date: date.toISOString(),
            reference: documentNumber,
            explanation: `Payment for Bill #${bill.documentNumber}`,
            lines: [
                {
                    accountId: apAccount.id,
                    debit: Number(amount),
                    credit: 0,
                    description: `AP - ${bill.documentNumber}`
                },
                {
                    accountId: bankAccountId, // User selected Cash/Bank account
                    debit: 0,
                    credit: Number(amount),
                    description: `Payment - ${bill.documentNumber}`
                }
            ]
        });

        // Link Journal to Payment
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: { journalEntryId: journalEntry.id }
        });

        return payment;
    }
}
