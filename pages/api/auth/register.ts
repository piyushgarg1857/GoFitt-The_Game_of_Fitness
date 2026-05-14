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
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // Input sanitization
        const cleanUsername = String(username).trim().replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30);
        const cleanEmail = String(email).trim().toLowerCase().slice(0, 254);
        const cleanPassword = String(password);

        if (cleanUsername.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 alphanumeric characters' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }
        if (cleanPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        if (cleanPassword.length > 128) {
            return res.status(400).json({ error: 'Password too long' });
        }

        const { db } = await connectToDatabase();
        const users = db.collection('users');

        // Check if user exists
        const existingUser = await users.findOne({ $or: [{ email: cleanEmail }, { username: cleanUsername }] });
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email or username already exists' });
        }

        // Hash password with 14 rounds (2024+ standard)
        const hashedPassword = await bcrypt.hash(cleanPassword, 14);

        // Create user document
        const now = new Date();
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`;
        const result = await users.insertOne({
            username: cleanUsername,
            email: cleanEmail,
            password: hashedPassword,
            avatar_url: avatarUrl,
            total_distance: 0,
            total_points: 0,
            active_streak: 0,
            last_run_date: null,
            created_at: now,
            updated_at: now,
        });

        const token = signToken({
            userId: result.insertedId.toString(),
            email: cleanEmail,
            username: cleanUsername,
        });

        res.setHeader('Set-Cookie', serialize('gofitt_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        }));

        return res.status(201).json({
            success: true,
            user: {
                id: result.insertedId.toString(),
                username: cleanUsername,
                email: cleanEmail,
                avatar_url: avatarUrl,
                total_distance: 0,
                total_points: 0,
                active_streak: 0,
            },
        });
    } catch (error: unknown) {
        if (process.env.NODE_ENV !== 'production') console.error('Register error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
