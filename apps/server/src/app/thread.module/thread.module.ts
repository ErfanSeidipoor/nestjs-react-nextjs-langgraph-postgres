import { Module } from '@nestjs/common';
import { ThreadController } from './thread.controller';
import { ThreadService } from './thread.service';
import { UserService } from '../user.module/user.service';
import { CheckpointerService } from './checkpoiner.service';
import { ConfigService } from '@nestjs/config';
import { PostgresDBModule } from '../postgres-db/postgres-db.module';
import { AgentService } from './agent.service';

@Module({
  imports: [PostgresDBModule],
  controllers: [ThreadController],
  providers: [
    ConfigService,
    ThreadService,
    UserService,
    CheckpointerService,
    AgentService,
  ],
})
export class ThreadModule {}
