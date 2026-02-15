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

    if (req.method === 'PUT') {
        try {
            const updates = req.body;
            // Prevent updating sensitive fields
            delete updates.password;
            delete updates._id;
            delete updates.email;

            updates.updated_at = new Date();

            await db.collection('users').updateOne(
                { _id: new ObjectId(payload.userId) },
                { $set: updates }
            );

            const user = await db.collection('users').findOne(
                { _id: new ObjectId(payload.userId) },
                { projection: { password: 0 } }
            );

            return res.status(200).json({
                success: true,
                user: {
                    id: user!._id.toString(),
                    username: user!.username,
                    email: user!.email,
                    avatar_url: user!.avatar_url,
                    total_distance: user!.total_distance || 0,
                    total_points: user!.total_points || 0,
                    active_streak: user!.active_streak || 0,
                },
            });
        } catch (error: any) {
            console.error('Profile update error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
