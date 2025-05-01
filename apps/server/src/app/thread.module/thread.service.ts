import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { MessageEventManager, MessageEventType } from '@models';
import { BadRequestException, Injectable, MessageEvent } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { Thread } from '../postgres-db/entities';
import { AgentService } from './agent.service';
import { CheckpointerService } from './checkpoiner.service';

@Injectable()
export class ThreadService {
  constructor(
    private readonly checkpointerService: CheckpointerService,
    private readonly agentService: AgentService,
    @InjectRepository(Thread)
    private readonly threadRepository: Repository<Thread>
  ) {}

  async getAll(userId: string): Promise<Thread[]> {
    return this.threadRepository.find({
      where: { userId },
    });
  }

  async getById(userId: string, threadId: string): Promise<Thread> {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId, userId },
    });
    if (!thread) {
      throw new BadRequestException('thread not found');
    }
    return thread;
  }

  async create(input: {
    userId: string;
    title: string;
    prompt: string;
  }): Promise<{ thread: Thread }> {
    const { title, userId, prompt } = input;

    const thread = await this.threadRepository
      .create({
        title,
        userId,
        initialPrompt: prompt,
      })
      .save();

    return { thread };
  }

  async continue(input: {
    userId: string;
    threadId: string;
    prompt: string;
  }): Promise<BaseMessage[]> {
    const { prompt, threadId, userId } = input;
    const thread = await this.getById(userId, threadId);

    const config = {
      configurable: { thread_id: threadId },
      streamMode: 'values' as const,
    };

    if (!prompt && !thread.initialPrompt) {
      throw new BadRequestException('prompt is required');
    } else {
      const response = await this.agentService
        .app(this.checkpointerService.checkpointer)
        .invoke(
          {
            messages: [new HumanMessage(prompt || thread.initialPrompt || '')],
          },
          config
        );

      return response.messages;
    }
  }

  async continueSse(input: {
    userId: string;
    threadId: string;
    prompt: string;
  }) {
    const { prompt, userId, threadId } = input;

    await this.getById(userId, threadId);

    const eventStream = await this.agentService
      .app(this.checkpointerService.checkpointer)
      .streamEvents(
        {
          messages: [new HumanMessage(prompt)],
        },
        {
          version: 'v2',
          configurable: {
            thread_id: threadId,
          },
        }
      );

    const messageEventManager = new MessageEventManager();
    const RESULT: object[] = [];
    return new Observable<MessageEvent>((observer) => {
      (async () => {
        try {
          for await (const messageEvent of eventStream) {
            const clientStatus = messageEventManager.addEvent(
              messageEvent as unknown as MessageEventType
            );

            RESULT.push({ clientStatus, messageEvent });

            if (clientStatus) {
              observer.next({
                data: clientStatus,
              });
            }
          }

          observer.next({
            data: messageEventManager.end(),
          });

          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }

  async getMessages(input: {
    userId: string;
    threadId: string;
  }): Promise<BaseMessage[]> {
    const { threadId, userId } = input;
    await this.getById(userId, threadId);

    const config = {
      configurable: { thread_id: threadId },
    };

    const state = await this.agentService
      .app(this.checkpointerService.checkpointer)
      .getState(config);

    return (
      (state.values as typeof AgentService.AgentState.State).messages || []
    );
  }
}
