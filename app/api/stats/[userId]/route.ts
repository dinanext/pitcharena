import { NextRequest, NextResponse } from 'next/server';
import { getUserPitchStats } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const stats = await getUserPitchStats(userId);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in GET /api/stats/[userId]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
