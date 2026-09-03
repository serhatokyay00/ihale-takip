# İhale Takip

Tüm dosyalar tek klasörde (alt klasör yok) — telefon tarayıcısından tek seferde GitHub'a yüklenebilir.

## 1) Kodu GitHub'a yükle
1. GitHub'da repo aç (adı önemli değil).
2. Repo sayfasında "Add file" -> "Upload files" (ya da "..." menüsünden "Upload files").
3. Bu klasördeki 13 dosyanın HEPSİNİ birden seç (hepsi aynı seviyede, alt klasör yok) ve yükle.
4. "Commit changes".

## 2) Veritabanı - Neon.tech (ücretsiz)
neon.tech'te ücretsiz hesap aç, proje oluştur, bağlantı adresini (postgres://...) kopyala. Buna DATABASE_URL diyeceğiz.

## 3) Gmail uygulama şifresi
myaccount.google.com/security -> 2 Adımlı Doğrulama aç -> "Uygulama Şifreleri" -> oluştur -> 16 haneli şifreyi kopyala. GMAIL_USER = kendi Gmail adresin, GMAIL_APP_PASSWORD = bu şifre.

## 4) Render.com'a deploy
1. render.com'da GitHub ile giriş yap.
2. "New +" -> "Blueprint" -> yukleddiğin repoyu seç.
3. Render, render.yaml'ı okuyup iki servis kuracak: web arayüzü + günde 5 kez çalışan kontrol görevi.
4. İstenen ortam değişkenlerini gir: DATABASE_URL (her iki servise), GMAIL_USER ve GMAIL_APP_PASSWORD (sadece check servisine).
5. Deploy'a bas, bekle.

## 5) Telefona kur
Render'ın verdiği web adresini telefonda aç, tarayıcı menüsünden "Ana ekrana ekle". Ayarlar sekmesinden e-posta, ihale türü (en fazla 5), şehir seç, Kaydet.

## Not
İhale verisini çeken kaynak (İhale MCP) topluluk yapımı, açık kaynak bir araç. İlk kontrol çalıştıktan sonra Render'daki "check" servisinin Logs kısmına bak, "Ornek kayit" diye başlayan satırı bana gönder — gerekirse birlikte hızlıca düzeltiriz.
