import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { getAdminFromRequest } from '../../../lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const admin = getAdminFromRequest(req);
    if (!admin) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const { db } = await connectToDatabase();

        // Fetch all dashboard stats in parallel
        const [
            totalUsers,
            totalRuns,
            totalTerritories,
            totalActivities,
            recentUsers,
            recentActivities,
        ] = await Promise.all([
            db.collection('users').countDocuments(),
            db.collection('runs').countDocuments(),
            db.collection('territories').countDocuments(),
            db.collection('activities').countDocuments(),
            db.collection('users')
                .find({}, { projection: { password: 0 } })
                .sort({ created_at: -1 })
                .limit(5)
                .toArray(),
            db.collection('activities')
                .find({})
                .sort({ created_at: -1 })
                .limit(10)
                .toArray(),
        ]);

        // Aggregate total distance and points
        const aggregation = await db.collection('users').aggregate([
            {
                $group: {
                    _id: null,
                    totalDistance: { $sum: '$total_distance' },
                    totalPoints: { $sum: '$total_points' },
                    avgStreak: { $avg: '$active_streak' },
                },
            },
        ]).toArray();

        const agg = aggregation[0] || { totalDistance: 0, totalPoints: 0, avgStreak: 0 };

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalRuns,
                totalTerritories,
                totalActivities,
                totalDistance: Math.round((agg.totalDistance || 0) * 10) / 10,
                totalPoints: agg.totalPoints || 0,
                avgStreak: Math.round((agg.avgStreak || 0) * 10) / 10,
            },
            recentUsers: recentUsers.map(u => ({
                id: u._id.toString(),
                username: u.username,
                email: u.email,
                avatar_url: u.avatar_url,
                total_points: u.total_points || 0,
                total_distance: u.total_distance || 0,
                active_streak: u.active_streak || 0,
                created_at: u.created_at,
            })),
            recentActivities: recentActivities.map(a => ({
                id: a._id.toString(),
                username: a.username,
                type: a.type,
                text: a.text,
                created_at: a.created_at,
            })),
        });
    } catch (error: any) {
        console.error('Admin stats error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
