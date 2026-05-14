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

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const { db } = await connectToDatabase();
        const users = db.collection('users');

        // Check if user exists
        const existingUser = await users.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email or username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 14);

        // Create user document
        const now = new Date();
        const result = await users.insertOne({
            username,
            email,
            password: hashedPassword,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            total_distance: 0,
            total_points: 0,
            active_streak: 0,
            last_run_date: null,
            created_at: now,
            updated_at: now,
        });

        const token = signToken({
            userId: result.insertedId.toString(),
            email,
            username,
        });

        res.setHeader('Set-Cookie', serialize('gofitt_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        }));

        return res.status(201).json({
            success: true,
            token,
            user: {
                id: result.insertedId.toString(),
                username,
                email,
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                total_distance: 0,
                total_points: 0,
                active_streak: 0,
            },
        });
    } catch (error: any) {
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
