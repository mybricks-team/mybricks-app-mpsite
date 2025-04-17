import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap, of, finalize } from 'rxjs';
import { catchError } from 'rxjs/operators'

/** 全局共享一个实例 */
const counter = {
  count: 0,
  limit: 20 // 并发上限暂时设置为20，目前应该没那么大的用户量
}

/** 限制路由的并发数量，全局共享一个池子 */
@Injectable()
export default class LimitInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (counter.count >= counter.limit) { // 并发次数已达上限
      return of({
        code: -1,
        message: '前方拥堵中，请稍后再试~'
      })
    }

    counter.count++; // 计数器加1

    return next.handle().pipe(
      tap(() => {}),
      catchError((err) => {
        return of({
          code: -1,
          message: err?.message,
          stack: err?.stack
        })
      }),
      finalize(() => {
        if (counter.count > 0) {
          counter.count--;  // 计数器减1
        }
      })
    );
  }
}