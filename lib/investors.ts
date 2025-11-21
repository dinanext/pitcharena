import { Investor } from './types';

export const investors: Investor[] = [
  {
    id: 'marc',
    name: 'Marc The Skeptic',
    title: 'Numbers-Driven Investor',
    description: 'Aggressive, data-focused, and obsessed with metrics. Show him the money or get out.',
    personality: 'skeptic',
    icon: 'TrendingDown',
  },
  {
    id: 'sarah',
    name: 'Sarah The Visionary',
    title: 'Future-Focused Investor',
    description: 'Empathetic and forward-thinking. She invests in dreams, missions, and the bigger picture.',
    personality: 'visionary',
    icon: 'Sparkles',
  },
  {
    id: 'ben',
    name: 'Ben The Techie',
    title: 'Tech Stack Expert',
    description: 'Lives in the code. He drills into your architecture, scalability, and technical decisions.',
    personality: 'techie',
    icon: 'Code',
  },
];

export const getMockResponse = (investorId: string, messageCount: number): string => {
  const responses: Record<string, string[]> = {
    marc: [
      "Alright, let's cut to the chase. What's your revenue? Give me hard numbers.",
      "I need to see traction. How many paying customers do you have right now?",
      "Customer acquisition cost? Lifetime value? Give me the unit economics.",
      "Your burn rate concerns me. How long is your runway?",
      "What's stopping a competitor with deeper pockets from crushing you?",
      "These projections seem optimistic. Walk me through your assumptions.",
    ],
    sarah: [
      "I love the vision. But tell me, what problem are you really solving for people?",
      "How does this make the world better? What's the impact you're aiming for?",
      "Who's on your team? Are they as passionate about this mission as you are?",
      "What's your long-term vision? Where do you see this in 10 years?",
      "I'm interested in the why. Why you? Why now? Why this problem?",
      "The market opportunity is interesting, but tell me about the human element.",
    ],
    ben: [
      "Walk me through your tech stack. What did you build this on and why?",
      "How are you handling scale? What happens when you 10x your user base?",
      "Security and data privacy - how are you approaching this?",
      "Is this proprietary technology, or are you just wrapping existing APIs?",
      "What's your deployment pipeline look like? How fast can you ship features?",
      "Tell me about your data architecture. How are you storing and processing information?",
    ],
  };

  const investorResponses = responses[investorId] || responses.marc;
  return investorResponses[messageCount % investorResponses.length];
};

export const getOpeningStatement = (investorId: string): string => {
  const openings: Record<string, string> = {
    marc: "Alright, you've got 5 minutes to convince me why I should write a check. Make it count.",
    sarah: "Welcome! I'm excited to hear your story. Tell me about your journey and what inspired this idea.",
    ben: "Hey there. I've seen a lot of startups. Let's talk tech. What are you building and how?",
  };

  return openings[investorId] || openings.marc;
};
