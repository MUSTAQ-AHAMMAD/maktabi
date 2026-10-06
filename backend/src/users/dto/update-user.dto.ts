import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @IsEmail({}, { message: 'Email must be valid' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  firstName?: string;

  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  lastName?: string;

  @IsEnum(Role, { message: 'Invalid role' })
  @IsOptional()
  role?: Role;

  @IsString({ message: 'Department must be a string' })
  @IsOptional()
  department?: string;
}
