import { NextRequest, NextResponse } from "next/server";
import { signIn, signUp, signOut, getSession } from "@/lib/auth/auth";

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.endsWith("/session")) {
    const session = await getSession();
    return NextResponse.json({ session });
  }

  return NextResponse.json({ status: "ok" });
}

export async function POST(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const body = await request.json().catch(() => ({}));

  if (pathname.endsWith("/sign-in") || pathname.endsWith("/login")) {
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    const result = await signIn(email, password);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    return NextResponse.json({ success: true, user: result.user });
  }

  if (pathname.endsWith("/sign-up") || pathname.endsWith("/register")) {
    const { name, email, password } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    const result = await signUp(name, email, password);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, user: result.user });
  }

  if (pathname.endsWith("/sign-out") || pathname.endsWith("/logout")) {
    await signOut();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
}
