import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Observable } from 'rxjs';

import {
  AIMessageChunkType,
  AIMessageType,
  ClientStatus,
  HumanMessageType,
  MessageModel,
  ToolMessageType,
} from '@models';

export const useData = (threadId: string) => {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<
    (HumanMessageType | ToolMessageType | AIMessageChunkType | AIMessageType)[]
  >([]);

  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'api' | 'socket'>('socket');
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messageStream, setMessageStream] = useState('');
  const [firstMessage, setFirstMessage] = useState('');

  /* -------------------------------- handlers -------------------------------- */

  // Scroll to bottom when messages change

  const continueChatSocket = (message?: string) => {
    if (subscriptionActive) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const queryParams = new URLSearchParams({
      token,
      prompt: !message ? newMessage : message,
    }).toString();

    const eventSource = new EventSource(
      `http://localhost:4000/thread/${threadId}/continue?${queryParams}`
    );

    setNewMessage('');

    const sseObservable = new Observable<MessageEvent<string>>((subscriber) => {
      eventSource.onopen = () => {
        // console.log('SSE connection opened');
        setLoading(true);
      };

      eventSource.onmessage = (event) => {
        const parsedData = JSON.parse(event.data) as ClientStatus;
        // console.log('New message:', parsedData.status, { event, parsedData });
        if (parsedData.status === 'end') {
          eventSource.close();
          setSubscriptionActive(false);
          setLoading(false);
        }
        subscriber.next(event);
      };

      eventSource.onerror = (error) => {
        // console.log('SSE error:setSubscriptionActive:', subscriptionActive);
        eventSource.close();
        setLoading(false);
        setError('Something went wrong. Please try again.');
        setSubscriptionActive(false);
        if (subscriptionActive) {
          console.log({ error });
          setError('Connection error. Please try again.');
          eventSource.close();
          console.log('eventSource.onerror SSE connection closed');
          setLoading(false);
          setSubscriptionActive(false);
        }
      };

      return () => {
        eventSource.close();
        // console.log('SSE connection closed');
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

  const continueChatApi = async (message?: string) => {
    const token = localStorage.getItem('token');
    if (!token || !threadId || !newMessage.trim() || !message?.trim()) return;

    // Add the human message immediately for better UX
    const humanMessage: HumanMessageType = {
      lc: 1,
      type: 'constructor',
      id: ['langchain_core', 'messages', 'HumanMessage'],
      kwargs: {
        content: !message ? newMessage : message,
      },
    };

    setMessages((prevMessages) => [...prevMessages, humanMessage]);

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
        // Filter out the human message we just added to avoid duplication
        const filteredData = data.filter(
          (msg) =>
            !(
              msg.type === 'constructor' &&
              Array.isArray(msg.id) &&
              msg.id[2] === 'HumanMessage' &&
              msg.kwargs?.content === newMessage
            )
        );
        setMessages((prevMessages) => [...prevMessages, ...filteredData]);
        setNewMessage('');
      } else {
        setError('Failed to send message. Please try again.');
        console.error('Failed to send message');
      }
    } catch (error) {
      setError('Error connecting to server. Please try again.');
      console.error('Error sending or continuing thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setError(null);

    if (mode === 'api') {
      continueChatApi();
    } else if (mode === 'socket') {
      continueChatSocket();
    }
  };

  /* -------------------------------- Lifecycle ------------------------------- */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messageStream]);

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
          setError('Failed to fetch messages. Please try again.');
          console.error('Failed to fetch messages');
        }
      } catch (error) {
        setError('Error connecting to server. Please try again.');
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [router, threadId]);

  useEffect(() => {
    // Short timeout to ensure the input is ready
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, loading]);

  useEffect(() => {
    const firstMessageEncode = searchParams.get('firstMessage') || '';
    const firstMessageValue = decodeURIComponent(firstMessageEncode);
    if (firstMessageValue) {
      setFirstMessage(firstMessageValue);
      router.push(`/thread/${threadId}`);
    }
  }, [searchParams.get('firstMessage')]);

  useEffect(() => {
    if (firstMessage) {
      setTimeout(() => {
        if (mode === 'api') {
          console.log('first');
          continueChatApi(firstMessage);
        } else if (mode === 'socket') {
          console.log('second');
          continueChatSocket(firstMessage);
        }
      }, 300);
    }
  }, [firstMessage]);

  return {
    router,
    mode,
    setMode,
    error,
    messages,
    messageStream,
    loading,
    messagesEndRef,
    handleSendMessage,
    newMessage,
    setNewMessage,
    subscriptionActive,
    stopChatSocket,
    inputRef,
  };
};
