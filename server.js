import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const uri = process.env.MONGODB_URI; // from Render environment
const client = new MongoClient(uri);
await client.connect();
const db = client.db("DataStore");
const players = db.collection("Players");
const port = process.env.PORT || 3000;

// Save player data
app.post("/save", async (req, res) => {
  const { userId, ...data } = req.body;
  await players.updateOne({ userId }, { $set: data }, { upsert: true });
  res.json({ success: true });
});

// Load player data
app.get("/load/:userId", async (req, res) => {
  const user = await players.findOne({ userId: parseInt(req.params.userId) });
  res.json(user || {});
});

// Export all players (optional admin endpoint)
app.get("/export", async (req, res) => {
  const all = await players.find({}).toArray();
  res.json(all);
});

app.listen(port, () => {
    console.log(`API running on port ${port}`)
});