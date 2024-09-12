import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes (routes that require authentication)
const isProtectedRoute = createRouteMatcher(['/', '/api/generate-image', '/api/poll-image']);

export default clerkMiddleware((auth, req) => {
    const { userId } = auth();

    if (!userId && isProtectedRoute(req)) {
        return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};