export interface TalkingStyle {
  bluntness: number;
  jargon_level: string;
  favorite_word: string;
  humor: number;
}

export interface InvestorPersona {
  id: string;
  name: string;
  role: string;
  region: string;
  language_code: string;
  avatar_url: string | null;
  risk_appetite: string;
  target_sector: string;
  check_size: string;
  investment_thesis: string;
  talking_style_json: TalkingStyle;
  created_at?: string;
}

export interface Investor {
  id: string;
  name: string;
  title: string;
  description: string;
  personality: string;
  icon: string;
}

export interface Message {
  id: string;
  role: 'user' | 'investor';
  content: string;
  timestamp: Date;
  scoreAdjustment?: number;
  feedbackHidden?: string;
}

export interface ChatState {
  investorId: string;
  messages: Message[];
  fundingProbability: number;
  isThinking: boolean;
}

export interface PitchSession {
  id: string;
  user_id: string;
  persona_id: string;
  chat_transcript: Message[];
  funding_probability: number;
  outcome: 'win' | 'lose' | null;
  created_at: string;
  updated_at: string;
}
