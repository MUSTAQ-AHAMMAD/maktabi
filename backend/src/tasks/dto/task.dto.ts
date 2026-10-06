import { IsDateString, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum TaskStatusDto {
  TODO = 'TODO', IN_PROGRESS = 'IN_PROGRESS', IN_REVIEW = 'IN_REVIEW', DONE = 'DONE', CANCELLED = 'CANCELLED',
}
export enum TaskPriorityDto {
  LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH', URGENT = 'URGENT',
}

export class CreateTaskDto {
  @IsString() @MinLength(2) @MaxLength(200)
  title!: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsEnum(TaskStatusDto)
  status?: TaskStatusDto;

  @IsOptional() @IsEnum(TaskPriorityDto)
  priority?: TaskPriorityDto;

  @IsOptional() @IsDateString()
  dueDate?: string;

  @IsOptional() @IsString()
  assigneeId?: string;

  @IsOptional() @IsString()
  contactId?: string;

  @IsOptional() @IsString()
  relatedType?: string;

  @IsOptional() @IsString()
  relatedId?: string;

  @IsOptional() @IsString()
  brandId?: string;
}

export class UpdateTaskDto extends CreateTaskDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(200)
  declare title: string;
}

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatusDto)
  status!: TaskStatusDto;
}
