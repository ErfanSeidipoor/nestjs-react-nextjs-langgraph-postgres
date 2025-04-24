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
  const [subscription, setSubscription] = useState<(() => void) | null>(null);

  const startSubscription = () => {
    if (subscriptionActive) return; // Prevent multiple subscriptions

    const eventSource = new EventSource('http://localhost:4000/sse');

    const sseObservable = new Observable<MessageEvent<string>>((subscriber) => {
      eventSource.onopen = () => {
        console.log('SSE connection opened');
      };

      eventSource.onmessage = (event) => {
        console.log('New message:', event);
        subscriber.next(event);
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        subscriber.error(error);
      };

      return () => {
        eventSource.close();
        console.log('SSE connection closed');
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

    setSubscription(() => () => {
      subscriptionCleanup.unsubscribe();
      setSubscriptionActive(false);
    });
    setSubscriptionActive(true);
  };

  const stopSubscription = () => {
    if (subscription) {
      subscription();
      setSubscription(null);
    }
  };

  return (
    <div>
      <h1>Server-Sent Events</h1>
      <button onClick={startSubscription} disabled={subscriptionActive}>
        Start Subscription
      </button>
      <br />
      <button onClick={stopSubscription} disabled={!subscriptionActive}>
        Stop Subscription
      </button>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
};

export default SSEComponent;