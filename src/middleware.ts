import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Only protect /internal routes
  if (!request.nextUrl.pathname.startsWith("/internal")) {
    return NextResponse.next();
  }

  const auth = request.headers.get("authorization");

  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [user, pass] = decoded.split(":");
      const validUser = process.env.INTERNAL_DASH_USER || "admin";
      const validPass = process.env.INTERNAL_DASH_PASS;

      if (validPass && user === validUser && pass === validPass) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="GEO Monitor Internal"',
    },
  });
}

export const config = {
  matcher: ["/internal/:path*"],
};
