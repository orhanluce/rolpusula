# Yayınlama

Ürün kodu ile aday çalışma alanını ayır. Repo dışındaki özel başvuru klasörlerini
hiçbir zaman bu repoya kopyalama. Kontroller yalnızca bilinen sızıntı biçimlerini
yakar; diff ve dosya listesini de elle incele.

    npm test
    npm run check
    npm run build

dist içinde:

- rolpusula-source-VERSION.zip: kaynak ve boş Claude şablonları.
- rolpusula-extension-VERSION.zip: yalnızca eklenti; manifest ZIP kökünde.
- SHA256SUMS.txt: paketlerin SHA-256 değerleri.

GitHub'da yeni herkese açık repo oluştur, bu temiz ürünü push et. Security
ayarlarında private vulnerability reporting ve secret scanning seçeneklerini
hesabının desteklediği ölçüde etkinleştir. Kişisel workspace'in remote'u olmamalı.

Sürüm için package.json ve extension/manifest.json değerlerini birlikte değiştir.
CHANGELOG ekle, testleri çalıştır, ardından v0.1.0 gibi sürüm etiketi oluşturup
push et. release.yml etiketi doğrular, temiz kaynaktan paket üretir ve GitHub
Release'e yükler. Kaynak ZIP'i içinde test raporları, CV'ler ve yerel ayarlar yoktur.

## Tarayıcı mağazaları

Elle kurulum için mağaza hesabı gerekmez. Tek tıkla mağaza kurulumu için
Chrome Web Store ve/veya Microsoft Edge Add-ons geliştirici hesabı, mağaza
incelemesi, ekran görüntüleri ve erişilebilir bir gizlilik politikası URL'si gerekir.
Hesap/ücret/inceleme tamamlanmadan mağaza bağlantısı veya rozet yayımlama.

Başvuru paketinde single purpose: kullanıcının seçtiği iş ilanını yerel kaydetme,
profilindeki kelimelerle karşılaştırma ve kullanıcı onayıyla dışa aktarma.
İzin gerekçeleri PRIVACY.md'deki tabloda; telemetry/sale/remote-code yoktur.
Mağazanın veri beyanlarını gerçek akışla doldur; Claude'a manuel aktarımı gizleme.
Şifreli yedeği veya gerçek kullanıcının CV'sini ekran görüntüsüne koyma.

Comet için ayrı uzantı paketi gerektirmeyen Chromium Manifest V3 hedeflenir.
Yine de Comet kurulumu test edilmeden bu sürüm için kesin uyumluluk beyan etme.
