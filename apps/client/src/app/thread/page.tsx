'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';

interface Thread {
  id: string;
  title: string;
  initialPrompt: string | null;
  createdAt: string;
}

function Thread(): React.JSX.Element {
  const [message, setMessage] = useState('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      router.push('/');
    }

    const fetchThreads = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await fetch('http://localhost:4000/thread', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(`Failed to fetch threads: ${errorText}`);
        }

        const data = await response.json();
        setThreads(data);
      } catch (error) {
        console.error('Error fetching threads:', error);
      }
    };

    fetchThreads();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await fetch('http://localhost:4000/thread', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({
            title: message.substring(0, 50), // First 50 characters of the message
            prompt: message,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create thread');
        }

        const data = await response.json();
        console.log('Thread created:', data);

        // Redirect to the thread page
        router.push(`/thread/${data.thread.id}`);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setMessage('');
      }
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Start a Thread</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
      <h2>Threads</h2>
      <ul>
        {threads.map((thread) => (
          <li key={thread.id}>
            <h3>{thread.title}</h3>
            <p>Created At: {new Date(thread.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Thread;
