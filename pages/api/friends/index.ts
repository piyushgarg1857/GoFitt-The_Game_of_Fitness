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
    const friendRequests = db.collection('friend_requests');

    // GET - Fetch pending requests for current user
    if (req.method === 'GET') {
        try {
            const pending = await friendRequests
                .find({
                    receiver_id: payload.userId,
                    status: 'pending',
                })
                .sort({ created_at: -1 })
                .toArray();

            // Enrich with sender info
            const enriched = await Promise.all(
                pending.map(async (req) => {
                    const sender = await db.collection('users').findOne(
                        { _id: new ObjectId(req.sender_id) },
                        { projection: { password: 0 } }
                    );
                    return {
                        id: req._id.toString(),
                        sender_id: req.sender_id,
                        sender: sender ? {
                            username: sender.username,
                            avatar_url: sender.avatar_url,
                        } : null,
                        status: req.status,
                        created_at: req.created_at,
                    };
                })
            );

            return res.status(200).json({ success: true, requests: enriched });
        } catch (error: any) {
            console.error('Friend requests error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // POST - Send a friend request
    if (req.method === 'POST') {
        try {
            const { receiverId } = req.body;

            if (!receiverId) {
                return res.status(400).json({ error: 'receiverId is required' });
            }

            // Check if request already exists
            const existing = await friendRequests.findOne({
                $or: [
                    { sender_id: payload.userId, receiver_id: receiverId },
                    { sender_id: receiverId, receiver_id: payload.userId },
                ],
            });

            if (existing) {
                return res.status(409).json({ error: 'Request already exists or you are already friends.' });
            }

            await friendRequests.insertOne({
                sender_id: payload.userId,
                receiver_id: receiverId,
                status: 'pending',
                created_at: new Date(),
            });

            return res.status(201).json({ success: true });
        } catch (error: any) {
            console.error('Send friend request error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // PUT - Accept a friend request
    if (req.method === 'PUT') {
        try {
            const { requestId } = req.body;

            if (!requestId) {
                return res.status(400).json({ error: 'requestId is required' });
            }

            await friendRequests.updateOne(
                { _id: new ObjectId(requestId) },
                { $set: { status: 'accepted', updated_at: new Date() } }
            );

            return res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Accept friend request error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
