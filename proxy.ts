import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Proxy para proteger rutas que requieren autenticación.
 * 
 * NOTA: En Next.js 16, middleware.ts ha sido renombrado a proxy.ts
 * para clarificar su propósito y evitar confusión con Express.js middleware.
 *
 * Rutas protegidas:
 * - /diary - Diario personal del usuario
 * - /collections - Colecciones de quotes del usuario
 * - /episodes/[id] - Para dejar ratings y notas
 * - /characters/[id] - Para comentarios y follows
 *
 * Si el usuario no está autenticado, redirige a /login con el callbackUrl.
 */
export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthenticated = !!session?.user;
  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación
  const protectedPaths = [
    "/diary",
    "/collections",
    "/episodes/",
    "/characters/",
  ];

  const isProtectedRoute = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Redirigir a login si no está autenticado y está intentando acceder a una ruta protegida
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirigir a home si está autenticado y está intentando acceder a login/register
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
