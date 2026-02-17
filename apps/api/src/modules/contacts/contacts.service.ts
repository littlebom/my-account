
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
    constructor(private prisma: PrismaService) { }

    async findAll(tenantId: string, type: 'customer' | 'vendor') {
        if (type === 'customer') {
            return this.prisma.customer.findMany({
                where: { tenantId, isActive: true },
                orderBy: { code: 'asc' },
            });
        } else if (type === 'vendor') {
            return this.prisma.vendor.findMany({
                where: { tenantId, isActive: true },
                orderBy: { code: 'asc' },
            });
        }
        throw new BadRequestException('Invalid contact type');
    }

    async findOne(tenantId: string, id: string, type: 'customer' | 'vendor') {
        if (type === 'customer') {
            return this.prisma.customer.findUnique({
                where: { id, tenantId },
            });
        } else if (type === 'vendor') {
            return this.prisma.vendor.findUnique({
                where: { id, tenantId },
            });
        }
        throw new BadRequestException('Invalid contact type');
    }

    async create(tenantId: string, data: any) {
        if (!tenantId) {
            throw new BadRequestException('Tenant ID is missing');
        }

        const { type, ...rest } = data;
        const code = rest.code || `${type === 'customer' ? 'C' : 'V'}-${Date.now()}`;

        if (type === 'customer') {
            return this.prisma.customer.create({
                data: {
                    tenantId,
                    code,
                    name: rest.name,
                    taxId: rest.taxId,
                    address: rest.address,
                    phone: rest.phone,
                    email: rest.email,
                    contactPerson: rest.contactPerson,
                    creditTerm: rest.creditTerm ? Number(rest.creditTerm) : 30
                },
            });
        } else if (type === 'vendor') {
            const term = rest.paymentTerm !== undefined ? rest.paymentTerm : rest.creditTerm;
            return this.prisma.vendor.create({
                data: {
                    tenantId,
                    code,
                    name: rest.name,
                    taxId: rest.taxId,
                    address: rest.address,
                    phone: rest.phone,
                    email: rest.email,
                    contactPerson: rest.contactPerson,
                    paymentTerm: term ? Number(term) : 30
                },
            });
        }
        throw new BadRequestException('Invalid contact type');
    }

    async update(tenantId: string, id: string, data: any) {
        const { type, ...rest } = data;
        if (type === 'customer') {
            return this.prisma.customer.update({
                where: { id, tenantId },
                data: {
                    name: rest.name,
                    taxId: rest.taxId,
                    address: rest.address,
                    phone: rest.phone,
                    email: rest.email,
                    contactPerson: rest.contactPerson,
                    creditTerm: rest.creditTerm ? Number(rest.creditTerm) : undefined
                },
            });
        } else if (type === 'vendor') {
            const term = rest.paymentTerm !== undefined ? rest.paymentTerm : rest.creditTerm;
            return this.prisma.vendor.update({
                where: { id, tenantId },
                data: {
                    name: rest.name,
                    taxId: rest.taxId,
                    address: rest.address,
                    phone: rest.phone,
                    email: rest.email,
                    contactPerson: rest.contactPerson,
                    paymentTerm: term ? Number(term) : undefined
                },
            });
        }
    }

    async remove(tenantId: string, id: string, type: 'customer' | 'vendor') {
        if (type === 'customer') {
            return this.prisma.customer.update({
                where: { id, tenantId },
                data: { isActive: false },
            });
        } else if (type === 'vendor') {
            return this.prisma.vendor.update({
                where: { id, tenantId },
                data: { isActive: false },
            });
        }
    }
}
