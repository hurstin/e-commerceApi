import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ValidateDto extends PartialType(CreateAuthDto) {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}
