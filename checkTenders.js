require("dotenv").config();
const { initDb, getSettings, upsertTenderIfNew, markEmailed, pool } = require("./db");
const { searchTenders, getRecentTenders } = require("./mcpClient");
const { sendTenderAlert } = require("./mailer");

// Ihale MCP'nin gercek donus alan adlarini bilmiyoruz (canli test edemedim),
// bu yuzden birkac olasi alan adini deniyoruz. Ilk gercek calistirmada
// konsol ciktisini kontrol edip gerekirse burayi birlikte duzeltiriz.
function normalizeTender(raw) {
  return {
    ikn: raw.ikn || raw.tender_id || raw.id || JSON.stringify(raw).slice(0, 100),
    title: raw.title || raw.tender_title || raw.name || raw.isin_adi,
    tender_type: raw.tender_type || raw.type,
    city: raw.city || raw.province || raw.il,
    authority: raw.authority || raw.idare || raw.authority_name,
    tender_date: raw.tender_date || raw.date || raw.ihale_tarihi,
    status: raw.status || raw.tender_status,
    raw,
  };
}

async function run() {
  await initDb();
  const settings = await getSettings();

  if (!settings.email || !settings.tender_types.length) {
    console.log("Ayarlar henuz tamamlanmamis (email / ihale turu / sehir secilmemis). Kontrol atlandi.");
    await pool.end();
    return;
  }

  console.log("Ariyor:", settings.tender_types, settings.cities);

  let result;
  try {
    result = await searchTenders({
      tenderTypes: settings.tender_types,
      provinces: settings.cities,
      limit: 100,
    });
  } catch (err) {
    console.error("MCP arama hatasi:", err.message);
    await pool.end();
    return;
  }

  const rawList = Array.isArray(result) ? result : result?.tenders || result?.results || [];
  console.log(`Bulunan ihale sayisi: ${rawList.length}`);
  if (rawList.length) {
    console.log("Ornek kayit (alan adlarini kontrol icin):", JSON.stringify(rawList[0], null, 2));
  }

  const newTenders = [];
  for (const raw of rawList) {
    const t = normalizeTender(raw);
    const isNew = await upsertTenderIfNew(t);
    if (isNew) newTenders.push(t);
  }

  console.log(`Yeni ihale sayisi: ${newTenders.length}`);

  if (newTenders.length) {
    try {
      await sendTenderAlert(settings.email, newTenders);
      for (const t of newTenders) await markEmailed(t.ikn);
      console.log("E-posta gonderildi:", settings.email);
    } catch (err) {
      console.error("E-posta gonderme hatasi:", err.message);
    }
  }

  await pool.end();
}

run().catch((err) => {
  console.error("Beklenmeyen hata:", err);
  process.exit(1);
});
