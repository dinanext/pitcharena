'use client';

import { Message, InvestorPersona } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingDown, User, Loader2, TrendingUp, Globe } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  investorIcon?: string;
  isThinking: boolean;
  persona?: InvestorPersona | null;
}

export function ChatWindow({ messages, investorIcon, isThinking, persona }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScoreIndicator, setShowScoreIndicator] = useState<{ messageId: string; score: number } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'investor' && lastMessage.scoreAdjustment !== undefined && lastMessage.scoreAdjustment !== 0) {
      setShowScoreIndicator({ messageId: lastMessage.id, score: lastMessage.scoreAdjustment });
      const timer = setTimeout(() => {
        setShowScoreIndicator(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-6 pb-6 space-y-6 flex flex-col">
      {messages.length === 0 && (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center text-gray-500">
            <p className="text-lg">Start your pitch below...</p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <Avatar className="w-10 h-10 flex-shrink-0">
            {message.role === 'investor' && persona?.avatar_url && (
              <AvatarImage src={persona.avatar_url} alt={persona.name} />
            )}
            <AvatarFallback
              className={
                message.role === 'user'
                  ? 'bg-gray-700'
                  : 'bg-primary/20 border border-primary/30'
              }
            >
              {message.role === 'user' ? (
                <User className="w-5 h-5" />
              ) : (
                <Globe className="w-5 h-5 text-primary" />
              )}
            </AvatarFallback>
          </Avatar>

          <div
            className={`flex-1 max-w-[80%] ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div className="relative inline-block">
              <div
                className={`p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary text-black'
                    : 'glass-card'
                }`}
              >
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>

              {message.role === 'investor' &&
               showScoreIndicator?.messageId === message.id &&
               showScoreIndicator.score !== 0 && (
                <div
                  className={`absolute -right-2 -top-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold animate-in fade-in zoom-in duration-300 ${
                    showScoreIndicator.score > 0
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {showScoreIndicator.score > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {showScoreIndicator.score > 0 ? '+' : ''}
                    {showScoreIndicator.score}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-1 px-2 text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      ))}

      {isThinking && (
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            {persona?.avatar_url && (
              <AvatarImage src={persona.avatar_url} alt={persona.name} />
            )}
            <AvatarFallback className="bg-primary/20 border border-primary/30">
              <Globe className="w-5 h-5 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
