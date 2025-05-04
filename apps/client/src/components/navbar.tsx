'use client';

import type React from 'react';
import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, LogOut, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

type NavbarProps = {
  backToHref?: string;
};

export const Navbar: React.FC<NavbarProps> = ({ backToHref }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      setIsLoading(true);
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
            setUsername(data.username);
            setIsLoggedIn(true);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          setUsername(null);
          setIsLoggedIn(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername(null);
    setIsLoggedIn(false);
    router.push('/');
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex items-center justify-end p-4 h-14">
      {!!backToHref && (
        <Button
          className="mr-auto bg-white/80 !rounded-full !border-none hover:bg-white"
          size="icon"
          onClick={() => router.push(backToHref)}
        >
          <ArrowLeftIcon />
        </Button>
      )}
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ) : isLoggedIn && username ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${username}`}
                  alt={username}
                />
                <AvatarFallback>{getInitials(username)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">Hi {username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
};
