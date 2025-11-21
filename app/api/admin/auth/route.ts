import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60;

export async function POST(request: NextRequest) {
  try {
    const { secretKey, action } = await request.json();

    if (action === 'logout') {
      const cookieStore = await cookies();
      cookieStore.delete(ADMIN_COOKIE_NAME);
      return NextResponse.json({ success: true });
    }

    if (action === 'login') {
      const adminKey = process.env.ADMIN_SECRET_KEY;

      if (!adminKey) {
        return NextResponse.json(
          { success: false, error: 'Admin key not configured' },
          { status: 500 }
        );
      }

      if (secretKey !== adminKey) {
        return NextResponse.json(
          { success: false, error: 'Invalid secret key' },
          { status: 401 }
        );
      }

      const cookieStore = await cookies();
      cookieStore.set(ADMIN_COOKIE_NAME, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
