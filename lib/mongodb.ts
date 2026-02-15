import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'gofitt';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

let cached: MongoConnection | null = null;

async function connectToDatabase(): Promise<MongoConnection> {
  if (cached) {
    return cached;
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB);

  cached = { client, db };
  return cached;
}

export default connectToDatabase;
export { connectToDatabase };
