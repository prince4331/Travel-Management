import { IsString, IsNumber, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreatePersonalExpenseDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsIn(['accommodation', 'transport', 'food', 'activities', 'gear', 'other'])
  category!: 'accommodation' | 'transport' | 'food' | 'activities' | 'gear' | 'other';

  @IsString()
  currency!: string;

  @IsNumber()
  amount!: number;

  @IsDateString()
  incurredOn!: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}
