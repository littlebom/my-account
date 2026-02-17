
import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Get()
    findAll(@Request() req: any, @Query('type') type: 'customer' | 'vendor') {
        return this.contactsService.findAll(req.user.tenantId, type || 'customer');
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string, @Query('type') type: 'customer' | 'vendor') {
        return this.contactsService.findOne(req.user.tenantId, id, type || 'customer');
    }

    @Post()
    create(@Request() req: any, @Body() body: any) {
        return this.contactsService.create(req.user.tenantId, body);
    }

    @Put(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
        return this.contactsService.update(req.user.tenantId, id, body);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string, @Query('type') type: 'customer' | 'vendor') {
        return this.contactsService.remove(req.user.tenantId, id, type || 'customer');
    }
}
