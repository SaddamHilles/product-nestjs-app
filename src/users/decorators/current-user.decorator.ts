import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express'; // Import Request type
import { CURRENT_USER_KEY } from 'src/utils/constants';
import { JWTPayloadType } from 'src/utils/types';

export const CurrentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<Request>();
    const payload: JWTPayloadType = req[CURRENT_USER_KEY];
    return payload;
  },
);
