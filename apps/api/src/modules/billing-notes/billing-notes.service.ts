import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBillingNoteDto } from './billing-notes.dto';

@Injectable()
export class BillingNotesService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, userId: string, dto: CreateBillingNoteDto) {
        // 1. Generate Document Number
        const lastBn = await this.prisma.billingNote.findFirst({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });

        // Simple running number logic: BN-YYYYMM-XXXX
        const date = new Date();
        const prefix = `BN-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        let runningNumber = 1;
        if (lastBn && lastBn.documentNumber.startsWith(prefix)) {
            const parts = lastBn.documentNumber.split('-');
            runningNumber = parseInt(parts[2]) + 1;
        }
        const documentNumber = `${prefix}-${runningNumber.toString().padStart(4, '0')}`;

        // 2. Validate and Calculate Items
        let totalAmount = 0;
        const itemsToCreate = [];

        for (const item of dto.items) {
            const invoice = await this.prisma.invoice.findUnique({
                where: { id: item.invoiceId },
            });

            if (!invoice) throw new NotFoundException(`Invoice ${item.invoiceId} not found`);
            if (invoice.tenantId !== tenantId) throw new BadRequestException('Invalid invoice');
            if (invoice.customerId !== dto.customerId) throw new BadRequestException('Invoice does not belong to this customer');
            if (invoice.paymentStatus === 'paid') throw new BadRequestException(`Invoice ${invoice.documentNumber} is already paid`);

            // Calculate outstanding amount
            // Convert Decimals to number for calculation (be careful with precision in real app, but for MVP JS number is ok-ish if handled)
            // Prisma returns Decimal.toNumber()
            const outstanding = Number(invoice.totalAmount) - Number(invoice.paidAmount);

            if (outstanding <= 0) continue; // Skip fully paid ? Should ideally not happen if status is checked

            totalAmount += outstanding;
            itemsToCreate.push({
                invoiceId: invoice.id,
                amount: outstanding
            });
        }

        if (itemsToCreate.length === 0) {
            throw new BadRequestException('No valid unpaid invoices selected');
        }

        // 3. Create Billing Note
        return this.prisma.billingNote.create({
            data: {
                tenantId,
                documentNumber,
                documentDate: new Date(dto.documentDate),
                dueDate: new Date(dto.dueDate),
                customerId: dto.customerId,
                totalAmount,
                notes: dto.notes,
                createdBy: userId,
                status: 'draft',
                items: {
                    createMany: {
                        data: itemsToCreate.map(i => ({
                            tenantId,
                            invoiceId: i.invoiceId,
                            amount: i.amount
                        }))
                    }
                }
            },
            include: {
                customer: true,
                items: {
                    include: {
                        invoice: true
                    }
                }
            }
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.billingNote.findMany({
            where: { tenantId },
            include: {
                customer: true,
                _count: {
                    select: { items: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(tenantId: string, id: string) {
        const billingNote = await this.prisma.billingNote.findFirst({
            where: { id, tenantId },
            include: {
                customer: true,
                items: {
                    include: {
                        invoice: true
                    }
                },
                user: true
            }
        });

        if (!billingNote) throw new NotFoundException('Billing Note not found');
        return billingNote;
    }

    async findUnpaidInvoices(tenantId: string, customerId: string) {
        // Find invoices that are NOT paid and NOT in any active Billing Note (optional: check BN status)
        // For now, let's just show invoices that are not 'paid'.
        // Advanced: Exclude invoices currently in a 'sent'/'draft' active Billing Note.

        const invoices = await this.prisma.invoice.findMany({
            where: {
                tenantId,
                customerId,
                paymentStatus: { not: 'paid' },
                status: { notIn: ['draft', 'voided'] },
                // Check if it is already in a non-voided Billing Note?
                billingNoteItems: {
                    none: {
                        billingNote: {
                            status: { not: 'voided' }
                        }
                    }
                }
            },
            orderBy: { documentDate: 'asc' }
        });

        return invoices.map(inv => ({
            ...inv,
            outstandingAmount: Number(inv.totalAmount) - Number(inv.paidAmount)
        }));
    }
}
