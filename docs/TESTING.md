# Test ve doğrulama

Gerçek aday verisi kullanma. Test örnekleri kurmacadır.

    npm test
    npm run check
    npm run build

Çekirdek testleri: şifreleme/gizlilik, yanlış parola, değiştirilmiş ciphertext,
URL şemaları/takip temizliği, bozuk paketler, anahtar kelime sınırları, saklama,
dosya yolu geçişi, sembolik bağlantı, mevcut dizini ezmeme ve ZIP bütünlüğü.

## Gerçek Chromium eklenti testi

Playwright geliştirici aracıdır; ürünün çalışma zamanı bağımlılığı değildir.

    npm install --ignore-scripts
    npx playwright install chromium
    npm run test:browser

Windows Edge için:

    $env:ROL_BROWSER_CHANNEL = "msedge"
    npm run test:browser

Edge'in uzantı yönetimi sürüme göre değişebilir; kurumsal politikalar veya dağıtım
kanalı komut satırından yüklemeyi kapatabilir. Otomasyon açılamazsa sonucu
başarılı sayma; elle kur ve kalan kontrolü ayrıca kaydet. Referans otomasyon
Playwright'ın paketli Chromium sürümüdür.

Test geçici ve temiz bir tarayıcı profili açar; mevcut kullanıcı tarayıcısına
dokunmaz. Test çıktısı test-output altında kalır ve paketlenmez.
Ana ekran, şifreli kayıt, yeniden açma, yanlış parola, önizleme/onay,
başvuru paketi, yedekleme ve silme yollarını kontrol eder.

## Elle kontrol

Gerçek ilan sayfasında eklenti simgesine tıkla ve ilan yakalamayı dene.
Giriş formu / gizli metin / iframe içeren sayfada yalnızca görünür ilanı almalı.
İlan alanı yoksa açıklayıcı hata ve elle yapıştırma yolu sunmalı.
Başka sekmelere kalıcı erişim olmamalı. Form gönderme olmamalı.

Her desteklenen çalışma zamanında kurmaca bir profille setup → apply-local akışını
çalıştır. Claude/Gemini slash komutlarını; Codex/Ollama `$rolpusula` becerisini
kullanır. Ayrı alt ajan varsa gerçekten çalışmalı; yoksa raporlanan ayrı eleştiri
turu uygulanmalı. PDF'lerin metin katmanı ve görünümü incelenmeli. Otomatik test
bunu bütün modeller çalışmış gibi göstermez.

Sağlayıcı yönlendirmesini model çağırmadan denetlemek için:

    node bin/rolpusula.mjs providers
    node bin/rolpusula.mjs init ../fictional-workspace --provider codex
    node bin/rolpusula.mjs provider set ../fictional-workspace ollama --model YOUR_LOCAL_MODEL
    node bin/rolpusula.mjs doctor ../fictional-workspace

Gerçek CV kullanma. Ollama testi bile yalnızca kurmaca içerikle yapılmalıdır.

TeX kurulumu hazırsa dağıtımdaki boş PDF şablonlarını model çağırmadan denetle:

    npm run test:pdf

Bu komut iki şablonu shell escape kapalı derler ve metin katmanını denetler;
ön yazının bir sayfa olmasını ister. Çıktılar test-output/pdf altında kalır.
Ardından PDF'leri görüntüye çevirip sayfaları gözle kontrol et. Metin katmanının
var olması tek başına ATS kabulü veya doğru görsel yerleşim kanıtı değildir.

## Sınırlar

Chromium/Edge testinin geçmesi Comet'te test yapıldığı anlamına gelmez.
Yerel test kaydını docs/VERIFICATION.md dosyasında bulabilirsin.
