import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThreadModule } from './thread.module/thread.module';
import { PostgresDBModule } from './postgres-db/postgres-db.module';
import { UserModule } from './user.module/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    UserModule,
    ThreadModule,
    PostgresDBModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
