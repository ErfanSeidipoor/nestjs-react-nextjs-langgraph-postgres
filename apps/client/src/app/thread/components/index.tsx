'use client';

import { format } from 'date-fns';
import {
  ArrowUpIcon,
  CalendarIcon,
  Loader2,
  MessageSquarePlus,
} from 'lucide-react';

import { Navbar } from '@/components/navbar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useData } from './index.hook';

export const Index = () => {
  const data = useData();

  const renderBody = () => {
    return (
      <Card className="mb-8 bg-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5" />
            Start a New Thread
          </CardTitle>
          <CardDescription>
            Create a new conversation by typing your message below
          </CardDescription>
        </CardHeader>
        <form onSubmit={data.handleSubmit}>
          <CardContent className="relative">
            <Input
              value={data.message}
              onChange={(e) => data.setMessage(e.target.value)}
              placeholder="Ask anything"
              className="h-14 text-white/80"
              disabled={data.isSubmitting}
            />
            {data.error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{data.error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              disabled={!data.message.trim() || data.isSubmitting}
              className="absolute right-8 top-2.5 !rounded-full border-none text-black/80 bg-white hover:bg-white/80"
              size="icon"
            >
              {data.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpIcon />
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    );
  };

  const renderThreadsContent = () => {
    if (data.isLoading)
      return (
        <div className="space-y-4 flex flex-col">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    if (!data.threads.length)
      return (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquarePlus className="mb-2 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">No threads yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first thread to get started
            </p>
          </CardContent>
        </Card>
      );
    return (
      <div className="flex flex-col gap-2">
        {data.threads
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .map((thread, index) => (
            <div key={thread.id}>
              {index === 0 && (
                <div className="flex items-center gap-4 my-3">
                  <CalendarIcon className="h-3 w-3" />
                  {format(new Date(thread.createdAt), 'PPp')}
                </div>
              )}
              {index !== 0 &&
                !data.areSameDate(
                  new Date(thread.createdAt),
                  new Date(data.threads?.[index - 1].createdAt)
                ) && (
                  <div className="flex items-center gap-4 my-3">
                    <CalendarIcon className="h-3 w-3" />
                    {format(new Date(thread.createdAt), 'PPp')}
                  </div>
                )}

              <Card
                className="bg-white/20 cursor-pointer transition-all hover:shadow-md hover:bg-white/60 p-4"
                onClick={() => data.router.push(`/thread/${thread.id}`)}
              >
                <CardHeader className="p-0">
                  <CardTitle className="line-clamp-1">{thread.title}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          ))}
      </div>
    );
  };

  const renderThreads = () => {
    return (
      <div className="sticky left-0 top-0 w-60 min-w-60 bg-slate-950 p-4 shadow-gray-500 shadow-lg">
        <h3 className="mb-4">History</h3>
        {renderThreadsContent()}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="w-full] min-h-[calc(100vh-3.5rem)] bg-black/60 flex gap-1">
        {renderThreads()}
        <div className="m-auto w-full max-w-[800px] h-full flex flex-col justify-center">
          <h1 className="mb-6 text-3xl font-bold text-center">
            Got a question?
          </h1>

          {renderBody()}
        </div>
      </div>
    </div>
  );
};
