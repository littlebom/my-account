
import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JournalsService } from './journals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('journals')
@UseGuards(JwtAuthGuard)
export class JournalsController {
    constructor(private readonly journalsService: JournalsService) { }

    @Post()
    create(@Request() req: any, @Body() createJournalDto: any) {
        return this.journalsService.create(req.user.tenantId, req.user.userId, createJournalDto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.journalsService.findAll(req.user.tenantId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.journalsService.findOne(req.user.tenantId, id);
    }
}
