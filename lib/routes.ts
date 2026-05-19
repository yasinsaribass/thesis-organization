export const ROOT_ROUTE = '/';
export const LOGIN_ROUTE = '/auth/login';
export const DEFAULT_STUDENT_LOGIN_REDIRECT = '/dashboard/student';
export const DEFAULT_SUPERVISOR_LOGIN_REDIRECT = '/dashboard/supervisor';

/**
 * Routes that are accessible to everyone
 * These routes do not require authentication
 */
export const PUBLIC_ROUTES = [
    '/'
];

/**
 * Routes that are used for authentication
 * These routes are accessible to everyone, but might redirect logged-in users
 */
export const AUTH_ROUTES = [
    '/auth',
];

/**
 * Routes that require authentication
 * Any route starting with these prefixes will be protected
 */
export const PROTECTED_ROUTES = [
    '/dashboard',
];

/**
 * Routes that require specific roles
 */
export const STUDENT_ROUTES = [
    '/dashboard/student',
];

export const SUPERVISOR_ROUTES = [
    '/dashboard/supervisor',
];