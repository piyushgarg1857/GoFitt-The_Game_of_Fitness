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

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 30;
        const type = (req.query.type as string) || '';
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (type) {
            filter.type = type;
        }

        const [activities, total] = await Promise.all([
            db.collection('activities')
                .find(filter)
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            db.collection('activities').countDocuments(filter),
        ]);

        const formatted = activities.map(a => ({
            id: a._id.toString(),
            user_id: a.user_id,
            username: a.username,
            type: a.type,
            text: a.text,
            created_at: a.created_at,
        }));

        return res.status(200).json({
            success: true,
            activities: formatted,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error('Admin activities error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
