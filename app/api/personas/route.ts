import { NextRequest, NextResponse } from 'next/server';
import { getInvestorPersonas, createInvestorPersona } from '@/lib/supabase';

export async function GET() {
  try {
    const personas = await getInvestorPersonas();
    return NextResponse.json({ personas });
  } catch (error) {
    console.error('Error in GET /api/personas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const persona = await createInvestorPersona(body);

    if (!persona) {
      return NextResponse.json(
        { error: 'Failed to create persona' },
        { status: 500 }
      );
    }

    return NextResponse.json({ persona }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/personas:', error);
    return NextResponse.json(
      { error: 'Failed to create persona' },
      { status: 500 }
    );
  }
}
