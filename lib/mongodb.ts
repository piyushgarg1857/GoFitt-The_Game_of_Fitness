import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'gofitt';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is missing from environment variables');
}

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<MongoConnection> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

    try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    // Initialize indexes in the background
    db.collection('users').createIndex({ email: 1 }, { unique: true, background: true }).catch(console.error);
    db.collection('users').createIndex({ username: 1 }, { unique: true, background: true }).catch(console.error);
    db.collection('activities').createIndex({ user_id: 1, created_at: -1 }, { background: true }).catch(console.error);
    db.collection('friend_requests').createIndex({ sender_id: 1, receiver_id: 1 }, { unique: true, background: true }).catch(console.error);

    console.log('Successfully connected to MongoDB');
    return { client, db };
  } catch (error: any) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

export default connectToDatabase;
export { connectToDatabase };
