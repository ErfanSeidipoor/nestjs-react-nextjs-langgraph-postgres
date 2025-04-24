'use client';

import React, { useState } from 'react';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface MessageEventData {
  hello: string;
}

const SSEComponent: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const continueChat = (chatId: string) => {
    if (subscriptionActive) return; // Prevent multiple subscriptions

    const userToken = 'yourUserTokenHere'; // Replace with actual token
    const additionalParams = { param1: 'value1', param2: 'value2' }; // Replace with actual parameters
    const queryParams = new URLSearchParams({
      userToken,
      ...additionalParams,
    }).toString();

    console.log({ queryParams });

    const eventSource = new EventSource(`http://localhost:4000/sse/${chatId}?${queryParams}`);

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
        console.error('SSE error:', error);
        setError(JSON.stringify(error));
        subscriber.error(error);
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
            console.error('Error parsing SSE data:', error, event.data);
            return `Error: Could not parse message: ${event.data}`;
          }
        })
      )
      .subscribe((message) => {
        console.log('subscribe > ', message as MessageEventData);
        setMessages((prevMessages) => [...prevMessages, JSON.stringify(message)]);
      });

    setUnsubscribe(() => () => {
      subscriptionCleanup.unsubscribe();
      setSubscriptionActive(false);
    });
    setSubscriptionActive(true);
  };

  const stop = () => {
    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
    }
  };

  return (
    <div>
      <h1>Server-Sent Events</h1>
      <button onClick={() => continueChat('chatId')} disabled={subscriptionActive}>
        Start Subscription
      </button>
      <br />
      <button onClick={stop} disabled={!subscriptionActive}>
        Stop Subscription
      </button>
      {loading && <div>Loading...</div>}
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
    </div>
  );
};

export default SSEComponent;