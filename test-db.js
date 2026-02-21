
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://piyushgarg8764_db_user:xZHEOQUHGiXf9ph6@cluster0.frsxxwd.mongodb.net/gofitt?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
    try {
        console.log("Connecting...");
        await client.connect();
        console.log("Connected!");
    } catch (err) {
        console.log("ERROR_MESSAGE:", err.message);
        if (err.reason) console.log("REASON:", err.reason);
    } finally {
        await client.close();
    }
}
run();
