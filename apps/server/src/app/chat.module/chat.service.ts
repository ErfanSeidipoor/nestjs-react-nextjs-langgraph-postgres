import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface Chat {
  id: string;
  userId: string;
  title: string; // Added title property
}

@Injectable()
export class ChatService {
  private readonly chatsFilePath = path.join(__dirname, 'chats.json');

  constructor() {
    if (!fs.existsSync(this.chatsFilePath)) {
      fs.writeFileSync(this.chatsFilePath, JSON.stringify([]));
    }
  }

  private readChats(): Chat[] {
    const data = fs.readFileSync(this.chatsFilePath, 'utf-8');
    return JSON.parse(data);
  }

  private writeChats(users: Chat[]): void {
    fs.writeFileSync(this.chatsFilePath, JSON.stringify(users, null, 2));
  }

  getAll(userId: string): Chat[] {
    return this.readChats().filter((c) => c.userId === userId);
  }

  getById(userId: string, chatId: string): Chat {
    const chat = this.readChats().find((c) => c.id === chatId && c.userId === userId);
    if (!chat) {
      throw new BadRequestException('Chat not found or access denied');
    }
    return chat;
  }

  create(input: { userId: string; title: string; prompt: string }): Chat {
    const chats = this.readChats();
    const newChat: Chat = {
      id: uuidv4(),
      userId: input.userId,
      title: input.title,
    };

    console.log({newChat});
    
    chats.push(newChat);
    this.writeChats(chats);
    return newChat;
  }
}
