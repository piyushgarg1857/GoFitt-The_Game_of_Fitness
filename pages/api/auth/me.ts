import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { getUserFromRequest } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const payload = getUserFromRequest(req);
        if (!payload) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { db } = await connectToDatabase();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(payload.userId) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

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
    } catch (error: any) {
        console.error('Me error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
