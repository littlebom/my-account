
import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JournalsModule } from '../journals/journals.module';

@Module({
    imports: [PrismaModule, JournalsModule],
    controllers: [InvoicesController],
    providers: [InvoicesService],
})
export class InvoicesModule { }
