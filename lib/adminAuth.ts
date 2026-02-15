import type { NextApiRequest } from 'next';
import { getUserFromRequest, JWTPayload } from './auth';

// Admin emails - add your admin email(s) here
const ADMIN_EMAILS = [
    'admin@gofitt.com',
    'piyushgarg@gofitt.com',
    'piyushgarg8764@gmail.com',
];

// Also check via env variable
const ADMIN_EMAIL_ENV = process.env.ADMIN_EMAIL || '';

export function isAdmin(payload: JWTPayload): boolean {
    const adminList = [...ADMIN_EMAILS];
    if (ADMIN_EMAIL_ENV) {
        adminList.push(ADMIN_EMAIL_ENV);
    }
    return adminList.includes(payload.email);
}

export function getAdminFromRequest(req: NextApiRequest): JWTPayload | null {
    const payload = getUserFromRequest(req);
    if (!payload) return null;
    if (!isAdmin(payload)) return null;
    return payload;
}
