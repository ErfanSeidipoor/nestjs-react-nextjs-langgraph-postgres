'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';

function Chat(): React.JSX.Element {
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Message sent to server:', message);
      setMessage('');
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Start a Chat</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
