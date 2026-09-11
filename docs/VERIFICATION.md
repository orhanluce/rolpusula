# Doğrulama kaydı

## 0.2.1 — 11 Eylül 2026

Son kullanıcı kılavuzu, README giriş bağlantıları ve eklenti içi yardım metni
eklendi. Kılavuzdaki komutlar mevcut CLI yardımı ve gizlilik sınırlarıyla
karşılaştırıldı. Node birim testleri **11/11** geçti; yeni test kılavuzun kaynak
paketinde bulunduğunu doğruluyor. Dağıtım/gizlilik taraması 249 dosyada geçti;
12 dosyalı eklenti ZIP'i ve 249 dosyalı kaynak ZIP'i üretildi. PDF/model çalışma
zamanı sınırları 0.2.0 kaydındaki gibidir; bu belge değişikliğinde yeniden çalıştırılmadı.

## 0.2.0 — 11 Eylül 2026

Yalnızca kurmaca geçici çalışma alanı kullanıldı; gerçek CV veya aday profili
kullanılmadı. Node birim testleri **10/10** geçti. Dağıtım/gizlilik taraması 247
dosyada geçti; 12 dosyalı eklenti ZIP'i ve 247 dosyalı kaynak ZIP'i üretildi.
CLI ile Codex çalışma alanı oluşturma, Ollama'ya geçiş ve seçili yerel modelin
tanılanması çalıştı. Codex 0.144.6 + Ollama 0.34.0 üzerinden yerel
`deepseek-r1:latest` modeli kurmaca isteme yanıt verdi.

Gemini CLI bu bilgisayarda kurulu değildi; Gemini komutları ve gizlilik ayarları
statik test edildi ama gerçek Gemini oturumu çalıştırılmadı. Claude ve OpenAI bulut
model akışları da hesap kullanılarak uçtan uca çalıştırılmadı. MiKTeX eksikleri
nedeniyle PDF derleme sınırı aşağıdaki 0.1.0 kaydındaki gibi sürüyor. 0.2.0'da
tarayıcı otomasyonu yeniden çalıştırılmadı; eklenti mantığı değişmedi, yalnız sürüm
metni değişti.

## 0.1.0 — 11 Eylül 2026

Windows üzerinde, yalnızca kurmaca test
verileri ve boş dağıtım şablonları kullanıldı. Gerçek aday CV'si kullanılmadı.

## Geçen kontroller

| Kontrol | Sonuç | Kanıtın sınırı |
|---|---|---|
| Node 22.22.3 çekirdek testleri | 7/7 | Şifreleme, şema, saklama, dosya sınırları ve ZIP birim testleri |
| Chromium 151.0.7922.34 | 8/8 senaryo | Gerçek, temiz profilde yüklenmiş eklenti; API taklidi değil |
| Microsoft Edge 152.0.4191.66 | 8/8 senaryo | Gerçek, temiz profilde yüklenmiş eklenti; test aracı Edge ekranına uyarlandı |
| LinkedIn CLI, Bun 1.4.2 | 62/62 | Ayrıştırma, komut bayrakları, taklit ağ yanıtları, hata ve tekrar deneme yolları |
| freehire CLI, Bun 1.4.2 | 44/44 | Aynı kapsam; canlı ilan kalitesi veya sonuç sayısı kanıtı değil |
| Türkçe font kapsamı | 19/19 font | Her fontun cmap tablosunda çğıöşüÇĞİÖŞÜ; bu bir PDF yerleşim testi değil |
| Dağıtım taraması | Geçti | İzinler, kapalı ağ CSP'si, font hash'leri, bilinen gizli veri biçimleri ve boş profil işaretleri |
| Paket bütünlüğü | Geçti | 12 dosyalı eklenti, 239 dosyalı kaynak; bağımsız Python ZIP/CRC kontrolü |
| Tekrarlanabilir build | Geçti | Aynı kaynaktan iki ardışık build'in SHA-256 değerleri aynı |

Tarayıcı senaryoları: kasa oluşturma, şifreli profil/ilan kaydı, puan açıklaması,
onaylı tek-ilan aktarımı, yanlış parola, kilitlemede özel DOM'un temizlenmesi,
eşzamanlı pencere çatışması, şifreli yedek/geri yükleme/onaylı silme ve beş dakika
hareketsizlik kilidi. Görünür metin çıkarma ayrı kurmaca DOM üzerinde test edildi;
formlar, gizli içerik ve saydam üst kapsayıcı dışlandı.

İzlenen eklenti sayfasında her iki tarayıcıda da dış HTTP(S) isteği **0**,
JavaScript sayfa hatası **0**. Bu ölçüm tarayıcının kendi telemetrisi için geçerli değildir.
1180 px ve 375 px ekran görüntüleri incelendi; dar görünümde yatay taşma yok.
README ekran görüntüsünün tüm içeriği kurmacadır.

Portal testlerinin çoğu taklit fetch kullanır. Bazı upstream bayrak testleri
örnek konumla dış istek yapabilir ve yalnızca bayrağın reddedilmediğini sınar;
bu nedenle bütün portal paketini çevrimdışı test veya canlı arama doğrulaması
olarak nitelemiyoruz. Kişisel profil kullanılmaz.

## Geçmeyen veya çalıştırılmayan adımlar

- **PDF derlemesi tamamlanmadı.** LuaLaTeX ve XeLaTeX boş şablonları derlemeden
  önce MiKTeX'in tamamlanmamış kurulum hatasıyla durdu. npm run test:pdf de
  sıfırdan ayrı çıktı klasöründe aynı hatayı doğruladı. PDF metni/görünümü
  doğrulanmış sayılmıyor; sistem TeX ayarları bu ürün görevi için değiştirilmedi.
- **Claude taslak → ikinci ajan → PDF** döngüsü gerçek model hesabıyla çalıştırılmadı.
  Akış kaynakları mevcut; yazılım testi modelin gerçekten çalıştığı anlamına gelmez.
- **Araç çubuğundan activeTab yetkisiyle gerçek ilan yakalama** elle uçtan uca
  sınanmadı. Eklenti API'leri ve metin çıkarıcı ayrı doğrulandı; portal DOM'u değişebilir.
- **Comet, markalı Google Chrome, macOS ve Linux** bu yerel oturumda çalıştırılmadı.
  Chromium sonucu bütün tarayıcı sürümleri için garanti değildir.
- GitHub Actions ve tarayıcı mağazası süreçleri yerelde çalıştırılamaz;
  tanımlar eklendi, uzak koşu veya mağaza kabulü iddia edilmiyor.
- Bağımsız güvenlik denetimi, ATS ürünüyle kabul testi veya işe alım sonucu yok.

Testleri yeniden çalıştırmak için [TESTING](TESTING.md), gizlilik sınırları için
[PRIVACY](../PRIVACY.md). Ham test çıktıları ve indirilen örnek paketler
test-output içinde kalır, dağıtıma veya Git'e girmez.
