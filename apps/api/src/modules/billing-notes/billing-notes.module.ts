import { Module } from '@nestjs/common';
import { BillingNotesController } from './billing-notes.controller';
import { BillingNotesService } from './billing-notes.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [BillingNotesController],
    providers: [BillingNotesService],
})
export class BillingNotesModule { }
