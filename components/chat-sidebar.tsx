'use client';

import { InvestorPersona } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, DollarSign, Target, TrendingUp } from 'lucide-react';

interface ChatSidebarProps {
  persona: InvestorPersona;
  fundingProbability: number;
}

export function ChatSidebar({ persona, fundingProbability }: ChatSidebarProps) {

  const getProgressColor = () => {
    if (fundingProbability >= 75) return 'bg-primary';
    if (fundingProbability >= 50) return 'bg-yellow-500';
    return 'bg-destructive';
  };

  const getStatusText = () => {
    if (fundingProbability >= 80) return 'Highly Interested';
    if (fundingProbability >= 60) return 'Considering';
    if (fundingProbability >= 40) return 'Skeptical';
    if (fundingProbability >= 20) return 'Unconvinced';
    return 'Not Interested';
  };

  return (
    <div className="h-full flex flex-col bg-black/40 backdrop-blur-xl border-r border-gray-800">
      <div className="p-6 space-y-6">
        <Card className="glass-card border-2 border-primary/30">
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
            <CardTitle className="text-xl">{persona.name}</CardTitle>
            <p className="text-sm text-primary font-semibold">{persona.role}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Globe className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">{persona.region}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-xs text-gray-400">Risk Appetite</div>
                  <div className="text-gray-200 font-medium">{persona.risk_appetite}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-xs text-gray-400">Target Sectors</div>
                  <div className="text-gray-200 font-medium text-xs">{persona.target_sector}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <div>
                  <div className="text-xs text-gray-400">Check Size</div>
                  <div className="text-green-400 font-bold">{persona.check_size}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-2">
          <CardHeader>
            <CardTitle className="text-lg text-center">Funding Probability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold neon-text mb-2">
                {fundingProbability}%
              </div>
              <div className="text-sm text-gray-400 font-medium">
                {getStatusText()}
              </div>
            </div>
            <div className="space-y-2">
              <Progress
                value={fundingProbability}
                className="h-4 bg-gray-800"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="glass-card p-4 border border-primary/20">
          <h4 className="text-sm font-semibold mb-2 text-primary">Pro Tip</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            {persona.talking_style_json.bluntness > 7 &&
              'Be direct and data-driven. Show concrete metrics and traction. No fluff.'}
            {persona.talking_style_json.bluntness >= 4 && persona.talking_style_json.bluntness <= 7 &&
              'Balance passion with pragmatism. Show both vision and execution capability.'}
            {persona.talking_style_json.bluntness < 4 &&
              'Emphasize your mission and long-term impact. Show thoughtful, sustainable growth.'}
          </p>
        </div>
      </div>
    </div>
  );
}
