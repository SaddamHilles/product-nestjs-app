import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { JWTPayloadType } from 'src/utils/types';
import { Repository } from 'typeorm';
import { MailService } from './../mail/mail.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { User } from './user.entity';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Create new user
   * @param registerDto data for creating new user
   * @returns JWT (access token)
   */
  public async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;
    const userFromDb = await this.usersRepository.findOne({ where: { email } });

    if (userFromDb) {
      throw new BadRequestException('user already exist');
    }

    const hashedPassword = await this.hashPassword(password);

    let newUser = this.usersRepository.create({
      email,
      username,
      password: hashedPassword,
      verificationToken: randomBytes(32).toString('hex'),
    });

    newUser = await this.usersRepository.save(newUser);
    const link = this.generateLink(newUser.id, newUser.verificationToken);

    await this.mailService.sendVerifyEmailTemplate(email, link);

    // const payload: JWTPayloadType = {
    //   id: newUser.id,
    //   userType: newUser.userType,
    // };
    // const accessToken = await this.generateJWT(payload);
    return {
      message:
        'Verification token has been sent to your email, please verify your email account',
    };
  }

  /**
   * Log In user
   * @param loginDto  data for login to user account
   * @returns JWT (access token)
   */
  public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid email or password');
    }

    if (!user.isAccountVerified) {
      let verificationToken = user.verificationToken;
      console.log('verificationToken: ', verificationToken);

      if (!verificationToken) {
        verificationToken = randomBytes(32).toString('hex');
        user.verificationToken = verificationToken; // Assign it to the user
        await this.usersRepository.save(user); // Save the updated user
      }

      const link = this.generateLink(user.id, verificationToken);
      await this.mailService.sendVerifyEmailTemplate(email, link);
      return {
        message:
          'Verification token has been sent to your email, please verify your email account',
      };
    }

    const payload: JWTPayloadType = {
      id: user.id,
      userType: user.userType,
    };
    const accessToken = await this.generateJWT(payload);
    return { email: user.email, username: user.username, accessToken };
  }

  /**
   * Sending reset password link to the client
   */
  public async sendResetPasswordLink(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User with given email does not exist!');
    }

    user.resetPasswordToken = randomBytes(32).toString('hex');
    const result = await this.usersRepository.save(user);

    const resetPasswordLink = `${this.config.get<string>('CLIENT_DOMAIN')}/reset-password/${user.id}/${result.resetPasswordToken}`;

    await this.mailService.sendResetPasswordTemplate(email, resetPasswordLink);

    return {
      message:
        'Password reset link has been sent to your email, please check your inbox',
    };
  }

  /**
   * Get reset password link
   */
  public async getResetPasswordLink(
    userId: number,
    resetPasswordToken: string,
  ) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('Invalid link');
    }

    if (
      user.resetPasswordToken === null ||
      user.resetPasswordToken !== resetPasswordToken
    ) {
      throw new BadRequestException('Invalid link');
    }

    return { message: 'valid link' };
  }

  /**
   * Reset the password
   */
  public async resetPassword(dto: ResetPasswordDto) {
    const { userId, resetPasswordToken, newPassword } = dto;

    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('Invalid link');
    }

    if (
      user.resetPasswordToken === null ||
      user.resetPasswordToken !== resetPasswordToken
    ) {
      throw new BadRequestException('Invalid link');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    await this.usersRepository.save(user);

    return { message: 'Password reset successfully, please log in' };
  }

  /**
   * Hashing password
   * @param password plain text password
   * @returns hashed password
   */
  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Generate JSON Wet Token
   * @param payload JWT payload
   * @returns token
   */
  private async generateJWT(payload: JWTPayloadType): Promise<string> {
    return await this.jwtService.signAsync(payload);
  }

  /**
   * Generate email verification link
   * @returns the Link
   */
  private generateLink(userId: number, verificationToken: string | null) {
    return `${this.config.get<string>('DOMAIN')}/api/users/verify-email/${userId}/${verificationToken}`;
  }
}
