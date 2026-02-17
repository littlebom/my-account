import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { BranchesModule } from './modules/branches/branches.module';
import { CoaModule } from './modules/coa/coa.module';
import { JournalsModule } from './modules/journals/journals.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { BillsModule } from './modules/bills/bills.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { BillingNotesModule } from './modules/billing-notes/billing-notes.module';

@Module({
    imports: [
        // Global configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '../../.env'],
        }),

        // Core modules
        PrismaModule,
        HealthModule,
        AuthModule,
        UsersModule,
        TenantsModule,
        BranchesModule,
        CoaModule,
        JournalsModule,
        ReportsModule,
        ContactsModule,
        InvoicesModule,
        BillsModule,
        PaymentsModule,
        QuotationsModule,
        BillingNotesModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
