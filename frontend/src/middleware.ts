import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isProtectedPath =
    pathname.startsWith("/plaza") ||
    pathname.startsWith("/design") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/figprojcts");
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  console.log("🔹🟢🔹🟢[Middleware]", token);
  // if (!token) {
  //   return NextResponse.redirect(new URL("/login", req.url));
  // }
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", encodeURIComponent(req.url));
    return NextResponse.redirect(loginUrl);
  }

  // Всё ок — пускаем дальше
  return NextResponse.next();
}
export const config = {
  matcher: [
    /*
     * Матчим все пути кроме:
     * - api (API Routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)",
    // или конкретно ваши защищённые пути:
    // '/dashboard/:path*',
    // '/profile/:path*',
  ],
};
