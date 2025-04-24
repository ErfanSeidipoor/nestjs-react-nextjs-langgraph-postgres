import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  // private readonly model = new ChatOpenAI({
  //   apiKey: process.env.OPENAI_KEY,
  //   modelName: 'gpt-4o-mini',   // or any other model that supports streaming
  //   temperature: 0.7,
  //   streaming: true,            // <-- crucial: tells LangChain to use the SSE stream
  // });

  getData(): { message: string } {
    return { message: 'Hello API' };
  }
}
