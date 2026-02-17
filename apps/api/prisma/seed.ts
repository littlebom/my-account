import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // 1. Create Default Tenant
    const tenantCode = 'DEMO001';
    let tenant = await prisma.tenant.findUnique({
        where: { code: tenantCode },
    });

    if (!tenant) {
        console.log('Creating default tenant...');
        tenant = await prisma.tenant.create({
            data: {
                code: tenantCode,
                name: 'Demo Company Limited',
                taxId: '1234567890123',
                address: '123 Sukhumvit Road, Watthana, Bangkok 10110',
                phone: '02-123-4567',
                email: 'info@demo.com',
                fiscalYearStart: 1, // January
                baseCurrency: 'THB',
                plan: 'premium',
                status: 'active',
            },
        });
        console.log(`Created tenant: ${tenant.name}`);
    } else {
        console.log(`Tenant already exists: ${tenant.name}`);
    }

    // 2. Create Admin User
    const adminEmail = 'admin@demo.com';
    const existingUser = await prisma.user.findFirst({
        where: {
            email: adminEmail,
            tenantId: tenant.id,
        },
    });

    if (!existingUser) {
        console.log('Creating admin user...');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);

        const user = await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                firstName: 'System',
                lastName: 'Admin',
                role: 'admin',
                status: 'active',
                tenantId: tenant.id,
            },
        });
        console.log(`Created admin user: ${user.email}`);
    } else {
        console.log(`Admin user already exists: ${existingUser.email}`);
    }

    // 3. Create Basic Chart of Accounts (Thai Standard)
    console.log('Seeding Chart of Accounts...');

    const coaData = [
        // Assets (1)
        { code: '10000', name: 'ASSETS', type: 'asset', level: 1, isHeader: true, normalBalance: 'debit' },
        { code: '11000', name: 'Current Assets', type: 'asset', level: 2, isHeader: true, parentCode: '10000', normalBalance: 'debit' },
        { code: '11100', name: 'Cash and Cash Equivalents', type: 'asset', level: 3, isHeader: true, parentCode: '11000', normalBalance: 'debit' },
        { code: '11110', name: 'Petty Cash', type: 'asset', level: 4, isHeader: false, parentCode: '11100', normalBalance: 'debit' },
        { code: '11120', name: 'Cash at Bank - Savings', type: 'asset', level: 4, isHeader: false, parentCode: '11100', normalBalance: 'debit' },
        { code: '11200', name: 'Accounts Receivable', type: 'asset', level: 3, isHeader: true, parentCode: '11000', normalBalance: 'debit' },
        { code: '11210', name: 'Trade Accounts Receivable', type: 'asset', level: 4, isHeader: false, parentCode: '11200', normalBalance: 'debit' },

        // Liabilities (2)
        { code: '20000', name: 'LIABILITIES', type: 'liability', level: 1, isHeader: true, normalBalance: 'credit' },
        { code: '21000', name: 'Current Liabilities', type: 'liability', level: 2, isHeader: true, parentCode: '20000', normalBalance: 'credit' },
        { code: '21100', name: 'Accounts Payable', type: 'liability', level: 3, isHeader: true, parentCode: '21000', normalBalance: 'credit' },
        { code: '21110', name: 'Trade Accounts Payable', type: 'liability', level: 4, isHeader: false, parentCode: '21100', normalBalance: 'credit' },
        { code: '21200', name: 'Tax Payable', type: 'liability', level: 3, isHeader: true, parentCode: '21000', normalBalance: 'credit' },
        { code: '21210', name: 'VAT Payable', type: 'liability', level: 4, isHeader: false, parentCode: '21200', normalBalance: 'credit' },

        // Equity (3)
        { code: '30000', name: 'SHAREHOLDERS\' EQUITY', type: 'equity', level: 1, isHeader: true, normalBalance: 'credit' },
        { code: '31000', name: 'Share Capital', type: 'equity', level: 2, isHeader: true, parentCode: '30000', normalBalance: 'credit' },
        { code: '31100', name: 'Ordinary Shares', type: 'equity', level: 3, isHeader: false, parentCode: '31000', normalBalance: 'credit' },
        { code: '32000', name: 'Retained Earnings', type: 'equity', level: 2, isHeader: true, parentCode: '30000', normalBalance: 'credit' },
        { code: '32100', name: 'Retained Earnings - Unappropriated', type: 'equity', level: 3, isHeader: false, parentCode: '32000', normalBalance: 'credit' },

        // Revenue (4)
        { code: '40000', name: 'REVENUE', type: 'revenue', level: 1, isHeader: true, normalBalance: 'credit' },
        { code: '41000', name: 'Sales Revenue', type: 'revenue', level: 2, isHeader: true, parentCode: '40000', normalBalance: 'credit' },
        { code: '41100', name: 'Sales - Product A', type: 'revenue', level: 3, isHeader: false, parentCode: '41000', normalBalance: 'credit' },
        { code: '41200', name: 'Service Revenue', type: 'revenue', level: 3, isHeader: false, parentCode: '41000', normalBalance: 'credit' },

        // Expenses (5)
        { code: '50000', name: 'EXPENSES', type: 'expense', level: 1, isHeader: true, normalBalance: 'debit' },
        { code: '51000', name: 'Cost of Sales', type: 'expense', level: 2, isHeader: true, parentCode: '50000', normalBalance: 'debit' },
        { code: '51100', name: 'Cost of Goods Sold', type: 'expense', level: 3, isHeader: false, parentCode: '51000', normalBalance: 'debit' },
        { code: '52000', name: 'Operating Expenses', type: 'expense', level: 2, isHeader: true, parentCode: '50000', normalBalance: 'debit' },
        { code: '52100', name: 'Salary Expense', type: 'expense', level: 3, isHeader: false, parentCode: '52000', normalBalance: 'debit' },
        { code: '52200', name: 'Rent Expense', type: 'expense', level: 3, isHeader: false, parentCode: '52000', normalBalance: 'debit' },
    ];

    for (const acc of coaData) {
        const existing = await prisma.chartOfAccount.findUnique({
            where: {
                tenantId_accountCode: {
                    tenantId: tenant.id,
                    accountCode: acc.code,
                },
            },
        });

        if (!existing) {
            // Find parent ID if parentCode exists
            let parentId = null;
            if (acc.parentCode) {
                const parent = await prisma.chartOfAccount.findUnique({
                    where: {
                        tenantId_accountCode: {
                            tenantId: tenant.id,
                            accountCode: acc.parentCode,
                        },
                    },
                });
                if (parent) parentId = parent.id;
            }

            await prisma.chartOfAccount.create({
                data: {
                    tenantId: tenant.id,
                    accountCode: acc.code,
                    accountName: acc.name,
                    accountType: acc.type,
                    level: acc.level,
                    isHeader: acc.isHeader,
                    isActive: true,
                    normalBalance: acc.normalBalance,
                    parentId: parentId,
                },
            });
            console.log(`Created account: ${acc.code} - ${acc.name}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
