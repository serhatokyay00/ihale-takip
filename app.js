// EKAP ihale turleri (tender_types)
const TENDER_TYPES = [
  { id: 1, label: "Mal Alımı" },
  { id: 2, label: "Yapım İşleri" },
  { id: 3, label: "Hizmet Alımı" },
  { id: 4, label: "Danışmanlık Hizmeti" },
];

// Plaka koduna gore sik kullanilan sehirler (istersen genisletiriz)
const CITIES = [
  { id: 34, label: "İstanbul" }, { id: 6, label: "Ankara" }, { id: 35, label: "İzmir" },
  { id: 16, label: "Bursa" }, { id: 7, label: "Antalya" }, { id: 1, label: "Adana" },
  { id: 27, label: "Gaziantep" }, { id: 42, label: "Konya" }, { id: 55, label: "Samsun" },
  { id: 61, label: "Trabzon" }, { id: 41, label: "Kocaeli" }, { id: 9, label: "Aydın" },
  { id: 48, label: "Muğla" }, { id: 20, label: "Denizli" }, { id: 33, label: "Mersin" },
];

const state = { tender_types: [], cities: [] };

function renderChips(container, items, selected, max) {
  container.innerHTML = "";
  items.forEach((item) => {
    const el = document.createElement("div");
    el.className = "chip" + (selected.includes(item.id) ? " active" : "");
    el.textContent = item.label;
    el.onclick = () => {
      const idx = selected.indexOf(item.id);
      if (idx >= 0) {
        selected.splice(idx, 1);
      } else {
        if (max && selected.length >= max) {
          document.getElementById("status").textContent = `En fazla ${max} tane secebilirsiniz.`;
          return;
        }
        selected.push(item.id);
      }
      renderChips(container, items, selected, max);
    };
    container.appendChild(el);
  });
}

async function loadSettings() {
  const res = await fetch("/api/settings");
  const s = await res.json();
  document.getElementById("email").value = s.email || "";
  state.tender_types = s.tender_types || [];
  state.cities = s.cities || [];
  renderChips(document.getElementById("type-chips"), TENDER_TYPES, state.tender_types, 5);
  renderChips(document.getElementById("city-chips"), CITIES, state.cities, null);
}

async function saveSettings() {
  const email = document.getElementById("email").value.trim();
  const statusEl = document.getElementById("status");
  statusEl.textContent = "Kaydediliyor...";
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, tender_types: state.tender_types, cities: state.cities }),
  });
  if (res.ok) {
    statusEl.textContent = "Kaydedildi ✓";
  } else {
    const err = await res.json();
    statusEl.textContent = "Hata: " + (err.error || "bilinmiyor");
  }
}

async function loadTenders() {
  const listEl = document.getElementById("tender-list");
  const res = await fetch("/api/tenders");
  const rows = await res.json();
  if (!rows.length) {
    listEl.innerHTML = "Henüz kayıtlı ihale yok. Ayarları tamamladıktan sonra ilk kontrol çalıştığında burada listelenecek.";
    return;
  }
  listEl.innerHTML = rows
    .map(
      (t) => `<div class="tender"><b>${t.title || "(başlık yok)"}</b>
      ${t.city || ""} — ${t.authority || ""}<br/>
      <span class="muted">İhale tarihi: ${t.tender_date || "-"} | Görülme: ${new Date(t.first_seen).toLocaleDateString("tr-TR")}</span></div>`
    )
    .join("");
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.tab;
    document.getElementById("tenders-view").classList.toggle("hidden", target !== "tenders");
    document.getElementById("settings-view").classList.toggle("hidden", target !== "settings");
  };
});

document.getElementById("save-btn").onclick = saveSettings;

loadSettings();
loadTenders();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}
