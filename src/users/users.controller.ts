import {
  BadRequestException,
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
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
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
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ApiConsumes, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { ImageUploadDto } from './dtos/image-upload.dto';

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
  @UseInterceptors(FileInterceptor('user-image'))
  @ApiSecurity('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImageUploadDto, description: 'profile image' })
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

  @Get('users/verify-email/:id/:verificationToken')
  public verifyEmail(
    @Param('id', ParseIntPipe) id: number,
    @Param('verificationToken') verificationToken: string,
  ) {
    return this.usersService.verifyEmail(id, verificationToken);
  }

  @Post('users/forgot-password')
  @HttpCode(HttpStatus.OK)
  public forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.usersService.sendResetPassword(body.email);
  }

  @Get('users/reset-password/:id/:resetPasswordToken')
  public getResetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Param('resetPasswordToken') resetPasswordToken: string,
  ) {
    return this.usersService.getResetPassword(id, resetPasswordToken);
  }

  @Post('users/reset-password')
  public resetPassword(@Body() body: ResetPasswordDto) {
    return this.usersService.resetPassword(body);
  }
}
