import { Controller, Get, MessageEvent, Query, Sse } from '@nestjs/common';
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

  @Sse('sse')
  sse(@Query('userToken') userToken: string): Observable<MessageEvent> {
    console.log({userToken});
    
    return interval(1000).pipe(
      map((_, index) => {
        return ({ data: { hello: 'world'+index } }) as MessageEvent}),
    );
  }
}
