import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { signToken } from '../../../lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { db } = await connectToDatabase();
        const users = db.collection('users');

        const user = await users.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
        });

        return res.status(200).json({
            success: true,
            token,
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
    } catch (error: any) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
