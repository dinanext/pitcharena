import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const adminSession = request.cookies.get('admin_session');

        return NextResponse.json({
            success: true,
            hasAccess: adminSession?.value === 'true'
        });
    } catch (error) {
        console.error('Session check failed:', error);
        return NextResponse.json(
            { success: false, hasAccess: false, error: 'Session check failed' },
            { status: 500 }
        );
    }
}