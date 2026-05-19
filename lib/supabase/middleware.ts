import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
    PROTECTED_ROUTES,
    STUDENT_ROUTES,
    SUPERVISOR_ROUTES,
    LOGIN_ROUTE,
} from "@/lib/routes";

export async function updateSession(request: NextRequest) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", request.nextUrl.pathname);

    let supabaseResponse = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    supabaseResponse = NextResponse.next({
                        request: {
                            headers: requestHeaders,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    );
                },
            },
        }
    );

    // Kullanıcı oturumunu kontrol et
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;
    const isRouteMatch = (routes: string[]) => routes.some((route) => path.startsWith(route));

    const isStudentRoute = isRouteMatch(STUDENT_ROUTES);
    const isSupervisorRoute = isRouteMatch(SUPERVISOR_ROUTES);
    const isDashboardRoot = path === '/dashboard';
    const isProtectedRoute = isRouteMatch(PROTECTED_ROUTES) || isStudentRoute || isSupervisorRoute;

    // 1. Giriş Kontrolü: Korunmuş bir rotaya giriliyorsa ve user yoksa login'e at
    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone();
        url.pathname = LOGIN_ROUTE;
        url.searchParams.set("next", path);
        return NextResponse.redirect(url);
    }

    // 2. Auth Sayfaları Kontrolü: Zaten giriş yapmış birisi auth sayfalarına (/auth/login vs.) girmeye çalışırsa
    if (user && path.startsWith('/auth')) {
        // Log out / signout endpoints may still be valid, but typical login/signup are restricted.
        // Assuming /auth/login, /auth/sign-up, /auth/forgot-password are blocked
        if (path === '/auth/login' || path === '/auth/sign-up' || path === '/auth/forgot-password') {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
    }

    // 3. Rol Kontrolü (RBAC): Eğer korumalı bir rotadaysa rolü kontrol et
    if (user && (isStudentRoute || isSupervisorRoute || isDashboardRoot)) {
        const { data: profile } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const role = profile?.role; // 'STUDENT' veya 'SUPERVISOR'

        if (isDashboardRoot) {
            if (role === 'STUDENT') {
                return NextResponse.redirect(new URL('/dashboard/student', request.url));
            } else if (role === 'SUPERVISOR') {
                return NextResponse.redirect(new URL('/dashboard/supervisor', request.url));
            }
        }

        // Student rotasına Supervisor girmeye çalışırsa veya tersi:
        if (isStudentRoute && role !== 'STUDENT') {
            return NextResponse.redirect(new URL('/', request.url)); // Yetkisizse ana sayfaya
        }

        if (isSupervisorRoute && role !== 'SUPERVISOR') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return supabaseResponse;
}