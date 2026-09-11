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

Kendi Claude hesabında /setup → /apply-local akışını kurmaca bir profille çalıştır.
İkinci ajan gerçekten çalışmalı, üretilen PDF'ler derlenip metin katmanı/görünüm
incelenmeli. Otomatik test bunu LLM çalışmış gibi göstermez.

TeX kurulumu hazırsa dağıtımdaki boş PDF şablonlarını model çağırmadan denetle:

    npm run test:pdf

Bu komut iki şablonu shell escape kapalı derler ve metin katmanını denetler;
ön yazının bir sayfa olmasını ister. Çıktılar test-output/pdf altında kalır.
Ardından PDF'leri görüntüye çevirip sayfaları gözle kontrol et. Metin katmanının
var olması tek başına ATS kabulü veya doğru görsel yerleşim kanıtı değildir.

## Sınırlar

Chromium/Edge testinin geçmesi Comet'te test yapıldığı anlamına gelmez.
Yerel test kaydını docs/VERIFICATION.md dosyasında bulabilirsin.
