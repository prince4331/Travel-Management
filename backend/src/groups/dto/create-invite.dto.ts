import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateInviteDto {
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;
}

