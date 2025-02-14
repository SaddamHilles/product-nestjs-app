import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { UserType } from 'src/utils/enums';
import { JWTPayloadType } from 'src/utils/types';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/user-role.decorator';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthRoleGuard } from './guards/auth-roles.guard';
import { AuthGuard } from './guards/auth.guard';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express, Response } from 'express';

@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('user/auth/register')
  public register(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }

  @Post('user/auth/login') // Default status code for post is 201 Created
  @HttpCode(HttpStatus.OK)
  public login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }

  @Get('users/current-user')
  @UseGuards(AuthGuard)
  // @UseInterceptors(ClassSerializerInterceptor)
  public getCurrentUser(@CurrentUser() payload: JWTPayloadType) {
    return this.usersService.getCurrentUser(payload.id);
  }

  // @Roles(UserType.ADMIN, UserType.NORMAL_USER) When I want other user type to acccess to this getAllUsers method
  @Get('users')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRoleGuard)
  // @UseInterceptors(ClassSerializerInterceptor)
  public getAllUsers() {
    return this.usersService.getAll();
  }

  @Put('user/update')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRoleGuard)
  public updateUser(
    @CurrentUser() payload: JWTPayloadType,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(payload.id, body);
  }

  @Delete('user/:id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRoleGuard)
  public deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.usersService.delete(id, payload);
  }

  @Post('user/upload-profile')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('user-image', {
      storage: diskStorage({
        destination: './images/users',
        filename: (req, file, cb) => {
          const prefix = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;
          const filename = `${prefix}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Unsupported file format'), false);
        }
      },
      limits: { fileSize: 1024 * 1024 * 2 },
    }),
  )
  public uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    if (!file) throw new BadRequestException('No image provided');
    console.log('File uploaded', { file });
    return this.usersService.setProfileImage(payload.id, file.filename);
  }

  @Get('user/profile/:image')
  public showProfileImage(@Param('image') image: string, @Res() res: Response) {
    return res.sendFile(image, { root: 'images/users' });
  }

  @Delete('users/remove-profile')
  @UseGuards(AuthGuard)
  public removeProfileImage(@CurrentUser() payload: JWTPayloadType) {
    return this.usersService.removeProfileImage(payload.id);
  }
}
