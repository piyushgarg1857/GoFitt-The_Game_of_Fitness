import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { getAdminFromRequest } from '../../../lib/adminAuth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const admin = getAdminFromRequest(req);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    const { db } = await connectToDatabase();

    // GET – list all feedback (paginated)
    if (req.method === 'GET') {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [feedback, total] = await Promise.all([
            db.collection('feedback')
                .find({})
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            db.collection('feedback').countDocuments(),
        ]);

        const formatted = feedback.map(f => ({
            id: f._id.toString(),
            user_id: f.user_id,
            username: f.username,
            email: f.email,
            type: f.type || 'general',  // bug | feature | general
            message: f.message,
            rating: f.rating,
            status: f.status || 'unread', // unread | read | replied | dismissed
            admin_reply: f.admin_reply || '',
            created_at: f.created_at,
        }));

        return res.status(200).json({
            success: true,
            feedback: formatted,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    }

    // PATCH – update feedback status / add admin reply
    if (req.method === 'PATCH') {
        const { feedbackId, status, admin_reply } = req.body;
        if (!feedbackId) return res.status(400).json({ error: 'feedbackId required' });

        const updates: any = { updated_at: new Date() };
        if (status) updates.status = status;
        if (admin_reply !== undefined) updates.admin_reply = admin_reply;

        await db.collection('feedback').updateOne(
            { _id: new ObjectId(feedbackId) },
            { $set: updates }
        );

        return res.status(200).json({ success: true, message: 'Feedback updated' });
    }

    // DELETE – remove a feedback entry
    if (req.method === 'DELETE') {
        const { feedbackId } = req.body;
        if (!feedbackId) return res.status(400).json({ error: 'feedbackId required' });
        await db.collection('feedback').deleteOne({ _id: new ObjectId(feedbackId) });
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
