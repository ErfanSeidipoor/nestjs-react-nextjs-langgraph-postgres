import { Controller, Get, MessageEvent, Param, Query, Sse } from '@nestjs/common';
import { AppService } from './app.service';
import { map } from 'rxjs/operators';
import { interval, Observable } from 'rxjs';



@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Sse('sse/:chatId')
  sse(@Query('userToken') userToken: string, @Param("chatId") chatId: string): Observable<MessageEvent> {
    console.log({userToken,chatId});
    
    return new Observable((observer) => {
      observer.next({ data: { hello: 'world 1' } });
      observer.next({ data: { hello: 'world 2' } });
      // observer.unsubscribe();
      observer.complete();
    })
    return interval(1000).pipe(
      map((_, index) => {
        console.log({index});
        
        return ({ data: { hello: 'world'+index } }) as MessageEvent}),
    );
  }
}
