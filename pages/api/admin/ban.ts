import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { getAdminFromRequest } from '../../../lib/adminAuth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const admin = getAdminFromRequest(req);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    const { db } = await connectToDatabase();

    // POST – ban or unban a user from live activity feed
    if (req.method === 'POST') {
        const { userId, action } = req.body; // action: 'ban' | 'unban'
        if (!userId || !['ban', 'unban'].includes(action)) {
            return res.status(400).json({ error: 'userId and action (ban|unban) required' });
        }

        const oid = new ObjectId(userId);
        await db.collection('users').updateOne(
            { _id: oid },
            {
                $set: {
                    activity_banned: action === 'ban',
                    activity_banned_at: action === 'ban' ? new Date() : null,
                    activity_banned_by: action === 'ban' ? (admin as any).username : null,
                    updated_at: new Date(),
                },
            }
        );

        // If banning: delete all their existing activity feed entries
        if (action === 'ban') {
            await db.collection('activities').deleteMany({ user_id: userId });
        }

        return res.status(200).json({
            success: true,
            message: action === 'ban' ? 'User banned from live activity' : 'User unbanned from live activity',
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
