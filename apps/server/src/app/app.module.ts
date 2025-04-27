import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserModule } from './user.module/user.module';
import { ChatModule } from './chat.module/chat.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'assets'),
    }),
    UserModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
