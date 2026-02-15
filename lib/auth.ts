import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'gofitt-super-secret-key-change-in-production-2026';

export interface JWTPayload {
    userId: string;
    email: string;
    username: string;
}

export function signToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

export function getUserFromRequest(req: NextApiRequest): JWTPayload | null {
    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        return verifyToken(token);
    }

    // Fallback to cookie
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.gofitt_token;
    if (token) {
        return verifyToken(token);
    }

    return null;
}
