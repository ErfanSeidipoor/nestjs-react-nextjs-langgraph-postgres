import { AIMessage, BaseMessage, ToolMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import {
  Annotation,
  BaseCheckpointSaver,
  END,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import z from 'zod';

@Injectable()
export class AgentService {
  public static AgentState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: (x, y) => x.concat(y),
    }),
  });

  weatherSearchTool = tool(
    () => {
      return "It's sunny in San Francisco, but you better look out if you're a Gemini 😈.";
    },
    {
      name: 'weather_search',
      description: 'Get the weather for a given location.',
      schema: z.object({
        query: z.string(),
      }),
    }
  );

  tools = [this.weatherSearchTool];

  model = new ChatOpenAI({ model: 'gpt-4o' });
  boundModel = this.model.bindTools(this.tools);

  shouldContinue = (
    state: typeof AgentService.AgentState.State
  ): 'toolNode' | typeof END => {
    const lastMessage = state.messages[state.messages.length - 1];

    if (lastMessage && !(lastMessage as AIMessage).tool_calls?.length) {
      return END;
    }

    return 'toolNode';
  };

  callModel = async (state: typeof AgentService.AgentState.State) => {
    const response = await this.boundModel.invoke(state.messages);
    return { messages: [response] };
  };

  toolNode = async (state: typeof AgentService.AgentState.State) => {
    const results: ToolMessage[] = [];
    const lastMessage = state.messages.at(-1) as AIMessage;
    const toolsByName = Object.fromEntries(
      this.tools.map((tool) => [tool.name, tool])
    );

    if (lastMessage?.tool_calls?.length) {
      for (const toolCall of lastMessage.tool_calls) {
        const tool = toolsByName[toolCall.name];
        console.log({ tool });
        console.log({
          'tool.schema.parse(toolCall.args)': tool.schema.parse(toolCall.args),
        });

        const observation = await tool.invoke(tool.schema.parse(toolCall.args));
        results.push(
          new ToolMessage({
            content: observation,
            tool_call_id: toolCall.id!,
          })
        );
      }
    }
    return { messages: results };
  };

  workflow = new StateGraph(AgentService.AgentState)
    .addNode('callModel', this.callModel)
    .addNode('toolNode', this.toolNode)
    .addConditionalEdges('callModel', this.shouldContinue, ['toolNode', END])
    .addEdge('toolNode', 'callModel')
    .addEdge(START, 'callModel');

  app(checkpointer: BaseCheckpointSaver) {
    return this.workflow.compile({
      checkpointer,
    });
  }
}
