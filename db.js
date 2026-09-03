const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      email TEXT,
      tender_types INTEGER[] DEFAULT '{}',
      cities INTEGER[] DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tenders (
      ikn TEXT PRIMARY KEY,
      title TEXT,
      tender_type INTEGER,
      city TEXT,
      authority TEXT,
      tender_date TEXT,
      status TEXT,
      raw JSONB,
      first_seen TIMESTAMPTZ DEFAULT now(),
      emailed BOOLEAN DEFAULT false
    );
  `);
  // tek satirlik ayar kaydini garanti altina al
  await pool.query(`
    INSERT INTO settings (id, email, tender_types, cities)
    VALUES (1, NULL, '{}', '{}')
    ON CONFLICT (id) DO NOTHING;
  `);
}

async function getSettings() {
  const { rows } = await pool.query("SELECT * FROM settings WHERE id = 1");
  return rows[0];
}

async function updateSettings({ email, tender_types, cities }) {
  const { rows } = await pool.query(
    `UPDATE settings SET email = $1, tender_types = $2, cities = $3, updated_at = now()
     WHERE id = 1 RETURNING *`,
    [email, tender_types, cities]
  );
  return rows[0];
}

async function upsertTenderIfNew(t) {
  // ayni ikn zaten varsa false doner (yeni degil), yoksa ekler ve true doner
  const { rows } = await pool.query(
    `INSERT INTO tenders (ikn, title, tender_type, city, authority, tender_date, status, raw)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (ikn) DO UPDATE SET status = EXCLUDED.status
     RETURNING (xmax = 0) AS inserted`,
    [t.ikn, t.title, t.tender_type, t.city, t.authority, t.tender_date, t.status, t.raw]
  );
  return rows[0].inserted;
}

async function markEmailed(ikn) {
  await pool.query(`UPDATE tenders SET emailed = true WHERE ikn = $1`, [ikn]);
}

async function listTenders() {
  const { rows } = await pool.query(
    `SELECT ikn, title, tender_type, city, authority, tender_date, status, first_seen
     FROM tenders ORDER BY first_seen DESC LIMIT 200`
  );
  return rows;
}

module.exports = {
  pool,
  initDb,
  getSettings,
  updateSettings,
  upsertTenderIfNew,
  markEmailed,
  listTenders,
};
