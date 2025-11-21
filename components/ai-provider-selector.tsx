'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, Check } from 'lucide-react';

interface AIProviderSelectorProps {
  currentProvider: 'openai' | 'deepseek';
  onProviderChange: (provider: 'openai' | 'deepseek') => void;
}

export function AIProviderSelector({ currentProvider, onProviderChange }: AIProviderSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card border-gray-700">
        <DropdownMenuLabel className="text-primary">AI Provider</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem
          onClick={() => onProviderChange('openai')}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <span>OpenAI (GPT-4o-mini)</span>
            {currentProvider === 'openai' && <Check className="w-4 h-4 text-primary" />}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onProviderChange('deepseek')}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <span>DeepSeek</span>
            {currentProvider === 'deepseek' && <Check className="w-4 h-4 text-primary" />}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
