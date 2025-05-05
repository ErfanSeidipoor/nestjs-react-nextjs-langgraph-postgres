'use client';

import {
  ArrowUp,
  Cpu,
  Loader2,
  Radio,
  StopCircle,
  User,
  Wrench,
} from 'lucide-react';
import type React from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { MessageModel } from '@models';
import { useData } from './index.hook';
import ReactMarkdown from 'react-markdown';

interface ChatbotProps {
  threadId: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ threadId }) => {
  const data = useData(threadId);

  const renderTabsMode = () => {
    return (
      <Tabs
        value={data.mode}
        onValueChange={(value) => data.setMode(value as 'api' | 'socket')}
        className="mb-4 fixed top-2.5 left-16"
      >
        <div className="flex items-center justify-between">
          <TabsList className="bg-white rounded-xl shadow-sm shadow-gray-400">
            <TabsTrigger
              value="api"
              className="flex items-center gap-1 !border-none cursor-pointer rounded-l-xl "
            >
              <Cpu className="h-4 w-4" />
              API Mode
            </TabsTrigger>
            <TabsTrigger
              value="socket"
              className="flex items-center gap-1 !border-none cursor-pointer rounded-r-xl"
            >
              <Radio className="h-4 w-4" />
              Streaming Mode
            </TabsTrigger>
          </TabsList>
          {/* <Badge
            className="text-black/80"
            variant={subscriptionActive ? 'default' : 'outline'}
          >
            {subscriptionActive ? 'Streaming Active' : 'Not Streaming'}
          </Badge> */}
        </div>
      </Tabs>
    );
  };

  const renderMessages = () => {
    return (
      <div className="flex-1 overflow-y-auto border bg-black/40 p-4 custom-scrollbar rounded-2xl">
        <div className="space-y-6">
          {data.messages
            .map((message) => new MessageModel(message))
            .map((message, index) => {
              if (message.isToolMessage()) {
                return (
                  <div key={index} className="flex items-start gap-3">
                    <Avatar className="mt-0.5 h-8 w-8 bg-amber-100 text-amber-600">
                      <AvatarFallback className="bg-amber-100">
                        <Wrench className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <Card className="flex-1 overflow-hidden bg-amber-50">
                      <CardContent className="p-3 text-sm">
                        <div className="font-medium text-amber-800">Tool</div>
                        <div className="mt-1 whitespace-pre-wrap text-black/80">
                          <ReactMarkdown>{message.getContent()}</ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              } else if (message.isAIMessage() || message.isAIMessageChunk()) {
                const aiMessageModel = message.getAIMessageModel();
                return (
                  <div key={index} className="flex items-start gap-3">
                    <Avatar className="mt-0.5 h-8 w-8 bg-purple-100 text-purple-600">
                      <AvatarFallback className="bg-purple-100">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <Card className="flex-1 overflow-hidden">
                      <CardContent className="p-3 text-sm bg-zinc-700">
                        <div className="font-medium">Assistant</div>
                        <div className="mt-1 whitespace-pre-wrap">
                          <ReactMarkdown>
                            {message.getContent() ||
                              aiMessageModel?.getToolCallsDisplay()}
                          </ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              } else if (message.isHumanMessage()) {
                return (
                  <div
                    key={index}
                    className="flex flex-row-reverse items-start gap-3 ml-[20%]"
                  >
                    <Avatar className="mt-0.5 h-8 w-8 bg-blue-100 text-blue-600">
                      <AvatarFallback className="bg-blue-100">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <Card className="flex-1 overflow-hidden bg-blue-50">
                      <CardContent className="p-3 text-sm">
                        <div className="font-medium text-blue-800">You</div>
                        <div className="mt-1 whitespace-pre-wrap text-black/80">
                          <ReactMarkdown>{message.getContent()}</ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              } else {
                return (
                  <div key={index} className="flex items-start gap-3">
                    <Avatar className="mt-0.5 h-8 w-8 bg-gray-100">
                      <AvatarFallback className="bg-gray-100">?</AvatarFallback>
                    </Avatar>
                    <Card className="flex-1 overflow-hidden bg-gray-50">
                      <CardContent className="p-3 text-sm">
                        <div className="font-medium">Unknown Message Type</div>
                        <div className="mt-1 overflow-x-auto">
                          <pre className="text-xs">
                            {JSON.stringify(message, null, 2)}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              }
            })}

          {data.messageStream && (
            <div className="flex items-start gap-3">
              <Avatar className="mt-0.5 h-8 w-8 bg-purple-100 text-purple-600">
                <AvatarFallback className="bg-purple-100">AI</AvatarFallback>
              </Avatar>
              <Card className="flex-1 overflow-hidden">
                <CardContent className="p-3 text-sm">
                  <div className="font-medium">Assistant</div>
                  <div className="mt-1 whitespace-pre-wrap">
                    {data.messageStream}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {data.loading && !data.messageStream && (
            <div className="flex items-start gap-3">
              <Avatar className="mt-0.5 h-8 w-8 bg-purple-100 text-purple-600">
                <AvatarFallback className="bg-purple-100">AI</AvatarFallback>
              </Avatar>
              <Card className="flex-1 overflow-hidden">
                <CardContent className="flex items-center p-3 text-sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={data.messagesEndRef} />
        </div>
      </div>
    );
  };

  const renderForm = () => {
    return (
      <div className="mt-4">
        <form onSubmit={data.handleSendMessage} className="relative">
          <Input
            value={data.newMessage}
            onChange={(e) => data.setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={data.loading}
            className="text-white/80 pr-24 py-6 rounded-2xl border border-solid border-white/40 bg-black/40"
            ref={data.inputRef}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
            {data.subscriptionActive && (
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={data.stopChatSocket}
                disabled={!data.subscriptionActive}
                className="h-8 w-8 rounded-full"
              >
                <StopCircle className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="submit"
              size="icon"
              disabled={data.loading || !data.newMessage.trim()}
              className="h-8 w-8 bg-white text-black border-none !rounded-full"
            >
              {data.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-slate-700">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden p-4">
        {renderTabsMode()}

        {data.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{data.error}</AlertDescription>
          </Alert>
        )}

        {renderMessages()}
        {renderForm()}
      </div>
    </div>
  );
};

export default Chatbot;
