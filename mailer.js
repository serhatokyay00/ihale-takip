const nodemailer = require("nodemailer");

function getTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

async function sendTenderAlert(toEmail, tenders) {
  if (!toEmail || !tenders.length) return;
  const transport = getTransport();

  const listHtml = tenders
    .map(
      (t) => `<li><b>${t.title || "(başlık yok)"}</b><br/>
      ${t.city || ""} — ${t.authority || ""}<br/>
      İhale tarihi: ${t.tender_date || "-"} | IKN: ${t.ikn}</li>`
    )
    .join("<hr/>");

  await transport.sendMail({
    from: process.env.GMAIL_USER,
    to: toEmail,
    subject: `Yeni ihale bildirimi (${tenders.length} adet)`,
    html: `<h3>Kriterlerinize uyan yeni ihale(ler) bulundu:</h3><ul>${listHtml}</ul>`,
  });
}

module.exports = { sendTenderAlert };
