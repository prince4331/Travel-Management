import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Group } from '../groups/group.entity';
import { User } from '../users/user.entity';
import { DocumentStorageService } from './document-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Group, User])],
  providers: [DocumentsService, DocumentStorageService],
  controllers: [DocumentsController],
  exports: [DocumentsService, DocumentStorageService],
})
export class DocumentsModule {}
