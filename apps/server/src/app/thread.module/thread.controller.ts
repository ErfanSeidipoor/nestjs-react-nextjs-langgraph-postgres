import { BaseMessage } from '@langchain/core/messages';
import {
  Body,
  Controller,
  Get,
  Headers,
  Query,
  Param,
  Post,
  Sse,
  UnauthorizedException,
} from '@nestjs/common';
import { Thread } from '../postgres-db/entities';
import { UserService } from '../user.module/user.service';
import { ThreadService } from './thread.service';
import { AgentService } from './agent.service';

@Controller('/thread')
export class ThreadController {
  constructor(
    private readonly threadService: ThreadService,
    private readonly agentService: AgentService,
    private readonly userService: UserService
  ) {}

  @Post()
  create(
    @Headers('Authorization') token: string,
    @Body('title') title: string,
    @Body('prompt') prompt: string
  ): Promise<{ thread: Thread }> {
    const validation = this.userService.validateToken(token);
    if (!validation.isValid) {
      throw new UnauthorizedException('Invalid token');
    }
    const userId = validation.id;

    return this.threadService.create({ userId, title, prompt });
  }

  @Sse('/:threadId/continue')
  createWithStream(
    @Query('token') token: string,
    @Param('threadId') threadId: string,
    @Query('prompt') prompt: string
  ) {
    console.log({ token, threadId, prompt });

    const validation = this.userService.validateToken(token);
    if (!validation.isValid) {
      throw new UnauthorizedException('Invalid token');
    }
    const userId = validation.id;

    return this.threadService.continueSse({ userId, threadId, prompt });
  }

  @Post('/:threadId/continue')
  continue(
    @Headers('Authorization') token: string,
    @Param('threadId') threadId: string,
    @Body('prompt') prompt: string
  ): Promise<BaseMessage[]> {
    const validation = this.userService.validateToken(token);
    if (!validation.isValid) {
      throw new UnauthorizedException('Invalid token');
    }
    const userId = validation.id;

    return this.threadService.continue({ userId, threadId, prompt });
  }

  @Get()
  get(@Headers('Authorization') token: string): Promise<Thread[]> {
    const validation = this.userService.validateToken(token);
    if (!validation.isValid) {
      throw new UnauthorizedException('Invalid token');
    }
    const userId = validation.id;

    return this.threadService.getAll(userId);
  }

  @Get('/:threadId/message')
  getMessage(
    @Headers('Authorization') token: string,
    @Param('threadId') threadId: string
  ) {
    const validation = this.userService.validateToken(token);
    if (!validation.isValid) {
      throw new UnauthorizedException('Invalid token');
    }
    const userId = validation.id;

    return this.threadService.getMessages({ userId, threadId });
  }

  @Get('/:threadId')
  getById(
    @Headers('Authorization') token: string,
    @Param('threadId') threadId: string
  ): Promise<Thread> {
    const validation = this.userService.validateToken(token);
    if (!validation.isValid) {
      throw new UnauthorizedException('Invalid token');
    }
    const userId = validation.id;

    return this.threadService.getById(userId, threadId);
  }

  @Post('print')
  print() {
    return this.agentService.print();
  }
}
