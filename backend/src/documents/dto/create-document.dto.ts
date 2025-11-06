import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { DocumentOwnerType } from '../document.entity';

export class CreateDocumentDto {
  @IsIn(['group', 'user', 'trip'])
  ownerType!: DocumentOwnerType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  ownerId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  fileType!: string;

  @IsInt()
  @Min(1)
  fileSize!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  storageKey?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  isEncrypted?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
