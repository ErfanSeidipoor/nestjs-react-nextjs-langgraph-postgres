import { Controller, Get, MessageEvent, Param, Query, Sse } from '@nestjs/common';
import { AppService } from './app.service';
import {  Observable } from 'rxjs';



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

    /* ---------------------------------- catch --------------------------------- */
   const observable = new Observable<MessageEvent>((observer) => {
      try {
        observer.next({ data: { hello: 'world before error 1' } });
        observer.next({ data: { hello: 'world before error 2' } });

        throw new Error('Error occurred');
      } catch (error) {
        observer.error(error);
      } finally {
        observer.unsubscribe();
      }
    });

    return observable
    /* ---------------------------------- timer --------------------------------- */
  //  return new Observable((observer) => {
  //     observer.next({ data: { hello: 'world 1' } });
  //     observer.next({ data: { hello: 'world 2' } });
  //     // observer.next({ data:{status: "completed", hello: 'world 3'}});
  //     observer.unsubscribe();
  //     // observer.complete();
  //   })
//  return 
    /* --------------------------------- promise -------------------------------- */

    // return new Observable<MessageEvent>((subscriber) => {
    //   (async () => {
    //     try {
    //       const promise = new Promise((resolve) => {
    //         setTimeout(() => {
    //           console.log('Promise resolved');
    //           resolve({ data: { hello: 'world' } });
    //         }
    //         , 3000);
    //       })
    //       const result = await promise;
    //       subscriber.next(result as MessageEvent);
    //       subscriber.complete();
    //     } catch (error) {
    //       subscriber.error(error);
    //     }
    //   })();
    // });
    /* --------------------------------- manual --------------------------------- */
    // return new Observable((observer) => {
    //   observer.next({ data: { hello: 'world 1' } });
    //   observer.next({ data: { hello: 'world 2' } });
    //   observer.next({ data:{status: "completed", hello: 'world 3'}});
    //   // observer.unsubscribe();
    //   // observer.complete();
    // })
    /* --------------------------------- interval -------------------------------- */
    // return interval(1000).pipe(
    //   map((_, index) => {
    //     console.log({index});
        
    //     return ({ data: { hello: 'world'+index } }) as MessageEvent}),
    // );
  }
}
