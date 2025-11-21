'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Trophy, XCircle } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  result: 'win' | 'lose' | null;
  investorName: string;
}

export function GameOverModal({ isOpen, result, investorName }: GameOverModalProps) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (result === 'win') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  const handleTryAgain = () => {
    router.push('/');
  };

  if (!result) return null;

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: i % 2 === 0 ? '#00ff9d' : '#ffffff',
                }}
              />
            ))}
          </div>
        </div>
      )}

      <Dialog open={isOpen}>
        <DialogContent className="glass-card border-2 max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              {result === 'win' ? (
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                  <Trophy className="w-12 h-12 text-primary" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-destructive" />
                </div>
              )}
            </div>
            <DialogTitle className="text-3xl text-center">
              {result === 'win' ? (
                <span className="neon-text">You Got The Deal!</span>
              ) : (
                <span className="text-destructive">Pitch Rejected</span>
              )}
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-4">
              {result === 'win' ? (
                <>
                  <p className="mb-4">
                    Congratulations! {investorName} is ready to invest in your startup.
                  </p>
                  <div className="glass-card p-4 text-left space-y-2">
                    <h4 className="font-semibold text-primary">Term Sheet Summary:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Investment Amount: $2M</li>
                      <li>• Valuation: $10M (Post-Money)</li>
                      <li>• Equity: 20%</li>
                      <li>• Board Seat: Yes</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-4">
                    {investorName} has decided not to invest at this time.
                  </p>
                  <div className="glass-card p-4 text-left">
                    <h4 className="font-semibold text-destructive mb-2">
                      Rejection Email:
                    </h4>
                    <p className="text-sm text-gray-300 italic">
                      &ldquo;Thank you for presenting your startup. While we appreciate
                      the opportunity, we don&apos;t feel this aligns with our investment
                      thesis at this time. We wish you the best of luck with your
                      venture.&rdquo;
                    </p>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              onClick={handleTryAgain}
              className="w-full bg-primary hover:bg-primary/90 text-black font-semibold py-6"
            >
              Try Another Investor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .confetti-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: fall 3s linear infinite;
        }

        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
