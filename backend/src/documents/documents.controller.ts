import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload/document')
  @UseGuards(RolesGuard)
  @Roles('admin', 'co-admin', 'member', 'super_admin')
  async uploadDocument(@Body() dto: CreateDocumentDto, @Req() req: any) {
    return this.documentsService.createDocument(dto, req.user.id);
  }

  @Post('documents')
  @UseGuards(RolesGuard)
  @Roles('admin', 'co-admin', 'member', 'super_admin')
  async createDocument(@Body() dto: CreateDocumentDto, @Req() req: any) {
    return this.documentsService.createDocument(dto, req.user.id);
  }

  @Get('documents/:id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'co-admin', 'member', 'super_admin')
  async getDocument(@Param('id', ParseIntPipe) documentId: number) {
    return this.documentsService.getDocument(documentId);
  }
}

