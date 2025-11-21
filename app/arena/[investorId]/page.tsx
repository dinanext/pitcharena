'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getInvestorPersonaById } from '@/lib/supabase';
import { InvestorPersona, Message } from '@/lib/types';
import { ChatSidebar } from '@/components/chat-sidebar';
import { ChatWindow } from '@/components/chat-window';
import { ChatInput } from '@/components/chat-input';
import { GameOverModal } from '@/components/game-over-modal';
import { AIProviderSelector } from '@/components/ai-provider-selector';
import { Button } from '@/components/ui/button';
import { Menu, Home, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ThemeSwitcher } from '@/components/theme-switcher';

export default function ArenaPage() {
  const params = useParams();
  const router = useRouter();
  const personaId = params.investorId as string;
  const [user, setUser] = useState<any>(null);

  const [persona, setPersona] = useState<InvestorPersona | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [fundingProbability, setFundingProbability] = useState(50);
  const [isThinking, setIsThinking] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [aiProvider, setAIProvider] = useState<'openai' | 'deepseek'>('openai');

  useEffect(() => {
    async function loadPersona() {
      const data = await getInvestorPersonaById(personaId);
      setPersona(data);
      setLoading(false);

      if (!data) {
        router.push('/');
      }
    }

    async function checkUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }

    loadPersona();
    checkUser();
  }, [personaId, router]);

  useEffect(() => {
    if (!persona || messages.length > 0) return;

    const openingMessage: Message = {
      id: '1',
      role: 'investor',
      content: `Welcome! I'm ${persona.name}, ${persona.role} from ${persona.region}. I focus on ${persona.target_sector} with check sizes around ${persona.check_size}. Tell me about your startup - what problem are you solving and why should I care?`,
      timestamp: new Date(),
    };
    setMessages([openingMessage]);
  }, [persona, messages.length]);

  useEffect(() => {
    if (fundingProbability >= 100) {
      setGameResult('win');
    } else if (fundingProbability <= 0) {
      setGameResult('lose');
    }
  }, [fundingProbability]);

  const handleSendMessage = async (content: string) => {
    if (isThinking || gameResult) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          investorId: personaId,
          provider: aiProvider,
          currentScore: fundingProbability,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const scoreChange = data.probabilityChange || 0;
      const newProbability = Math.max(
        0,
        Math.min(100, fundingProbability + scoreChange)
      );
      setFundingProbability(newProbability);

      const investorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'investor',
        content: data.content,
        timestamp: new Date(),
        scoreAdjustment: scoreChange,
        feedbackHidden: data.feedbackHidden,
      };

      setMessages((prev) => [...prev, investorResponse]);
      setMessageCount((prev) => prev + 1);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'investor',
        content: 'I apologize, but I seem to be having technical difficulties. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg text-gray-400">Investor not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SheetTitle className="sr-only">Investor Details</SheetTitle>
              <ChatSidebar
                persona={persona}
                fundingProbability={fundingProbability}
              />
            </SheetContent>
          </Sheet>

          <h1 className="text-xl md:text-2xl font-bold neon-text">PitchArena</h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <AIProviderSelector
            currentProvider={aiProvider}
            onProviderChange={setAIProvider}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push('/');
                router.refresh();
              }}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <ChatSidebar persona={persona} fundingProbability={fundingProbability} />
        </aside>

        <main className="flex-1 flex flex-col">
          <ChatWindow
            messages={messages}
            investorIcon="globe"
            isThinking={isThinking}
            persona={persona}
          />
          <ChatInput onSendMessage={handleSendMessage} disabled={isThinking || !!gameResult} />
        </main>
      </div>

      <GameOverModal
        isOpen={!!gameResult}
        result={gameResult}
        investorName={persona.name}
      />
    </div>
  );
}
