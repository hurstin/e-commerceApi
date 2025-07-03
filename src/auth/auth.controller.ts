import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { ResponseDto } from 'src/user/dto/response.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
@Serialize(ResponseDto)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  // @Post('auth/login')
  // async login(@Request() req) {
  //   return req.user;
  // }

  // @Post('login')
  // @HttpCode(200)
  // login(@Body() loginDto: LoginDto) {
  //   return this.authService.login(loginDto);
  // }
}
