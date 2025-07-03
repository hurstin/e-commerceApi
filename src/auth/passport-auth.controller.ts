import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportLocalGuard } from './guards/passport-local.guard';
import { ResponseDto } from 'src/user/dto/response.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { Public } from './decorator/public.decorator';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('passAuth')
// @Serialize(ResponseDto)
export class PassAuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Public()
  @Post('register')
  @Serialize(ResponseDto)
  register(@Body() CreateAuthDto: CreateAuthDto) {
    return this.authService.register(CreateAuthDto);
  }

  @Public()
  @Post('login')
  @UseGuards(PassportLocalGuard)
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Patch('updatePassword')
  updatePassword(@Request() req) {
    console.log('req.user', req.user);
    // req.user is the user object returned by the Passport strategy
    return this.authService.updatePassword(req);
  }

  @Public()
  @Get('email')
  sendMail(@Request() req) {
    // This method is used to send an email, you can customize it as needed
    return this.authService.sendMail();
  }

  @Public()
  @Post('forgotPassword')
  forgotPassword(@Request() req, @Body('email') email: string) {
    return this.authService.forgotPassword(email, req);
  }

  @Public()
  @Patch('resetPassword/:token')
  resetPassword(@Param('token') token: string, @Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(token, body);
  }
}
