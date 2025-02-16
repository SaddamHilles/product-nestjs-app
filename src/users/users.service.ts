import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { UserType } from 'src/utils/enums';
import { JWTPayloadType } from 'src/utils/types';
import { Repository } from 'typeorm';
import { AuthProvider } from './auth.provider';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly authProvider: AuthProvider,
  ) {}

  /**
   * Create new user
   * @param registerDto data for creating new user
   * @returns JWT (access token)
   */
  public async register(registerDto: RegisterDto) {
    return this.authProvider.register(registerDto);
  }

  /**
   * Log In user
   * @param loginDto  data for login to user account
   * @returns JWT (access token)
   */
  public async login(loginDto: LoginDto) {
    return this.authProvider.login(loginDto);
  }

  /**
   * Get current user (logged in user)
   * @param id of the logged in user
   * @returns the user from the db
   */
  public async getCurrentUser(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  /**
   * Get all users from the db
   * @returns  collection of users
   */
  public getAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  /**
   * Update User
   * @param id id of the logged in user
   * @param updateUserDto data for updating the user
   * @returns updated user from the db
   */
  public async update(id: number, updateUserDto: UpdateUserDto) {
    const { username, password } = updateUserDto;
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    user.username = username ?? user.username;
    if (password) {
      user.password = await this.authProvider.hashPassword(password);
    }

    return this.usersRepository.save(user);
  }

  /**
   * Delete User
   * @param userId id of the user
   * @param payload JWTPayload
   * @returns a success message
   */
  public async delete(userId: number, payload: JWTPayloadType) {
    const user = await this.getCurrentUser(userId);

    if (user.id === payload.id || payload.userType === UserType.ADMIN) {
      await this.usersRepository.remove(user);
      return { message: 'User has been deleted successfully' };
    }

    throw new ForbiddenException(
      'Access denied, You are not allowed to implement this action',
    );
  }

  /**
   * Set Profile image
   * @param userId id of the logged in user
   * @param newProfileImage profile image
   * @returns the user from the db
   */
  public async setProfileImage(userId: number, newProfileImage: string) {
    const user = await this.getCurrentUser(userId);
    if (!user.profileImage) {
      user.profileImage = newProfileImage;
    } else {
      await this.removeProfileImage(userId);
      user.profileImage = newProfileImage;
    }
    return this.usersRepository.save(user);
  }

  /**
   * Remove profile image
   * @param userId id od the logged in user
   * @returns the user from the db without profile image
   */
  public async removeProfileImage(userId: number) {
    const user = await this.getCurrentUser(userId);
    if (!user.profileImage) {
      throw new BadRequestException('There is not profile image');
    }
    const imagePath = join(process.cwd(), `images/users/${user.profileImage}`);
    unlinkSync(imagePath);
    user.profileImage = null;
    return this.usersRepository.save(user);
  }

  /**
   * Verify Email
   * @param userId if of the user from the link
   * @param verificationToken verification token from the link
   * @returns success message
   */
  public async verifyEmail(userId: number, verificationToken: string) {
    const user = await this.getCurrentUser(userId);
    if (!user.verificationToken) {
      throw new NotFoundException('There is no verification token.');
    }

    if (user.verificationToken !== verificationToken) {
      throw new BadRequestException('Invalid link');
    }

    user.isAccountVerified = true;
    user.verificationToken = null;
    await this.usersRepository.save(user);
    return {
      message: 'Your email has been verified, please log in to your account',
    };
  }
}
