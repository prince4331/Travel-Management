import { Body, Controller, Get, Param, ParseIntPipe, Post, Patch, Delete, Req, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreatePersonalExpenseDto } from './dto/create-personal-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('groups/:groupId')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post('expenses')
  @UseGuards(RolesGuard)
  @Roles('admin', 'co-admin', 'member', 'super_admin')
  async createExpense(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateExpenseDto,
    @Req() req: any,
  ) {
    return this.expensesService.addExpense(groupId, dto, req.user.id);
  }

  @Get('balance')
  @UseGuards(RolesGuard)
  @Roles('admin', 'co-admin', 'member', 'super_admin')
  async getBalance(@Param('groupId', ParseIntPipe) groupId: number, @Req() req: any) {
    return this.expensesService.getGroupBalance(groupId, req.user.id);
  }

  @Get('expenses')
  @UseGuards(RolesGuard)
  @Roles('admin', 'co-admin', 'member', 'super_admin')
  async listExpenses(@Param('groupId', ParseIntPipe) groupId: number, @Req() req: any) {
    return this.expensesService.listGroupExpenses(groupId, req.user.id);
  }

  @Patch('expenses/:expenseId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'co-admin', 'super_admin')
  async updateExpense(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @Body() dto: UpdateExpenseDto,
    @Req() req: any,
  ) {
    return this.expensesService.updateExpense(groupId, expenseId, dto, req.user.id);
  }

  @Delete('expenses/:expenseId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'co-admin', 'super_admin')
  async deleteExpense(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @Req() req: any,
  ) {
    return this.expensesService.deleteExpense(groupId, expenseId, req.user.id);
  }
}

// Personal Expenses Controller
@Controller('expenses/personal')
@UseGuards(JwtAuthGuard)
export class PersonalExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'co-admin', 'member', 'super_admin')
  async createPersonalExpense(@Body() dto: CreatePersonalExpenseDto, @Req() req: any) {
    return this.expensesService.createPersonalExpense(req.user.id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'co-admin', 'member', 'super_admin')
  async getPersonalExpenses(@Req() req: any) {
    return this.expensesService.getUserPersonalExpenses(req.user.id);
  }

  @Delete(':expenseId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'co-admin', 'member', 'super_admin')
  async deletePersonalExpense(@Param('expenseId', ParseIntPipe) expenseId: number, @Req() req: any) {
    return this.expensesService.deletePersonalExpense(req.user.id, expenseId);
  }
}
