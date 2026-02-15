import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { db } = await connectToDatabase();

        // Get recent activities for live feed
        const activities = await db.collection('activities')
            .find({})
            .sort({ created_at: -1 })
            .limit(10)
            .toArray();

        const formatted = activities.map((a) => ({
            id: a._id.toString(),
            user_id: a.user_id,
            username: a.username,
            type: a.type,
            text: a.text,
            created_at: a.created_at,
        }));

        return res.status(200).json({ success: true, activities: formatted });
    } catch (error: any) {
        console.error('Activities error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
