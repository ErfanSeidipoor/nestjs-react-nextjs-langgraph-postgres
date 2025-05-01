'use client';
import { useRouter } from 'next/navigation';
import { Observable } from 'rxjs';
import React, { useEffect, useState } from 'react';
import {
  ClientStatus,
  HumanMessageType,
  ToolMessageType,
  AIMessageChunkType,
  AIMessageType,
  MessageModel,
} from '@models';

interface ChatbotProps {
  threadId: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ threadId }) => {
  const router = useRouter();

  const [messages, setMessages] = useState<
    (HumanMessageType | ToolMessageType | AIMessageChunkType | AIMessageType)[]
  >([]);

  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'api' | 'socket'>('api');
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messageStream, setMessageStream] = useState('');

  const continueChatSocket = () => {
    if (subscriptionActive) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const queryParams = new URLSearchParams({
      token,
      prompt: newMessage,
    }).toString();

    const eventSource = new EventSource(
      `http://localhost:4000/thread/${threadId}/continue?${queryParams}`
    );

    const sseObservable = new Observable<MessageEvent<string>>((subscriber) => {
      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setLoading(true);
      };

      eventSource.onmessage = (event) => {
        const parsedData = JSON.parse(event.data) as ClientStatus;
        console.log('New message:', parsedData.status, { event, parsedData });
        if (parsedData.status === 'end') {
          eventSource.close();
          setSubscriptionActive(false);
          setLoading(false);
        }
        subscriber.next(event);
      };

      eventSource.onerror = (error) => {
        console.log('SSE error:setSubscriptionActive:', subscriptionActive);
        if (subscriptionActive) {
          console.log({ error });
          setError(JSON.stringify(error));
          eventSource.close();
          console.log('eventSource.onerror SSE connection closed');
          setLoading(false);
          setSubscriptionActive(false);
        }
      };

      return () => {
        eventSource.close();
        console.log('SSE connection closed');
        setLoading(false); // Stop loading when the connection is closed
      };
    });

    const subscriptionCleanup = sseObservable
      .pipe()
      .subscribe(({ data }): void => {
        try {
          const parsedData = JSON.parse(data) as ClientStatus;
          if (parsedData.status === 'new_message') {
            setMessages((prevMessages) => [
              ...prevMessages,
              ...parsedData.messages,
            ]);
            setMessageStream('');
          } else if (parsedData.status === 'end') {
            stopChatSocket();
            setMessageStream('');
          } else if (parsedData.status === 'stream_content') {
            const newMessageChunk = new MessageModel(parsedData.chunk);
            setMessageStream((prev) => prev + newMessageChunk.getContent());
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
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
        const data = (await response.json()) as typeof messages;
        setMessages(data);
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
          const data = (await response.json()) as typeof messages;
          setMessages(data);
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
          {messages
            .map((message) => new MessageModel(message))
            .map((message, index) => {
              if (message.isToolMessage()) {
                return (
                  <div key={index}>
                    <strong>Tool:</strong> {message.getContent()}
                  </div>
                );
              } else if (message.isAIMessage() || message.isAIMessageChunk()) {
                return (
                  <div key={index}>
                    <strong>AI:</strong> {message.getContent()}
                  </div>
                );
              } else if (message.isHumanMessage()) {
                return (
                  <div key={index}>
                    <strong>You:</strong> {message.getContent()}
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
        <div>
          {messageStream && (
            <div>
              <strong>You:</strong> {messageStream}
            </div>
          )}
        </div>
        {loading && 'Loading...'}
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
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
          <button
            type="button"
            onClick={stopChatSocket}
            disabled={!subscriptionActive}
          >
            Stop
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
