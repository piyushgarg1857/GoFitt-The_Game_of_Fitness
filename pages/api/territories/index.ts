import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { db } = await connectToDatabase();

    // GET - Fetch all territories (for map view)
    if (req.method === 'GET') {
        try {
            const territories = await db.collection('territories')
                .find({})
                .sort({ created_at: -1 })
                .limit(500)
                .toArray();

            const formatted = territories.map((t) => ({
                id: t._id.toString(),
                user_id: t.user_id,
                username: t.username,
                coordinates: t.coordinates,
                center_lat: t.center_lat,
                center_lng: t.center_lng,
                area_sq_meters: t.area_sq_meters,
                created_at: t.created_at,
            }));

            return res.status(200).json({ success: true, territories: formatted });
        } catch (error: any) {
            console.error('Territories fetch error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // POST - Create a new territory
    if (req.method === 'POST') {
        const payload = getUserFromRequest(req);
        if (!payload) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        try {
            const { coordinates, center, area } = req.body;

            if (!coordinates || !center || !area) {
                return res.status(400).json({ error: 'coordinates, center, and area are required' });
            }

            const now = new Date();

            const result = await db.collection('territories').insertOne({
                user_id: payload.userId,
                username: payload.username,
                coordinates,
                center_lat: center[1],
                center_lng: center[0],
                area_sq_meters: area,
                created_at: now,
            });

            // Insert activity event
            await db.collection('activities').insertOne({
                user_id: payload.userId,
                username: payload.username,
                type: 'territory_claimed',
                text: `${payload.username} claimed a new territory! (${Math.round(area)} sq meters)`,
                created_at: now,
            });

            return res.status(201).json({
                success: true,
                territory: {
                    id: result.insertedId.toString(),
                    user_id: payload.userId,
                    coordinates,
                    center_lat: center[1],
                    center_lng: center[0],
                    area_sq_meters: area,
                },
            });
        } catch (error: any) {
            console.error('Territory create error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
