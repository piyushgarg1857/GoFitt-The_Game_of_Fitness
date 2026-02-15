import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { signToken } from '../../../lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
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
        const hashedPassword = await bcrypt.hash(password, 12);

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
