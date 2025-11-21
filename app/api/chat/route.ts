import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getInvestorPersonaById } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com',
});

function buildSystemPrompt(persona: any, currentScore: number): string {
  const style = persona.talking_style_json || {};

  return `${persona.investment_thesis}

INVESTOR PROFILE:
- Name: ${persona.name}
- Role: ${persona.role}
- Region: ${persona.region}
- Risk Appetite: ${persona.risk_appetite}
- Target Sectors: ${persona.target_sector}
- Check Size: ${persona.check_size}

COMMUNICATION STYLE:
- Bluntness Level: ${style.bluntness}/10 (1=gentle, 10=brutally direct)
- Jargon Level: ${style.jargon_level}
- Favorite Term: "${style.favorite_word}"
- Humor: ${style.humor}/10

CURRENT FUNDING PROBABILITY: ${currentScore}%

RESPONSE FORMAT:
You must respond in valid JSON with this exact structure:
{
  "reply_text": "Your response to the founder (2-4 sentences, direct and challenging)",
  "score_adjustment": <number between -20 and 20>,
  "feedback_hidden": "Internal reasoning for your score adjustment"
}

SCORING GUIDELINES:
- Strong answers with data/metrics: +10 to +20
- Good but incomplete answers: +3 to +9
- Vague or unclear answers: -5 to -10
- Red flags or concerning answers: -10 to -20
- Current score affects your tone: below 30% = very skeptical, above 70% = more engaged

Be ${style.bluntness > 7 ? 'brutally direct and challenging' : style.bluntness > 4 ? 'firm but fair' : 'supportive but probing'}. Always use your favorite term "${style.favorite_word}" when relevant. Challenge assumptions specific to ${persona.risk_appetite} and ${persona.target_sector}.`;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, investorId, provider = 'openai', currentScore = 50 } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const persona = await getInvestorPersonaById(investorId);

    if (!persona) {
      return NextResponse.json(
        { error: 'Investor persona not found' },
        { status: 404 }
      );
    }

    const systemPrompt = buildSystemPrompt(persona, currentScore);

    const formattedMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role === 'investor' ? 'assistant' : msg.role,
        content: msg.content,
      })),
    ];

    const client = provider === 'deepseek' ? deepseek : openai;
    const model = provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';

    const completion = await client.chat.completions.create({
      model,
      messages: formattedMessages,
      temperature: 0.8,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content || '{"reply_text":"I need more information.","score_adjustment":0,"feedback_hidden":"No response"}';

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (parseError) {
      parsedResponse = {
        reply_text: responseContent,
        score_adjustment: 0,
        feedback_hidden: 'Failed to parse response',
      };
    }

    const scoreAdjustment = Math.max(-20, Math.min(20, parsedResponse.score_adjustment || 0));

    return NextResponse.json({
      content: parsedResponse.reply_text || responseContent,
      probabilityChange: scoreAdjustment,
      feedbackHidden: parsedResponse.feedback_hidden || '',
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your configuration.' },
        { status: 401 }
      );
    }

    if (error?.code === 'ENOTFOUND') {
      return NextResponse.json(
        { error: 'Cannot connect to AI service. Please check your internet connection.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    );
  }
}
