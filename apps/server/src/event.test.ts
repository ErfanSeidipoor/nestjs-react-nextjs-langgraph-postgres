import * as fs from 'fs/promises';
import { StreamEvent } from '@langchain/core/tracers/log_stream';
// nx test server --testFile=apps/server/src/event.test.ts
describe('File Reading Test', () => {
  it('should read the RESULT.json file and log its content', async () => {
    const {
      RESULT,
    }: {
      RESULT: {
        event: string;
        data: StreamEvent['data'];
        metadata: StreamEvent['metadata'];
      }[];
    } = JSON.parse(await fs.readFile('../../RESULT.json', 'utf-8'));

    const eventNames: string[] = [];

    for (const { event, data, metadata } of RESULT) {
      if (!eventNames.includes(event)) {
        eventNames.push(event);
      }
      //   console.log({ event, data });
      console.log({ event, langgraphNode: metadata.langgraph_node });
    }

    console.log({ eventNames });

    // for (const eventName of eventNames) {
    //   console.log(
    //     '--------------------------------- ' + eventName + ' ---------'
    //   );

    //   for (const { event, data } of RESULT.filter(
    //     ({ event }) => event === eventName
    //   )) {
    //     console.log({ event, dataFields: Object.keys(data) });
    //   }
    // }
  });

  it.only('should read the RESULT.json file and log its content', async () => {
    const {
      RESULT: messageEvents,
    }: {
      RESULT: {
        event: string;
        data: StreamEvent['data'];
        metadata: StreamEvent['metadata'];
      }[];
    } = JSON.parse(await fs.readFile('../../RESULT.json', 'utf-8'));

    const messageEventManager = new MessageEventManager();
    for (const messageEvent of messageEvents) {
      messageEventManager.addEvent(messageEvent as MessageEventType);
    }

    fs.writeFile(
      './CLIENT_RESULT.json',
      JSON.stringify(
        { clientStatus: messageEventManager.getClientStatus() },
        null,
        2
      ),
      'utf8'
    );
  });
});

type HumanMessageType = {
  lc: number;
  type: 'constructor';
  id: ['langchain_core', 'messages', 'HumanMessage'];
  kwargs: {
    content: string;
    additional_kwargs?: Record<string, unknown>;
    response_metadata?: Record<string, unknown>;
  };
};

type AIMessageChunkType = {
  lc: number;
  type: 'constructor';
  id: ['langchain_core', 'messages', 'AIMessageChunk'];
  kwargs: {
    content: string;
    tool_call_chunks?: {
      args: string;
      index: number;
      type: string;
    }[];
    additional_kwargs?: {
      tool_calls?: {
        index: number;
        function: {
          arguments: string;
        };
      }[];
    };
    response_metadata?: {
      usage?: Record<string, unknown>;
    };
    id?: string;
    tool_calls?: {
      name: string;
      args: object;
      id: string;
      type: 'tool_call';
    }[];
    invalid_tool_calls?: {
      args: string;
      error: string;
      type: string;
    }[];
  };
};

type ToolMessageType = {
  lc: number;
  type: 'constructor';
  id: ['langchain_core', 'messages', 'ToolMessage'];
  kwargs: {
    content: string;
    tool_call_id: string;
    additional_kwargs?: Record<string, unknown>;
    response_metadata?: Record<string, unknown>;
  };
};

type OnChainStartType = {
  event: 'on_chain_start';
  data: {
    input: {
      messages: AIMessageChunkType[];
    };
  };
  metadata: {
    thread_id: string;
    langgraph_step: number;
    langgraph_node: string;
    langgraph_triggers: string[];
    langgraph_path: string[];
    langgraph_checkpoint_ns: string;
    __pregel_resuming: boolean;
    __pregel_task_id: string;
    checkpoint_ns: string;
  };
  name: string;
  run_id: string;
  tags: string[];
};

type OnChainStreamType = {
  event: 'on_chain_stream';
  data: {
    chunk: {
      callModel?: {
        messages: AIMessageChunkType[];
      };
      toolNode?: {
        messages: ToolMessageType[];
      };
    };
  };
  metadata: {
    thread_id: string;
  };
  name: string;
  run_id: string;
  tags: string[];
};

type OnChainEndType = {
  event: 'on_chain_end';
  data: {
    output:
      | {
          messages: (HumanMessageType | AIMessageChunkType | ToolMessageType)[];
        }
      | string;
    input: {
      messages: (HumanMessageType | AIMessageChunkType | ToolMessageType)[];
    };
  };
  metadata: {
    thread_id: string;
    langgraph_step?: number;
    langgraph_node?: string;
    langgraph_triggers?: string[];
    langgraph_path?: string[];
    langgraph_checkpoint_ns?: string;
    __pregel_resuming?: boolean;
    __pregel_task_id?: string;
    checkpoint_ns?: string;
  };
  name: string;
  run_id: string;
  tags: string[];
};

type OnChatModelStartType = {
  event: 'on_chat_model_start';
  data: {
    input: {
      messages: HumanMessageType[];
    };
  };
  metadata: {
    thread_id: string;
    langgraph_step: number;
    langgraph_node: string;
    langgraph_triggers: string[];
    langgraph_path: string[];
    langgraph_checkpoint_ns: string;
    __pregel_task_id: string;
    checkpoint_ns: string;
    ls_provider: string;
    ls_model_name: string;
    ls_model_type: string;
  };
  name: string;
  run_id: string;
  tags: string[];
};

