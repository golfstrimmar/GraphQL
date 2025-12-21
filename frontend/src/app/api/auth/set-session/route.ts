import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId, token } = await request.json();

  const res = NextResponse.json({ ok: true });

  // Примеры: можешь хранить либо userId, либо сам token
  res.cookies.set("userId", String(userId), {
    httpOnly: true,
    path: "/",
  });

  res.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
  });

  return res;
}
