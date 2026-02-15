import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { db } = await connectToDatabase();

        // Get top 20 users by points
        const users = await db.collection('users')
            .find({}, { projection: { password: 0 } })
            .sort({ total_points: -1 })
            .limit(20)
            .toArray();

        // Get territory counts for these users
        const userIds = users.map(u => u._id.toString());

        const territoryCounts = await db.collection('territories').aggregate([
            { $match: { user_id: { $in: userIds } } },
            { $group: { _id: '$user_id', count: { $sum: 1 } } },
        ]).toArray();

        const countMap: Record<string, number> = {};
        territoryCounts.forEach((t) => {
            countMap[t._id] = t.count;
        });

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            name: user.username || 'Runner',
            level: Math.floor((user.total_points || 0) / 100) + 1,
            territories: countMap[user._id.toString()] || 0,
            total_points: user.total_points || 0,
            avatar_url: user.avatar_url,
        }));

        return res.status(200).json({ success: true, leaderboard });
    } catch (error: any) {
        console.error('Leaderboard error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
