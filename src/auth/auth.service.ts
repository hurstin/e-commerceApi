import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

import { ValidateDto } from './dto/validate.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { generateResetToken } from 'src/utils/tokens.util';
import { ResetPasswordDto } from './dto/reset-password.dto';

// type userType = {
//   id: number;
//   email: string;
//   password: string;
// };

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  sendMail() {
    const message = `Forgot your password? If you didn't forget your password, please ignore this email!`;

    this.mailerService.sendMail({
      from: 'Kingsley Okure <kingsleyokgeorge@gmail.com>',
      to: 'joanna@gmail.com',
      subject: `How to Send Emails with Nodemailer`,
      text: message,
    });

    return {
      message,
      status: 'success',
    };
  }

  async register(createAuthDto: CreateAuthDto) {
    // check if email eixst in db
    if (await this.userService.findOne(createAuthDto.email))
      throw new BadRequestException('email exists already');

    //  create user and save to DB
    const user = await this.userService.create(createAuthDto);

    return user;
  }

  async validateUser(input: ValidateDto) {
    // query user from db
    const user = await this.userService.findOne(input.email);

    // check if user existed
    if (!user) throw new UnauthorizedException('incorrect credentials');

    // check if password is correct
    const isMatch = await bcrypt.compare(input.password, user.password);

    if (!isMatch) throw new UnauthorizedException('incorrect credentials');

    // return user data
    // Note: In a real application, you would typically return a JWT token here
    // or some session information instead of the user object.
    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),

      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  async updatePassword(req: any) {
    // query user from db with password
    const currentUser = await this.userService.findWithPassword(req.user);

    // check if user Existed
    if (!currentUser) throw new BadRequestException('user not found');

    // check if newpassword and passwordconfirm match
    if (req.body.newPassword !== req.body.passwordConfirm)
      throw new BadRequestException('password confirm does not match');

    // check if old password and new password are the same
    if (req.body.currentPassword === req.body.newPassword)
      throw new BadRequestException(
        'new password cannot be the same as current password',
      );

    // check if password is correct
    const isMatch = await bcrypt.compare(
      req.body.currentPassword,
      currentUser.password,
    );

    if (!isMatch) throw new BadRequestException('incorrect password');

    // update password
    const updatedUser = await this.userService.updatePassword(
      currentUser.email,
      req.body.newPassword,
    );

    return updatedUser;
  }

  async forgotPassword(email: string, req: any) {
    // check if email is provided
    if (!email) throw new BadRequestException('please provide email');

    // check if user exists
    const user = await this.userService.findOne(email);

    if (!user) throw new BadRequestException('user not found');

    // generate a reset token
    const resetToken = generateResetToken();

    // hash the token and set expiration time before saving to db
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

    // save the hashed token and expiration time to the user record
    await this.userService.updateResetToken(email, hashedToken, expires);
    // send the token to the user's email
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/resetPassword/${resetToken}`;

    const message = `forgot your password? send a PATCH request with your new password and password confrim to :${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await this.mailerService.sendMail({
        from: 'e-commerceApi <',
        to: user.email,
        subject: 'Reset password(expires in 10 minutes)',
        text: message,
      });
    } catch (error) {
      this.userService.updateResetToken(email, null, null); // clear the token if email fails to send
      throw new BadRequestException('error sending email,please try again');
    }
    return {
      message: 'Reset token sent to email',
      status: 'success',
      hashedToken,
    };
  }

  async resetPassword(token: string, body: ResetPasswordDto) {
    const { password, passwordConfirm } = body;
    // check if token is provided
    // hash the token to compare with the one in the db
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // find user based on token
    const user = await this.userService.findByResetToken(hashedToken);

    // check if user exists and token is not expired
    if (!user) throw new BadRequestException('invalid or expired reset token');

    // set new password
    if (password !== passwordConfirm)
      throw new BadRequestException('password confirm does not match');

    // update user password
    const updatedUser = await this.userService.updatePassword(
      user.email,
      password,
    );

    return {
      user: updatedUser.email,
      message: 'password reset successfully, login in again',
      status: 'success',
    };
  }
}

// async login(input: ValidateDto) {
//     // query user from db
//     const user = await this.userService.findOne(input.email);

//     //check if user existed and password is correct
//     if (!user) throw new UnauthorizedException('incorrect credentials');

//     const isMatch = await bcrypt.compare(input.password, user.password);

//     if (!isMatch) throw new UnauthorizedException('incorrect credentials');
//     // login in user
//     return user;
//   }
