import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Optional simple API key middleware (recommended for Roblox)
app.use((req, res, next) => {
  const key = req.headers["x-api-key"];
  if (process.env.API_KEY && key !== process.env.API_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
});

const client = new MongoClient(process.env.DB_CONN_STRING);
await client.connect();
const db = client.db(process.env.DB_NAME);
const players = db.collection(process.env.GAMES_COLLECTION_NAME);

// Save player data
app.post("/save", async (req, res) => {
  try {
    const { userid, ...data } = req.body;
    if (!userid) return res.status(400).json({ error: "Missing userid" });
    await players.updateOne({ userid }, { $set: data }, { upsert: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Load player data
app.get("/load/:userid", async (req, res) => {
  try {
    const user = await players.findOne({ userid: parseInt(req.params.userid) });
    res.json(user || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export all data (optional admin route)
app.get("/export", async (req, res) => {
  try {
    const allPlayers = await players.find({}).toArray();
    res.json(allPlayers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Roblox API running on port ${PORT}`));