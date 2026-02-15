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

    if (req.method === 'GET') {
        try {
            const user = await db.collection('users').findOne(
                { _id: new ObjectId(payload.userId) },
                { projection: { password: 0 } }
            );

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Count territories
            const territoriesCount = await db.collection('territories').countDocuments({
                user_id: payload.userId,
            });

            // Calculate rank
            const higherRankCount = await db.collection('users').countDocuments({
                total_points: { $gt: user.total_points || 0 },
            });

            const totalPoints = user.total_points || 0;
            const level = Math.floor(totalPoints / 100) + 1;
            const xp = totalPoints % 100;

            return res.status(200).json({
                success: true,
                stats: {
                    level,
                    xp,
                    xpToNextLevel: 100,
                    territories: territoriesCount,
                    totalDistance: Math.round((user.total_distance || 0) * 10) / 10,
                    rank: higherRankCount + 1,
                    activeStreak: user.active_streak || 0,
                    caloriesBurned: Math.round((user.total_distance || 0) * 60),
                    hp: Math.min(100, 60 + ((user.active_streak || 0) * 5)),
                    maxHp: 100,
                },
            });
        } catch (error: any) {
            console.error('Stats error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
