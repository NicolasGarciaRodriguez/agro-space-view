import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register"];
const DASHBOARD_ROUTE = "/dashboard";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("agrospaceview-token")?.value;
  const isAuthenticated = !!token;

  // Raíz → siempre muestra la landing
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Rutas públicas — si ya está autenticado redirige al dashboard
  if (PUBLIC_ROUTES.includes(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(DASHBOARD_ROUTE, request.url));
    }
    return NextResponse.next();
  }

  // Rutas protegidas — si no está autenticado redirige al login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
