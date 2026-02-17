
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('branches')
@UseGuards(JwtAuthGuard)
export class BranchesController {
    constructor(private readonly branchesService: BranchesService) { }

    @Post()
    create(@Request() req: any, @Body() createBranchDto: any) {
        return this.branchesService.create(req.user.tenantId, createBranchDto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.branchesService.findAll(req.user.tenantId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.branchesService.findOne(req.user.tenantId, id);
    }

    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() updateBranchDto: any) {
        return this.branchesService.update(req.user.tenantId, id, updateBranchDto);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.branchesService.remove(req.user.tenantId, id);
    }
}
