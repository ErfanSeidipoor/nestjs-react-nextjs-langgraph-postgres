import { Controller, Get, Post, Headers, UnauthorizedException, Param, Body } from '@nestjs/common';
import { type Chat, ChatService } from './chat.service';
import { UserService } from '../user.module/user.service';

@Controller("/chat")
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService
  ) {}

  @Post()
  create(@Headers('Authorization') token: string, @Body('title') title: string): Chat {
    const validation = this.userService.validateToken(token);
    if (!validation.isValid) {
      throw new UnauthorizedException('Invalid token');
    }
    const userId = validation.id;

    return this.chatService.create({userId,title,prompt:""});
  }

  @Get()
  get(@Headers('Authorization') token: string): Chat[] {
    const validation = this.userService.validateToken(token);
    if (!validation.isValid) {
      throw new UnauthorizedException('Invalid token');
    }
    const userId = validation.id;

    return this.chatService.getAll(userId);
  }

  @Get("/:chatId")
  getById(@Headers('Authorization') token: string, @Param('chatId') chatId: string): Chat {
    const validation = this.userService.validateToken(token);
    if (!validation.isValid) {
      throw new UnauthorizedException('Invalid token');
    }
    const userId = validation.id;

    return this.chatService.getById(userId, chatId);
  }
}