type OnChatModelStreamType = {
  event: 'on_chat_model_stream';
  data: {
    chunk: AIMessageChunkType;
  };
  metadata: {
    thread_id: string;
    langgraph_step: number;
    langgraph_node: string;
    langgraph_triggers: string[];
    langgraph_path: string[];
    langgraph_checkpoint_ns: string;
    __pregel_task_id: string;
    checkpoint_ns: string;
    ls_provider: string;
    ls_model_name: string;
    ls_model_type: string;
  };
  name: string;
  run_id: string;
  tags: string[];
};

type OnChatModelEnd = {
  event: 'on_chat_model_end';
  data: {
    output: AIMessageChunkType;
    input: {
      messages: AIMessageChunkType[];
    };
  };
  metadata: {
    thread_id: string;
    langgraph_step: number;
    langgraph_node: string;
    langgraph_triggers: string[];
    langgraph_path: string[];
    langgraph_checkpoint_ns: string;
    __pregel_task_id: string;
    checkpoint_ns: string;
    ls_provider: string;
    ls_model_name: string;
    ls_model_type: string;
  };
  name: string;
  run_id: string;
  tags: string[];
};

type OnToolStartType = {
  event: 'on_tool_start';
  data: {
    input: {
      input: string; // JSON string representing the input query
    };
  };
  metadata: {
    thread_id: string;
    langgraph_step: number;
    langgraph_node: string;
    langgraph_triggers: string[];
    langgraph_path: string[];
    langgraph_checkpoint_ns: string;
    __pregel_task_id: string;
    checkpoint_ns: string;
  };
  name: string;
  run_id: string;
  tags: string[];
};

type OnToolEndType = {
  event: 'on_tool_end';
  data: {
    output: string;
    input: {
      input: string; // JSON string representing the input query
    };
  };
  metadata: {
    thread_id: string;
    langgraph_step: number;
    langgraph_node: string;
    langgraph_triggers: string[];
    langgraph_path: string[];
    langgraph_checkpoint_ns: string;
    __pregel_task_id: string;
    checkpoint_ns: string;
  };
  name: string;
  run_id: string;
  tags: string[];
};

type MessageEventType =
  | OnChainStartType
  | OnChainStreamType
  | OnChainEndType
  | OnChatModelStartType
  | OnChatModelStartType
  | OnChatModelStreamType
  | OnChatModelEnd
  | OnToolStartType
  | OnToolEndType;

type ClientStatus =
  | {
      status: 'stream_content';
      chunk: AIMessageChunkType;
      node: string;
      step: number;
      runId: string;
      toolCallNames: string[];
    }
  | {
      status: 'tool_call_start';
      name: string;
      runId: string;
      input: string;
      step: number;
      node: string;
    }
  | {
      status: 'tool_call_end';
      name: string;
      runId: string;
      output: string;
      input: string;
      step: number;
      node: string;
    }
  | {
      status: 'new_message';
      messages: (AIMessageChunkType | HumanMessageType | ToolMessageType)[];
      runId: string;
    }
  | {
      status: 'end';
    };

class MessageEventManager {
  private messageEvents: MessageEventType[] = [];
  private clientStatuses: ClientStatus[] = [];
  private mainRunId = '';
  toolCallNames: { [runId: string]: string[] } = {};

  addEvent(messageEvent: MessageEventType): void {
    const { data, event, metadata, name, run_id } = messageEvent;
    this.messageEvents.push(messageEvent);

    if (!this.mainRunId) {
      this.mainRunId = run_id;
    }
    /* ------------------------------- new_message ------------------------------ */
    if (run_id === this.mainRunId) {
      if (event === 'on_chain_start') {
        this.clientStatuses.push({
          status: 'new_message',
          messages: data.input.messages,
          runId: run_id,
        });
      } else if (event === 'on_chain_stream') {
        if (data.chunk.callModel) {
          this.clientStatuses.push({
            status: 'new_message',
            messages: data.chunk.callModel.messages,
            runId: run_id,
          });
        } else if (data.chunk.toolNode) {
          this.clientStatuses.push({
            status: 'new_message',
            messages: data.chunk.toolNode.messages,
            runId: run_id,
          });
        }
      }
    }

    /* ----------------------------- stream_content ----------------------------- */
    if (event === 'on_chat_model_stream') {
      const toolCallNames =
        data.chunk.kwargs.tool_calls?.map((toolCall) => toolCall.name) || [];

      for (const toolCallName of toolCallNames) {
        if (!this.toolCallNames[run_id]) {
          this.toolCallNames[run_id] = [];
        }
        if (!this.toolCallNames[run_id].includes(toolCallName)) {
          this.toolCallNames[run_id].push(toolCallName);
        }
      }

      this.clientStatuses.push({
        status: 'stream_content',
        chunk: data.chunk,
        node: metadata.langgraph_node,
        step: metadata.langgraph_step,
        runId: run_id,
        toolCallNames: this.toolCallNames[run_id],
      });
    }

    /* ----------------------------- tool_call_start ---------------------------- */
    if (event === 'on_tool_start') {
      this.clientStatuses.push({
        status: 'tool_call_start',
        input: data.input.input,
        name,
        runId: run_id,
        node: metadata.langgraph_node,
        step: metadata.langgraph_step,
      });
    }

    /* ------------------------------ tool_call_end ----------------------------- */
    if (event === 'on_tool_end') {
      this.clientStatuses.push({
        status: 'tool_call_end',
        output: data.output,
        input: data.input.input,
        name,
        runId: run_id,
        node: metadata.langgraph_node,
        step: metadata.langgraph_step,
      });
    }
  }

  end() {
    this.clientStatuses.push({ status: 'end' });
  }

  getTheLatestClientStatus(): ClientStatus | undefined {
    if (this.clientStatuses.length === 0) {
      return undefined;
    }
    return this.clientStatuses[this.clientStatuses.length - 1];
  }

  getClientStatus(): ClientStatus[] {
    return this.clientStatuses;
  }
}
