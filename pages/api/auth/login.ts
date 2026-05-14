import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { signToken } from '../../../lib/auth';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';

const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
    const record = rateLimitMap.get(ip) || [0, Date.now()];
    const now = Date.now();
    // Reset if older than 1 minute
    if (now - record[1] > 60000) {
        rateLimitMap.set(ip, [1, now]);
        return true;
    }
    record[0] += 1;
    rateLimitMap.set(ip, record);
    return record[0] <= 5; // Max 5 requests per minute
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip as string)) {
        return res.status(429).json({ error: 'Too many requests, please try again later' });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Input sanitization
        const cleanEmail = String(email).trim().toLowerCase().slice(0, 254);
        const cleanPassword = String(password);

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }
        if (cleanPassword.length > 128) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const { db } = await connectToDatabase();
        const users = db.collection('users');

        const user = await users.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValid = await bcrypt.compare(cleanPassword, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
        });

        res.setHeader('Set-Cookie', serialize('gofitt_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        }));

        return res.status(200).json({
            success: true,
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url,
                total_distance: user.total_distance || 0,
                total_points: user.total_points || 0,
                active_streak: user.active_streak || 0,
            },
        });
    } catch (error: unknown) {
        if (process.env.NODE_ENV !== 'production') console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
