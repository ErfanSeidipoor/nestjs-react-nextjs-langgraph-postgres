import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Thread {
  id: string;
  title: string;
  initialPrompt: string | null;
  createdAt: string;
}

export const useData = () => {
  const [message, setMessage] = useState('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      router.push('/');
      return;
    }

    const fetchThreads = async () => {
      setIsLoading(true);
      setError(null);
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
        setError('Failed to load threads. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setIsSubmitting(true);
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
        router.push(`/thread/${data.thread.id}?firstMessage=${message}`);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to create thread. Please try again.');
        setIsSubmitting(false);
      }
    }
  };

  function areSameDate(d1: Date, d2: Date) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  return {
    message,
    setMessage,
    threads,
    setThreads,
    isLoading,
    setIsLoading,
    isSubmitting,
    setIsSubmitting,
    error,
    setError,
    handleSubmit,
    router,
    areSameDate,
  };
};
