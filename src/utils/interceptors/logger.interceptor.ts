import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    console.log('Before route Handler');
    return next.handle().pipe(
      map((dataFromRouteHandler) => {
        const { password, ...rest } = dataFromRouteHandler;
        console.log('password: ', password);
        return { ...rest };
      }),
    );
  }
}
