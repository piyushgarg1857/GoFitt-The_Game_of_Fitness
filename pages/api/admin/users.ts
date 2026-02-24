import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { getAdminFromRequest } from '../../../lib/adminAuth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const admin = getAdminFromRequest(req);
    if (!admin) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { db } = await connectToDatabase();

    // GET - List all users with pagination
    if (req.method === 'GET') {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const search = (req.query.search as string) || '';
            const skip = (page - 1) * limit;

            const filter: any = {};
            if (search) {
                filter.$or = [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ];
            }

            const [users, total] = await Promise.all([
                db.collection('users')
                    .find(filter, { projection: { password: 0 } })
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit)
                    .toArray(),
                db.collection('users').countDocuments(filter),
            ]);

            const formatted = users.map(u => ({
                id: u._id.toString(),
                username: u.username,
                email: u.email,
                avatar_url: u.avatar_url,
                total_points: u.total_points || 0,
                total_distance: u.total_distance || 0,
                active_streak: u.active_streak || 0,
                activity_banned: u.activity_banned || false,
                created_at: u.created_at,
            }));

            return res.status(200).json({
                success: true,
                users: formatted,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (error: any) {
            console.error('Admin users list error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // DELETE - Delete a user
    if (req.method === 'DELETE') {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            const oid = new ObjectId(userId);

            // Delete user and all their related data
            await Promise.all([
                db.collection('users').deleteOne({ _id: oid }),
                db.collection('runs').deleteMany({ user_id: userId }),
                db.collection('territories').deleteMany({ user_id: userId }),
                db.collection('activities').deleteMany({ user_id: userId }),
                db.collection('friend_requests').deleteMany({
                    $or: [{ sender_id: userId }, { receiver_id: userId }],
                }),
            ]);

            return res.status(200).json({ success: true, message: 'User and all related data deleted' });
        } catch (error: any) {
            console.error('Admin delete user error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // PUT - Update user data (admin override)
    if (req.method === 'PUT') {
        try {
            const { userId, updates } = req.body;
            if (!userId || !updates) {
                return res.status(400).json({ error: 'userId and updates are required' });
            }

            delete updates.password;
            delete updates._id;
            updates.updated_at = new Date();

            await db.collection('users').updateOne(
                { _id: new ObjectId(userId) },
                { $set: updates }
            );

            return res.status(200).json({ success: true, message: 'User updated' });
        } catch (error: any) {
            console.error('Admin update user error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
