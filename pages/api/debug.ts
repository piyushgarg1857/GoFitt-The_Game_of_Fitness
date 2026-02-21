
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({
        hasMongoUri: !!process.env.MONGODB_URI,
        mongoUriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 15) : 'none',
        nodeVersion: process.version,
    });
}
