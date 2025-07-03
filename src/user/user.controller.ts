import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { ResponseDto } from './dto/response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('user')
@Serialize(ResponseDto)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return this.userService.showCurrentUser(req.user.email);
  }

  @Patch('me/update')
  @UseGuards(JwtAuthGuard)
  updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const { userId } = req.user;
    return this.userService.updateProfile(userId, updateUserDto);
  }

  @Delete('deleteMe')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  deleteMe(@Request() req) {
    const { userId } = req.user;
    return this.userService.deleteProfile(userId);
  }
}

// @Post()
// create(@Body() createUserDto: CreateUserDto) {
//   return this.userService.create(createUserDto);
// }

// @Get()
// findAll() {
//   return this.userService.findAll();
// }

// @Get(':id')
// findOne(@Param('id') id: string) {
//   return this.userService.findOne(id);
// }

// @Patch(':id')
// update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
//   return this.userService.update(+id, updateUserDto);
// }

// @Delete(':id')
// remove(@Param('id') id: string) {
//   return this.userService.remove(+id);
// }
