import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { getAdminFromRequest } from '../../../lib/adminAuth';
import { ObjectId } from 'mongodb';

// GET /api/admin/user-profile?userId=xxx
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const admin = getAdminFromRequest(req);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const { db } = await connectToDatabase();

    const [user, runs, territories, activities] = await Promise.all([
        db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } }),
        db.collection('runs').find({ user_id: userId }).sort({ created_at: -1 }).limit(10).toArray(),
        db.collection('territories').find({ user_id: userId }).toArray(),
        db.collection('activities').find({ user_id: userId }).sort({ created_at: -1 }).limit(20).toArray(),
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json({
        success: true,
        profile: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url,
            total_points: user.total_points || 0,
            total_distance: user.total_distance || 0,
            active_streak: user.active_streak || 0,
            activity_banned: user.activity_banned || false,
            activity_banned_at: user.activity_banned_at || null,
            created_at: user.created_at,
            last_active: user.last_active || null,
        },
        runs: runs.map(r => ({
            id: r._id.toString(),
            distance: r.distance,
            duration: r.duration,
            points: r.points,
            created_at: r.created_at,
        })),
        territories: territories.map(t => ({
            id: t._id.toString(),
            area_sq_meters: t.area_sq_meters,
            created_at: t.created_at,
        })),
        activities: activities.map(a => ({
            id: a._id.toString(),
            type: a.type,
            text: a.text,
            created_at: a.created_at,
        })),
    });
}
