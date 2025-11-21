'use client';

import { useState, KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setMessage((prev) => {
        const newText = prev ? `${prev} ${transcript}` : transcript;
        return newText;
      });
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Voice Input Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (isListening) {
        stopListening();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="border-t border-gray-800 bg-black/40 backdrop-blur-xl p-4">
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : 'Type or speak your pitch response...'}
            disabled={disabled}
            className="min-h-[60px] max-h-[200px] resize-none bg-gray-900/50 border-gray-700 focus:border-primary focus:ring-primary pr-12"
            rows={2}
          />
          {isSupported && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleVoiceInput}
              disabled={disabled}
              className={`absolute right-2 bottom-2 transition-all ${
                isListening
                  ? 'text-red-500 hover:text-red-600 animate-pulse'
                  : 'text-gray-400 hover:text-primary'
              }`}
            >
              {isListening ? (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping" />
                  <MicOff className="w-5 h-5 relative z-10" />
                </div>
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
          )}
        </div>
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-black px-6 h-[60px] neon-border"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">
        {isSupported
          ? 'Press Enter to send, Shift+Enter for new line, or click the microphone to speak'
          : 'Press Enter to send, Shift+Enter for new line'}
      </p>
    </div>
  );
}
