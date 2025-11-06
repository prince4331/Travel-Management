import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExpenseSplitDto {
  @IsInt()
  @Min(1)
  memberId!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;
}

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsIn(['accommodation', 'transport', 'food', 'activities', 'gear', 'other'])
  category!: string;

  @IsOptional()
  @IsString()
  @IsIn(['personal', 'group'])
  expenseType?: 'personal' | 'group';

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @IsDateString()
  incurredOn!: string;

  @IsInt()
  @Min(1)
  paidById!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExpenseSplitDto)
  splits!: ExpenseSplitDto[];
}

