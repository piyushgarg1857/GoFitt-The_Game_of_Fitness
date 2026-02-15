import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { getUserFromRequest } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const payload = getUserFromRequest(req);
    if (!payload) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { db } = await connectToDatabase();

    // GET - Search users by username
    if (req.method === 'GET') {
        try {
            const { q } = req.query;
            const query = (q as string) || '';

            if (query.length < 2) {
                return res.status(200).json({ success: true, users: [] });
            }

            const users = await db.collection('users')
                .find(
                    {
                        username: { $regex: query, $options: 'i' },
                        _id: { $ne: new ObjectId(payload.userId) },
                    },
                    { projection: { password: 0 } }
                )
                .limit(10)
                .toArray();

            const formatted = users.map((u) => ({
                id: u._id.toString(),
                username: u.username,
                email: u.email,
                avatar_url: u.avatar_url,
                total_points: u.total_points || 0,
                total_distance: u.total_distance || 0,
                active_streak: u.active_streak || 0,
            }));

            return res.status(200).json({ success: true, users: formatted });
        } catch (error: any) {
            console.error('User search error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
