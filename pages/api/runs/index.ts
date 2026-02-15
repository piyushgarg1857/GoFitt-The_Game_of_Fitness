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

    // GET - Fetch runs
    if (req.method === 'GET') {
        try {
            const runs = await db.collection('runs')
                .find({ user_id: payload.userId })
                .sort({ created_at: -1 })
                .toArray();

            const formatted = runs.map((r) => {
                const durationMinutes = Math.round((r.duration || 0) / 60);
                const distance = r.distance || 0;
                const paceMinutes = distance > 0 ? Math.floor(durationMinutes / distance) : 0;
                const paceSeconds = distance > 0 ? Math.round(((durationMinutes / distance) % 1) * 60) : 0;

                return {
                    id: r._id.toString(),
                    date: new Date(r.created_at).toLocaleDateString(),
                    distance: Math.round(distance * 100) / 100,
                    duration: durationMinutes,
                    pace: `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`,
                };
            });

            return res.status(200).json({ success: true, runs: formatted });
        } catch (error: any) {
            console.error('Runs fetch error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // POST - Save a new run
    if (req.method === 'POST') {
        try {
            const { distance, duration, path } = req.body;

            if (!distance || !duration) {
                return res.status(400).json({ error: 'Distance and duration are required' });
            }

            const now = new Date();

            // Insert run
            const result = await db.collection('runs').insertOne({
                user_id: payload.userId,
                distance,
                duration,
                path: path || [],
                created_at: now,
            });

            // Update user stats (atomic increment)
            const points = Math.round(distance * 10);
            await db.collection('users').updateOne(
                { _id: new ObjectId(payload.userId) },
                {
                    $inc: {
                        total_distance: distance,
                        total_points: points,
                        active_streak: 1,
                    },
                    $set: {
                        last_run_date: now,
                        updated_at: now,
                    },
                }
            );

            // Insert activity event for realtime feed
            await db.collection('activities').insertOne({
                user_id: payload.userId,
                username: payload.username,
                type: 'run_completed',
                text: `${payload.username} completed a ${distance.toFixed(2)}km run!`,
                created_at: now,
            });

            return res.status(201).json({
                success: true,
                run: { id: result.insertedId.toString(), distance, duration },
            });
        } catch (error: any) {
            console.error('Run save error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
