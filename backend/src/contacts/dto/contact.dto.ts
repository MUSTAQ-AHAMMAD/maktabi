import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum ContactTypeDto {
  CLIENT = 'CLIENT',
  COUNTERPARTY = 'COUNTERPARTY',
  VENDOR = 'VENDOR',
  COURT = 'COURT',
  EXPERT = 'EXPERT',
  OTHER = 'OTHER',
}

export class CreateContactDto {
  @IsString() @MinLength(2) @MaxLength(160)
  name!: string;

  @IsOptional() @IsEnum(ContactTypeDto)
  type?: ContactTypeDto;

  @IsOptional() @IsString() @MaxLength(160)
  company?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString() @MaxLength(40)
  phone?: string;

  @IsOptional() @IsString() @MaxLength(300)
  address?: string;

  @IsOptional() @IsString() @MaxLength(80)
  city?: string;

  @IsOptional() @IsString() @MaxLength(80)
  country?: string;

  @IsOptional() @IsString() @MaxLength(60)
  nationalId?: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsString()
  brandId?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class UpdateContactDto extends CreateContactDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(160)
  declare name: string;
}
