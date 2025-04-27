'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function Navbar(): React.JSX.Element {
const [isLoggedIn, setIsLoggedIn] = useState(false);
const router = useRouter();

useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    fetch('http://localhost:4000/user/profile', {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Unauthorized');
        }
      })
      .then((data) => {
        if (data && data.username) {
          localStorage.setItem('username', data.username);
          setIsLoggedIn(true);
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
      });
  }
}, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <span>Hi {localStorage.getItem('username')}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : null}
    </div>
  );
}

export default Navbar;
