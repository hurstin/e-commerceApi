import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseDto } from './dto/response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // hash password

    const salt = await bcrypt.genSalt();

    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create(createUserDto);

    Object.assign(user, { ...CreateUserDto, password: hashedPassword });

    const savedUser = await this.usersRepository.save(user);

    return savedUser;

    // return new ResponseDto({
    //   id: savedUser.id,
    //   name: savedUser.name,
    //   email: savedUser.email,
    //   password: savedUser.password,
    // });
  }

  async showCurrentUser(email: string): Promise<User | null> {
    // Use findOneBy() for single result

    const user = await this.usersRepository.findOneBy({ email });

    if (!user) throw new BadRequestException('user not found');
    return user;
  }

  async findOne(email: string): Promise<User | null> {
    // Use findOneBy() for single result

    const user = await this.usersRepository.findOneBy({ email });

    return user;
  }

  findWithPassword(updateUserDto: UpdateUserDto) {
    return this.usersRepository.findOne({
      where: { email: updateUserDto.email },
      select: ['id', 'name', 'email', 'password'], // Include password
    });
  }

  async updatePassword(email: string, password: string) {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const salt = await bcrypt.genSalt();

    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    // Update user password
    const updatedUser = await this.usersRepository.save({
      ...user,
      password: hashedPassword,
      passwordResetExpires: null,
      passwordResetToken: null,
      // passwordChangedAt: new Date(),
    });

    // Return user without password
    const { password: _password, ...result } = updatedUser;
    return result as User;
  }

  async updateProfile(userId: number, updateDto: UpdateUserDto) {
    //  get user by id from db
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new BadRequestException('User not found please login');

    // 2. Check if email is being updated
    if (updateDto.email && updateDto.email !== user.email) {
      // 3. Verify new email is available
      const emailExists = await this.usersRepository.findOne({
        where: { email: updateDto.email },
        select: ['id'], // Only get ID for existence check
      });

      if (emailExists) {
        throw new ConflictException('Email already in use by another account');
      }
    }

    // update user with new data
    Object.assign(user, updateDto);

    // save user to db
    const updatedUser = await this.usersRepository.save(user);

    // return user without password
    return updatedUser;
  }

  async updateResetToken(
    email: string,
    resetToken: string | null,
    expires: Date | null,
  ) {
    // Find the user by email
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Update the user's reset token and expiration
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = expires;

    // Save the updated user
    return this.usersRepository.save(user);
  }

  async findByResetToken(resetToken: string) {
    // get user by resetToken and check if token is not expired
    const user = await this.usersRepository.findOneBy({
      passwordResetToken: resetToken,
      passwordResetExpires: MoreThan(new Date()), //ensure token is not expired
    });
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    return user;
  }

  async deleteProfile(userId: number) {
    // get user by id from db
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) throw new BadRequestException('User not found please login');

    // delete user from db
    await this.usersRepository.delete(userId);

    return {
      messsage: 'user deleted successfully',
      user: user.email,
    };
  }
}
