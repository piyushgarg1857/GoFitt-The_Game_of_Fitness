import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { getAdminFromRequest } from '../../../lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const admin = getAdminFromRequest(req);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    const { db } = await connectToDatabase();

    // GET – fetch current trailer info
    if (req.method === 'GET') {
        const doc = await db.collection('settings').findOne({ key: 'trailer' });
        return res.status(200).json({
            success: true,
            trailer: doc ? {
                url: doc.url,
                title: doc.title,
                description: doc.description,
                updated_at: doc.updated_at,
            } : null,
        });
    }

    // POST – save / update trailer info (YouTube embed URL or direct mp4 link)
    if (req.method === 'POST') {
        const { url, title, description } = req.body;
        if (!url) return res.status(400).json({ error: 'Trailer URL is required' });

        await db.collection('settings').updateOne(
            { key: 'trailer' },
            {
                $set: {
                    key: 'trailer',
                    url,
                    title: title || 'GoFit App Trailer',
                    description: description || '',
                    updated_at: new Date(),
                    updated_by: (admin as any).username || 'admin',
                },
            },
            { upsert: true }
        );

        return res.status(200).json({ success: true, message: 'Trailer updated' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
