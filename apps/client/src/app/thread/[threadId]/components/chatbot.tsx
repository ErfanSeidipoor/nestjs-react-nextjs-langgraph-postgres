'use client';

import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  ToolMessage,
  AIMessageChunk,
} from '@langchain/core/messages';
import { useRouter } from 'next/navigation';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import React, { useEffect, useState } from 'react';

interface ChatbotProps {
  threadId: string;
}

interface Plan {
  lc: number;
  type: string;
  id: string[];
  kwargs: Record<string, any>;
}

interface MessageEventData {
  hello: string;
}

function convertPlansToMessages(plans: Plan[]): BaseMessage[] {
  return plans.map((plan) => {
    const messageType = plan.id[plan.id.length - 1];
    const kwargs = plan.kwargs || {};

    switch (messageType) {
      case 'HumanMessage':
        return new HumanMessage({
          content: kwargs.content ?? '',
          additional_kwargs: kwargs.additional_kwargs ?? {},
          response_metadata: kwargs.response_metadata ?? {},
        });

      case 'AIMessage':
        return new AIMessage({
          content: kwargs.content ?? '',
          additional_kwargs: kwargs.additional_kwargs ?? {},
          response_metadata: kwargs.response_metadata ?? {},
          id: kwargs.id,
          tool_calls: kwargs.tool_calls,
          invalid_tool_calls: kwargs.invalid_tool_calls,
          usage_metadata: kwargs.usage_metadata,
        });

      case 'ToolMessage':
        return new ToolMessage({
          content: kwargs.content ?? '',
          tool_call_id: kwargs.tool_call_id,
          additional_kwargs: kwargs.additional_kwargs ?? {},
          response_metadata: kwargs.response_metadata ?? {},
        });
      case 'AIMessageChunk':
        return new AIMessageChunk({
          content: kwargs.content ?? '',
          additional_kwargs: kwargs.additional_kwargs ?? {},
          response_metadata: kwargs.response_metadata ?? {},
          id: kwargs.id,
          tool_calls: kwargs.tool_calls,
          invalid_tool_calls: kwargs.invalid_tool_calls,
          usage_metadata: kwargs.usage_metadata,
        });

      default:
        throw new Error(`Unknown message type: ${messageType}`);
    }
  });
}

const Chatbot: React.FC<ChatbotProps> = ({ threadId }) => {
  const router = useRouter();

  const [messages, setMessages] = useState<
    (AIMessage | HumanMessage | ToolMessage | AIMessageChunk)[]
  >([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'api' | 'socket'>('api');
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);
  const [error, setError] = useState<string | null>(null);

  const continueChatSocket = () => {
    if (subscriptionActive) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const queryParams = new URLSearchParams({
      token,
      prompt: newMessage,
    }).toString();

    console.log({ queryParams });

    const eventSource = new EventSource(
      `http://localhost:4000/thread/${threadId}/continue?${queryParams}`
    );

    const sseObservable = new Observable<MessageEvent<string>>((subscriber) => {
      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setLoading(true); // Start loading when the connection opens
      };

      eventSource.onmessage = (event) => {
        console.log('New message:', event);
        subscriber.next(event);
      };

      eventSource.onerror = (error) => {
        // console.error('SSE error:', error);
        console.log({ error });
        setError(JSON.stringify(error));
        // subscriber.error(error);
        eventSource.close();
        console.log('SSE connection closed');
        setLoading(false); // Stop loading on error
      };

      return () => {
        eventSource.close();
        console.log('SSE connection closed');
        setLoading(false); // Stop loading when the connection is closed
      };
    });

    const subscriptionCleanup = sseObservable
      .pipe(
        map((event) => {
          try {
            const parsedData = JSON.parse(event.data) as MessageEventData;
            console.log('Parsing SSE data:', parsedData);
            return parsedData;
          } catch (error) {
            // console.error('Error parsing SSE data:', error, event.data);
            return `Error: Could not parse message: ${event.data}`;
          }
        })
      )
      .subscribe((message) => {
        console.log('subscribe > ', message as MessageEventData);
        // setMessages((prevMessages) => [
        //   ...prevMessages,
        //   JSON.stringify(message),
        // ]);
      });

    setUnsubscribe(() => () => {
      subscriptionCleanup.unsubscribe();
      setSubscriptionActive(false);
    });
    setSubscriptionActive(true);
  };

  const stopChatSocket = () => {
    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
    }
  };

  const continueChatApi = async () => {
    const token = localStorage.getItem('token');
    if (!token || !threadId || !newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/thread/${threadId}/continue`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({ prompt: newMessage }),
        }
      );

      if (response.ok) {
        const data = (await response.json()) as Plan[];
        setMessages(convertPlansToMessages(data));
        setNewMessage('');
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending or continuing thread:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      router.push('/');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token || !threadId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:4000/thread/${threadId}/message`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: token,
            },
          }
        );

        if (response.ok) {
          const data = (await response.json()) as Plan[];
          setMessages(convertPlansToMessages(data));
        } else {
          console.error('Failed to fetch messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [router, threadId]);

  const handleSendMessage = async () => {
    if (mode === 'api') {
      continueChatApi();
    } else if (mode === 'socket') {
      continueChatSocket();
    }
  };

  return (
    <div>
      <div>
        <h1>Thread Details</h1>
        <div>
          <label>
            <input
              type="radio"
              name="mode"
              value="api"
              checked={mode === 'api'}
              onChange={() => setMode('api')}
            />
            API Mode
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              value="socket"
              checked={mode === 'socket'}
              onChange={() => setMode('socket')}
            />
            Socket Mode
          </label>
        </div>
        <div>
          {messages.map((message, index) => {
            if (message.getType() === 'tool') {
              return (
                <div key={index}>
                  <strong>Tool:</strong>{' '}
                  {(message as ToolMessage).content as string}
                </div>
              );
            } else if (message.getType() === 'ai') {
              return (
                <div key={index}>
                  <strong>AI:</strong> {String(message.content)}
                </div>
              );
            } else if (message.getType() === 'human') {
              return (
                <div key={index}>
                  <strong>You:</strong> {String(message.content)}
                </div>
              );
            } else {
              return (
                <div key={index}>
                  <strong>Unknown message type:</strong>{' '}
                  {JSON.stringify(message)}
                </div>
              );
            }
          })}
        </div>
        {loading && 'Loading...'}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={loading} // Disable input when loading
          />
          <button type="submit" disabled={loading || !newMessage}>
            {loading ? 'Loading...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
