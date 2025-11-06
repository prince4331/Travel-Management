import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { GroupMember } from './group-member.entity';
import { GroupInvite } from './group-invite.entity';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Expense } from '../expenses/expense.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMember, GroupInvite, Expense, User])],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}

