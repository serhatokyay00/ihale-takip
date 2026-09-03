require("dotenv").config();
const express = require("express");
const path = require("path");
const { initDb, getSettings, updateSettings, listTenders } = require("./db");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/settings", async (req, res) => {
  try {
    const s = await getSettings();
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    const { email, tender_types, cities } = req.body;
    if (tender_types && tender_types.length > 5) {
      return res.status(400).json({ error: "En fazla 5 ihale turu secebilirsiniz." });
    }
    const s = await updateSettings({
      email,
      tender_types: tender_types || [],
      cities: cities || [],
    });
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/tenders", async (req, res) => {
  try {
    const rows = await listTenders();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/healthz", (req, res) => res.send("ok"));

const PORT = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Sunucu calisiyor: ${PORT}`));
  })
  .catch((err) => {
    console.error("DB baslatma hatasi:", err);
    process.exit(1);
  });
