export type HumanMessageType = {
  lc: number;
  type: 'constructor';
  id: ['langchain_core', 'messages', 'HumanMessage'];
  kwargs: {
    content: string;
    additional_kwargs?: Record<string, unknown>;
    response_metadata?: Record<string, unknown>;
  };
};

export type AIMessageType = {
  lc: number;
  type: 'constructor';
  id: ['langchain_core', 'messages', 'AIMessage'];
  kwargs: {
    content: string;
    additional_kwargs?: Record<string, unknown>;
    response_metadata?: Record<string, unknown>;
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

export type AIMessageChunkType = {
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

export type ToolMessageType = {
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

export type OnChainStartType = {
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

export type OnChainStreamType = {
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

export type OnChainEndType = {
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

export type OnChatModelStartType = {
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

export type OnChatModelStreamType = {
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

export type OnChatModelEnd = {
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

export type OnToolStartType = {
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

export type OnToolEndType = {
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

export type MessageEventType =
  | OnChainStartType
  | OnChainStreamType
  | OnChainEndType
  | OnChatModelStartType
  | OnChatModelStartType
  | OnChatModelStreamType
  | OnChatModelEnd
  | OnToolStartType
  | OnToolEndType;

export type ClientStatus =
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

export class MessageEventManager {
  private messageEvents: MessageEventType[] = [];
  private clientStatuses: ClientStatus[] = [];
  private mainRunId = '';
  toolCallNames: { [runId: string]: string[] } = {};

  addEvent(messageEvent: MessageEventType): ClientStatus | undefined {
    const { data, event, metadata, name, run_id } = messageEvent;
    this.messageEvents.push(messageEvent);

    if (!this.mainRunId) {
      this.mainRunId = run_id;
    }

    console.log({ event, data });

    /* ------------------------------- new_message ------------------------------ */
    if (run_id === this.mainRunId) {
      console.log('1-1');

      if (event === 'on_chain_start') {
        this.clientStatuses.push({
          status: 'new_message',
          messages: data.input.messages,
          runId: run_id,
        });
        return this.clientStatuses[this.clientStatuses.length - 1];
      } else if (event === 'on_chain_stream') {
        if (data.chunk.callModel) {
          this.clientStatuses.push({
            status: 'new_message',
            messages: data.chunk.callModel.messages,
            runId: run_id,
          });
          return this.clientStatuses[this.clientStatuses.length - 1];
        } else if (data.chunk.toolNode) {
          this.clientStatuses.push({
            status: 'new_message',
            messages: data.chunk.toolNode.messages,
            runId: run_id,
          });
          return this.clientStatuses[this.clientStatuses.length - 1];
        }
      }
    }

    /* ----------------------------- stream_content ----------------------------- */
    if (event === 'on_chat_model_stream') {
      console.log('1-2');
      const toolCallNames =
        data.chunk.kwargs?.tool_calls?.map((toolCall) => toolCall.name) || [];

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
      return this.clientStatuses[this.clientStatuses.length - 1];
    }

    /* ----------------------------- tool_call_start ---------------------------- */
    if (event === 'on_tool_start') {
      console.log('1-3');
      this.clientStatuses.push({
        status: 'tool_call_start',
        input: data.input.input,
        name,
        runId: run_id,
        node: metadata.langgraph_node,
        step: metadata.langgraph_step,
      });
      return this.clientStatuses[this.clientStatuses.length - 1];
    }

    /* ------------------------------ tool_call_end ----------------------------- */
    if (event === 'on_tool_end') {
      console.log('1-4');
      this.clientStatuses.push({
        status: 'tool_call_end',
        output: data.output,
        input: data.input.input,
        name,
        runId: run_id,
        node: metadata.langgraph_node,
        step: metadata.langgraph_step,
      });
      return this.clientStatuses[this.clientStatuses.length - 1];
    }
    return undefined;
  }

  end(): ClientStatus {
    this.clientStatuses.push({ status: 'end' });
    return this.clientStatuses[this.clientStatuses.length - 1];
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

export class MessageManager {
  private messages: (
    | AIMessageChunkType
    | HumanMessageType
    | ToolMessageType
    | AIMessageType
  )[] = [];

  addMessage(
    message:
      | AIMessageChunkType
      | HumanMessageType
      | ToolMessageType
      | AIMessageType
  ): void {
    this.messages.push(message);
  }

  getMessages(): (
    | AIMessageChunkType
    | HumanMessageType
    | ToolMessageType
    | AIMessageType
  )[] {
    return this.messages;
  }

  getMessage(
    index: number
  ): AIMessageChunkType | HumanMessageType | ToolMessageType | AIMessageType {
    return this.messages[index];
  }

  isHumanMessage(index: number): boolean {
    const message = this.getMessage(index);
    return message && message.id[message.id.length - 1] === 'HumanMessage';
  }

  isToolMessage(index: number): boolean {
    const message = this.getMessage(index);
    return message && message.id[message.id.length - 1] === 'ToolMessage';
  }

  isAIMessageChunk(index: number): boolean {
    const message = this.getMessage(index);
    return message && message.id[message.id.length - 1] === 'AIMessageChunk';
  }

  isAIMessage(index: number): boolean {
    const message = this.getMessage(index);
    return message && message.id[message.id.length - 1] === 'AIMessage';
  }
}

export class MessageModel {
  constructor(
    protected message:
      | AIMessageChunkType
      | HumanMessageType
      | ToolMessageType
      | AIMessageType
  ) {}

  getMessage():
    | AIMessageChunkType
    | HumanMessageType
    | ToolMessageType
    | AIMessageType {
    return this.message;
  }

  getContent(): string {
    return this.message.kwargs.content;
  }

  isHumanMessage(): boolean {
    const message = this.message;
    return message && message.id[message.id.length - 1] === 'HumanMessage';
  }

  isToolMessage(): boolean {
    const message = this.message;
    return message && message.id[message.id.length - 1] === 'ToolMessage';
  }

  isAIMessageChunk(): boolean {
    const message = this.message;
    return message && message.id[message.id.length - 1] === 'AIMessageChunk';
  }

  isAIMessage(): boolean {
    const message = this.message;
    return message && message.id[message.id.length - 1] === 'AIMessage';
  }
}

export class AIMessageModel extends MessageModel {
  constructor(message: AIMessageType) {
    super(message);
  }

  getToolCalls(): {
    name: string;
    args: object;
    id: string;
    type: 'tool_call';
  }[] {
    return this.message.kwargs.tool_calls || [];
  }

  getToolCallsDisplay() {}
}
