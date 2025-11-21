import { NextRequest, NextResponse } from 'next/server';
import { getInvestorPersonaById, updateInvestorPersona, deleteInvestorPersona } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const persona = await getInvestorPersonaById(id);

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ persona });
  } catch (error) {
    console.error('Error in GET /api/personas/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch persona' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const persona = await updateInvestorPersona(id, body);

    if (!persona) {
      return NextResponse.json(
        { error: 'Failed to update persona' },
        { status: 500 }
      );
    }

    return NextResponse.json({ persona });
  } catch (error) {
    console.error('Error in PATCH /api/personas/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update persona' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteInvestorPersona(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete persona' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/personas/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete persona' },
      { status: 500 }
    );
  }
}
