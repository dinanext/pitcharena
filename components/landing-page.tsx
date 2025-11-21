'use client';

import { useState, useEffect } from 'react';
import { InvestorPersona } from '@/lib/types';
import { getInvestorPersonas } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, LogIn, LogOut, Globe, TrendingUp, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ThemeSwitcher } from '@/components/theme-switcher';

export function LandingPage() {
  const router = useRouter();
  const [personas, setPersonas] = useState<InvestorPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadPersonas() {
      const data = await getInvestorPersonas();
      setPersonas(data);
      setLoading(false);
    }
    loadPersonas();

    async function checkUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    checkUser();
  }, []);

  const handleStartPitch = (personaId: string) => {
    router.push(`/arena/${personaId}`);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-white/60 dark:bg-black/60 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold neon-text">PitchArena</h1>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            {user ? (
              <Button
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.refresh();
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <section className="text-center mb-20 md:mb-32">
          <div className="flex justify-center mb-6">
            <Zap className="w-16 h-16 md:w-20 md:h-20 text-primary animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
            <span className="neon-text">PitchArena</span>
          </h1>
          <p className="text-2xl md:text-4xl font-semibold text-gray-300 mb-4">
            Master Your Pitch.
          </p>
          <p className="text-2xl md:text-4xl font-semibold text-gray-300 mb-8">
            Battle the AI Sharks.
          </p>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Practice your startup pitch with AI investors. Get real-time feedback,
            watch your funding probability shift, and learn what it takes to close the deal.
          </p>
        </section>

        <section>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            Select Your Investor
          </h2>

          {loading ? (
            <div className="text-center text-gray-400 py-12">
              <div className="animate-pulse">Loading investors...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {personas.map((persona) => (
                <Card
                  key={persona.id}
                  className="glass-card-hover cursor-pointer border-2 overflow-hidden"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      {persona.avatar_url ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/30">
                          <img
                            src={persona.avatar_url}
                            alt={persona.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-primary/30">
                          <Globe className="w-12 h-12 text-primary" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-2xl mb-1">{persona.name}</CardTitle>
                    <CardDescription className="text-base text-primary font-semibold">
                      {persona.role}
                    </CardDescription>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">{persona.region}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-gray-400">Risk:</span>
                        <span className="text-gray-200 font-medium">{persona.risk_appetite.split(',')[0]}</span>
                      </div>
                      <div className="flex items-center justify-between px-2">
                        <span className="text-gray-400">Sector:</span>
                        <span className="text-gray-200 font-medium text-xs">{persona.target_sector.split(',')[0]}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 px-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-bold">{persona.check_size}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStartPitch(persona.id)}
                      className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-6 text-lg neon-border mt-4"
                    >
                      Start Pitch
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mt-20 md:mt-32 text-center">
          <div className="glass-card max-w-3xl mx-auto p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-primary">
              How It Works
            </h3>
            <div className="space-y-6 text-left">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Choose Your Investor</h4>
                  <p className="text-gray-400">
                    Each AI has a unique personality and focus area.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Pitch Your Startup</h4>
                  <p className="text-gray-400">
                    Answer their questions and defend your business model.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Watch the Probability</h4>
                  <p className="text-gray-400">
                    Your funding probability changes based on your responses. Hit 100% to win!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
