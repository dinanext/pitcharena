import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60; // seconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secretKey, action } = body as {
      secretKey?: string;
      action?: string;
    };

    if (action === "logout") {
      const res = NextResponse.json({ success: true });
      res.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: "",
        maxAge: 0,
        path: "/",
      });
      return res;
    }

    if (action === "login") {
      const adminKey = process.env.ADMIN_SECRET_KEY;

      if (!adminKey) {
        return NextResponse.json(
          { success: false, error: "Admin key not configured" },
          { status: 500 }
        );
      }

      if (secretKey !== adminKey) {
        return NextResponse.json(
          { success: false, error: "Invalid secret key" },
          { status: 401 }
        );
      }

      const res = NextResponse.json({ success: true });

      // set cookie on the response; options use seconds for maxAge
      res.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: "true",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });

      return res;
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
