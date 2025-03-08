import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, Request, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // const token = req.headers.authorization?.split(' ')[1];
    // console.log('token: ', token);
    // if (token && token === 'ThisIsMyToken') {
    //   next();
    // } else {
    //   res.status(401).json({ message: 'you are not allowed!' });
    // }
    // console.log({
    //   headers: req.headers,
    //   method: req.method,
    //   hostname: req.hostname,
    // });
    next();
  }
}
