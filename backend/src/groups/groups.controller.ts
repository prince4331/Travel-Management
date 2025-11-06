import { Body, Controller, Get, Param, ParseIntPipe, Post, Patch, Delete, Req, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateInviteDto } from './dto/create-invite.dto';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async list(@Req() req: any) {
    return this.groupsService.listGroupsForUser(req.user.id);
  }

  @Post()
  async create(@Body() dto: CreateGroupDto, @Req() req: any) {
    return this.groupsService.createGroup(dto, req.user.id);
  }

  @Get(':id')
  async getGroup(@Param('id', ParseIntPipe) groupId: number, @Req() req: any) {
    return this.groupsService.getGroupById(groupId, req.user.id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'co-admin', 'super_admin')
  async updateGroup(
    @Param('id', ParseIntPipe) groupId: number,
    @Body() dto: UpdateGroupDto,
    @Req() req: any,
  ) {
    return this.groupsService.updateGroup(groupId, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  async deleteGroup(@Param('id', ParseIntPipe) groupId: number, @Req() req: any) {
    return this.groupsService.deleteGroup(groupId, req.user.id);
  }

  @Get(':id/members')
  async members(@Param('id', ParseIntPipe) groupId: number, @Req() req: any) {
    return this.groupsService.listMembers(groupId, req.user.id);
  }

  @Post(':id/invite')
  @UseGuards(RolesGuard)
  @Roles('admin', 'co-admin', 'super_admin')
  async createInvite(
    @Param('id', ParseIntPipe) groupId: number,
    @Body() dto: CreateInviteDto,
    @Req() req: any,
  ) {
    return this.groupsService.createInvite(groupId, dto, req.user.id);
  }

  @Post(':id/members')
  async addMember(
    @Param('id', ParseIntPipe) groupId: number,
    @Body() dto: CreateGroupMemberDto,
    @Req() req: any,
  ) {
    console.log('=== ADD MEMBER REQUEST ===');
    console.log('Group ID:', groupId);
    console.log('Requester ID:', req.user?.id);
    console.log('DTO:', dto);
    
    try {
      const result = await this.groupsService.addMemberDirectly(groupId, dto, req.user.id);
      console.log('✅ Member added successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ ADD MEMBER ERROR:', error);
      throw error;
    }
  }

  @Delete(':id/members/:memberId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'co-admin', 'super_admin')
  async removeMember(
    @Param('id', ParseIntPipe) groupId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Req() req: any,
  ) {
    return this.groupsService.removeMember(groupId, memberId, req.user.id);
  }

  @Patch(':id/members/:memberId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  async updateMemberRole(
    @Param('id', ParseIntPipe) groupId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: { role: string },
    @Req() req: any,
  ) {
    return this.groupsService.updateMemberRole(groupId, memberId, dto.role, req.user.id);
  }
}
