
import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JournalsModule } from '../journals/journals.module';

@Module({
    imports: [PrismaModule, JournalsModule],
    controllers: [BillsController],
    providers: [BillsService],
})
export class BillsModule { }
