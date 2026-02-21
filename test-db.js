
const { MongoClient } = require('mongodb');
const uri = "mongodb://atlas-sql-6991725871e9178181d3986e-gaxngb.z.query.mongodb.net/gofitt?ssl=true&authSource=admin";

async function run() {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    try {
        console.log("Connecting...");
        await client.connect();
        console.log("Connected!");
        const db = client.db("gofitt");
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections);
    } catch (err) {
        console.error("Connection error:", err.message);
    } finally {
        await client.close();
    }
}
run();
