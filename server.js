const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Use the environment variable you set in Railway, or fall back to your string for local testing
const mongoURI = process.env.MONGO_URI || "mongodb://20255677_db_user:Y0KDM4Jyr4L9JwC7@ac-0fvmner-shard-00-00.95uusml.mongodb.net:27017,ac-0fvmner-shard-00-01.95uusml.mongodb.net:27017,ac-0fvmner-shard-00-02.95uusml.mongodb.net:27017/apptech?ssl=true&replicaSet=atlas-yqgyq6-shard-0&authSource=admin&appName=Cluster0";

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ SUCCESS: Contact Database Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err.message);
  });

const contactSchema = new mongoose.Schema({
  name:    { type: String, required: true, maxlength: 100 },
  email:   { type: String, required: true, maxlength: 200, match: [/^\S+@\S+\.\S+$/, "Invalid email format"] },
  message: { type: String, required: true, maxlength: 2000 }
}, { timestamps: true });

const Contact = mongoose.model("Contact", contactSchema);

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newMessage = await Contact.create({ name, email, message });
    console.log("📩 New Message from:", newMessage.name);
    res.status(201).json({ success: true, message: "Message stored in MongoDB!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/contact", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.delete("/api/contact/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// CRITICAL CHANGE: Listen on the port Railway provides
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});