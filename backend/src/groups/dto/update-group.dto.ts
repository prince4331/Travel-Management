import { IsOptional, IsString, IsBoolean, IsDateString, IsArray } from 'class-validator';

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  guides?: string[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  tourType?: 'friendly' | 'paid';

  @IsOptional()
  @IsBoolean()
  showFinancialDetailsToMembers?: boolean;
}
