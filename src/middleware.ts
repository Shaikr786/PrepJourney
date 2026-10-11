import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  const isProtected =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/sessions") ||
    nextUrl.pathname.startsWith("/dsa") ||
    nextUrl.pathname.startsWith("/revision") ||
    nextUrl.pathname.startsWith("/notes") ||
    nextUrl.pathname.startsWith("/blog") ||
    nextUrl.pathname.startsWith("/timer") ||
    nextUrl.pathname.startsWith("/insights") ||
    nextUrl.pathname.startsWith("/hours") ||
    nextUrl.pathname.startsWith("/practice") ||
    nextUrl.pathname.startsWith("/scores");

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sessions/:path*",
    "/dsa/:path*",
    "/revision/:path*",
    "/notes/:path*",
    "/blog/:path*",
    "/timer/:path*",
    "/insights/:path*",
    "/hours/:path*",
    "/practice/:path*",
    "/profile/:path*",
    "/files/:path*",
    "/leaderboard/:path*",
    "/skills/:path*",
    "/progress/:path*",
    "/scores/:path*",
    "/login",
    "/register",
  ],
};
