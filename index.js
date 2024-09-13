// index.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const shortid = require("shortid");

dotenv.config();
console.log(process.env.MONGO_URI);
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// URL Schema
const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
  urlCode: String,
  date: { type: String, default: Date.now },
});

const Url = mongoose.model("Url", urlSchema);

// Routes
app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;
  const urlCode = shortid.generate();
  const shortUrl = `${process.env.BASE_URL}/${urlCode}`;

  const newUrl = new Url({
    originalUrl,
    shortUrl,
    urlCode,
  });

  await newUrl.save();
  res.json(newUrl);
});

app.get("/:code", async (req, res) => {
  const url = await Url.findOne({ urlCode: req.params.code });

  if (url) {
    return res.redirect(url.originalUrl);
  } else {
    return res.status(404).json("No URL found");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
