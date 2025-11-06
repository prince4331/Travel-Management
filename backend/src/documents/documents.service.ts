
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { Group } from '../groups/group.entity';
import { User } from '../users/user.entity';
import { DocumentStorageService } from './document-storage.service';

export interface DocumentResponse {
  id: number;
  ownerType: string;
  ownerId: string;
  title: string;
  description?: string | null;
  fileType: string;
  fileSize: number;
  storageKey: string;
  expiresAt?: string | null;
  isEncrypted: boolean;
  metadata?: Record<string, any> | null;
  createdAt: string;
  createdBy: {
    id: number;
    email: string;
  };
  groupId?: number | null;
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document) private readonly documentRepo: Repository<Document>,
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly storage: DocumentStorageService,
  ) {}

  async createDocument(dto: CreateDocumentDto, creatorId: number): Promise<DocumentResponse> {
    const creator = await this.userRepo.findOne({ where: { id: creatorId } });
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    let group: Group | null = null;
    if (dto.ownerType === 'group') {
      const groupId = Number(dto.ownerId);
      if (Number.isNaN(groupId)) {
        throw new BadRequestException('Group ownerId must be a numeric string');
      }
      group = await this.groupRepo.findOne({ where: { id: groupId } });
      if (!group) {
        throw new NotFoundException('Group not found');
      }
    }

    const storageKey = dto.storageKey ?? this.storage.generateStorageKey(dto.ownerType, dto.ownerId, dto.title);

    const document = this.documentRepo.create({
      ownerType: dto.ownerType,
      ownerId: dto.ownerId,
      title: dto.title,
      description: dto.description ?? null,
      fileType: dto.fileType,
      fileSize: dto.fileSize,
      storageKey,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      isEncrypted: dto.isEncrypted ?? false,
      metadata: this.storage.buildMetadata(dto.metadata ?? undefined),
      createdBy: creator,
      group: group ?? null,
    });

    await this.documentRepo.save(document);
    return this.toResponse(document);
  }

  async getDocument(documentId: number): Promise<DocumentResponse> {
    const document = await this.documentRepo.findOne({
      where: { id: documentId },
      relations: ['createdBy', 'group'],
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return this.toResponse(document);
  }

  private toResponse(document: Document): DocumentResponse {
    return {
      id: document.id,
      ownerType: document.ownerType,
      ownerId: document.ownerId,
      title: document.title,
      description: document.description ?? null,
      fileType: document.fileType,
      fileSize: document.fileSize,
      storageKey: document.storageKey,
      expiresAt: document.expiresAt?.toISOString() ?? null,
      isEncrypted: document.isEncrypted,
      metadata: document.metadata ?? null,
      createdAt: document.createdAt.toISOString(),
      createdBy: {
        id: document.createdBy.id,
        email: document.createdBy.email,
      },
      groupId: document.group?.id ?? null,
    };
  }
}
