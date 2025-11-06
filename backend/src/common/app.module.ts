import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { AppDataSource } from '../data-source';
import { AuthModule } from '../auth/auth.module';
import { GroupsModule } from '../groups/groups.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options as DataSourceOptions),
    AuthModule,
    GroupsModule,
    ExpensesModule,
    DocumentsModule,
  ],
})
export class AppModule {}
