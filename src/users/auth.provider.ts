import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { AccessTokenType, JWTPayloadType } from 'src/utils/types';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Create new user
   * @param registerDto data for creating new user
   * @returns JWT (access token)
   */
  public async register(registerDto: RegisterDto): Promise<AccessTokenType> {
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
    });

    newUser = await this.usersRepository.save(newUser);
    // @TODO -> generate JWT Token

    const payload: JWTPayloadType = {
      id: newUser.id,
      userType: newUser.userType,
    };
    const accessToken = await this.generateJWT(payload);
    return { email: newUser.email, username: newUser.username, accessToken };
  }

  /**
   * Log In user
   * @param loginDto  data for login to user account
   * @returns JWT (access token)
   */
  public async login(loginDto: LoginDto): Promise<AccessTokenType> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid email or password');
    }

    // @TODO -> generate JWT Token

    const payload: JWTPayloadType = {
      id: user.id,
      userType: user.userType,
    };
    const accessToken = await this.generateJWT(payload);

    return { email: user.email, username: user.username, accessToken };
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
}
