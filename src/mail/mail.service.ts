import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, RequestTimeoutException } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Sending email after user logged in his account
   * @param user user the logged in user
   */
  public async sendLogInEmail(email: string) {
    try {
      const today = new Date();
      await this.mailerService.sendMail({
        to: email,
        from: `<sdm.hilles@gmail.com>`,
        subject: 'Log in',
        template: 'login',
        context: {
          email,
          today,
        },
      });
    } catch (error) {
      console.log('error: ', error);
      throw new RequestTimeoutException();
    }
  }

  /**
   * Sending verify email template
   * @param email email of the registered user
   * @param link link with id of the user verification token
   */
  public async sendVerifyEmailTemplate(email: string, link: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: `<sdm.hilles@gmail.com>`,
        subject: 'Verify your account',
        template: 'verify-email',
        context: {
          link,
        },
      });
    } catch (error) {
      console.log('error: ', error);
      throw new RequestTimeoutException();
    }
  }

  /**
   * Sending reset password template
   * @param email email of the registered user
   * @param link reset password link with id of the user and reset password token
   */
  public async sendResetPasswordTemplate(
    email: string,
    resetPasswordLink: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: `<sdm.hilles@gmail.com>`,
        subject: 'Reset Password',
        template: 'reset-password',
        context: {
          resetPasswordLink,
        },
      });
    } catch (error) {
      console.log('error: ', error);
      throw new RequestTimeoutException();
    }
  }
}
