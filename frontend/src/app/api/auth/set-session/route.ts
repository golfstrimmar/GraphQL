import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { user, token } = await request.json();

  const res = NextResponse.json({ ok: true });

  // токен — httpOnly
  res.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
  });

  // весь user — обычная кука (чтобы layout мог прочитать и отдать в StateProvider)
  res.cookies.set("user", JSON.stringify(user), {
    httpOnly: false,
    path: "/",
  });

  return res;
}
