import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // If no token, user needs to login
        if (!token) return false;

        // Allow access if user has valid token
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Protect all routes except login, api/auth, and public assets
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
