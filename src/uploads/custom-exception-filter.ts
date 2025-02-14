import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { PayloadTooLargeException } from '@nestjs/common';

@Catch(PayloadTooLargeException)
export class PayloadTooLargeExceptionFilter implements ExceptionFilter {
  catch(exception: PayloadTooLargeException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
      message: 'File too large, the image should be less than 2MB',
      error: 'Payload Too Large',
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
    });
  }
}
