import { NextRequest, NextResponse } from 'next/server';
import { getPitchSessions, createPitchSession } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || undefined;

    const sessions = await getPitchSessions(userId);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error in GET /api/sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, personaId } = await request.json();

    if (!userId || !personaId) {
      return NextResponse.json(
        { error: 'userId and personaId are required' },
        { status: 400 }
      );
    }

    const session = await createPitchSession(userId, personaId);

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/sessions:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
