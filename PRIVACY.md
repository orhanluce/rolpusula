# Gizlilik

RolPusula 0.1.0, hesap açtırmayan bir tarayıcı eklentisi ve ayrı bir Claude Code
çalışma alanı kurucusudur. Ürün reposu boş şablonlar içerir; hazır bir kişinin
CV'sini, iletişim bilgisini veya başvuru geçmişini içermez.

## Eklentide

- Profil ve ilanlar yalnızca chrome.storage.local içinde şifreli tutulur.
- AES-256-GCM; her yazmada rastgele 96-bit IV; paroladan PBKDF2-SHA256 ile
  600.000 yinelemede anahtar türetme; kasaya özel rastgele 128-bit salt.
- Anahtar dışa aktarılamaz ve sayfanın belleğinde kalır. Parola kaydedilmez.
  En az 12 karakter gerekir; uzun ve rastgele kelimelerden oluşan parola önerilir.
- Ağ, telemetri, reklam, hata raporu gönderimi, sunucu ve storage.sync yoktur.
  Content Security Policy, connect-src 'none' ile ağ bağlantılarını engeller.
- Beş dakika hareketsizlikte veya eklenti penceresi/sekmesi kapandığında kilitlenir.
  Belleğin adli yöntemlerle sıfırlanacağı garantisi verilmez.
- Saklama süresi 7, 30 (varsayılan) veya 90 gündür. İlanın ilk kayıt tarihine
  göre, kasa açılırken veya süre uygulanırken silinir. Kapalıyken arka plan işi yoktur.
  Profil kullanıcı silene kadar saklanır.

## İzinler

| İzin | Amaç | Sınır |
|---|---|---|
| activeTab | Kullanıcının açtığı ilanın sekmesine geçici erişim | Yalnızca açık eklentideki okuma düğmesiyle |
| scripting | Seçili metni veya görünür ilan bölümünü çıkarma | İzole ortam, ana çerçeve; form ve gizli metinler filtrelenir |
| storage | Şifreli kasayı tutma | TRUSTED_CONTEXTS; senkronizasyon kullanılmaz |

Sürekli tüm-site erişimi, çerez, geçmiş, panodan okuma, nativeMessaging, uzaktan
kod, webRequest veya hesap erişimi yoktur. Arayüz ilan metnini HTML olarak işletmez.
Sayfa metni güvenilmeyen içeriktir; kullanıcı kaydetmeden önce kontrol eder.
Seçtiğiniz metne hassas bilgi dahil ederseniz o metin de önizlemeye gelir.

## Dışa aktarma ve AI

Şifreli kasa yedeği rpvault.json biçimindedir. Başvuru paketi rpjob.json ise
**açık metindir**: tek ilan, ancak işaretlerseniz profil içerir. İndirmeden önce
tam JSON önizlemesi ve ayrı onay gerekir. Profil seçimi her aktarımda kapalı başlar.
Bağlantılardan takip parametreleri ve parçalar kaldırılır; bazı ilan kimlikleri korunur.
URL yolu veya korunmuş kimlik alanları yine özel veri içerebilir; önizlemeyi kontrol edin.

CLI içe aktarma yalnızca diske yazar; kendiliğinden model çalıştırmaz. Claude Code
oturumunu başlattığınızda ilgili bağlam **Anthropic** tarafından işlenir.
Sağlayıcının hesabınıza/planınıza ait saklama ve eğitim tercihleri geçerlidir.
Bu üründe bunları değiştiren veya geçersiz kılan bir ayar yoktur.
Üçüncü taraf arama portalları da /scrape çağrılarında sorgu ve IP adresinizi görebilir.
Opsiyonel e-posta/Notion entegrasyonları ancak ayrıca seçildiğinde kullanılmalıdır.
Opsiyonel Gemini araştırma ajanı da ayrıca açık onay ister: yalnızca önizlenen
kamuya açık şirket/rol sorgusunu Google'a iletebilir; CV veya profil göndermez.

## Yerel çalışma alanı

Kurucu, paylaşılacak repo dışında yeni bir klasör oluşturur; var olan dosyaları
ezmez. Çalışma alanı bir Git reposu içinde oluşturulamaz veya içine import yapılamaz.
.gitignore tüm dosyaları dışlar. Bu, bilinçli git add -f veya dosya paylaşımını engellemez.
Kişisel klasördeki JSON, CV ve PDF'ler **şifrelenmez**. Unix dosya/dizin izinleri
600/700 olarak oluşturulur. Windows'ta kullanıcının mevcut NTFS izinleri geçerlidir.
Eklentide silmek, diske indirilmiş yedekleri, paketleri, PDF'leri veya AI sağlayıcısı
kayıtlarını silmez. İşletim sistemi yedekleri/bulut eşitlemesi ayrıca yönetilmelidir.

Parola kurtarma yoktur. Kasa silme onay sözcüğü gerektirir; üzerine yedek yüklenmez.
Başka açık pencerede değişmiş kasa sessizce ezilmez; yeniden açmanız istenir.

## Güvenlik sınırları

Bu sürüm bağımsız güvenlik denetiminden geçmemiştir. Şifreleme; zararlı işletim
sistemi, açık kasaya erişen biri, keylogger, tarayıcı geliştirici araçları veya
tarayıcının kendi AI/sekme okuma özelliklerine karşı mutlak koruma değildir.
Comet gibi bir tarayıcının kendi veri politikası eklentinin politikasından ayrıdır.
İşe alınma, ATS geçişi veya ayrımcılıksız AI sonucu garantisi verilmez.

Kaynaklar: [Chrome activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab),
[Chrome storage](https://developer.chrome.com/docs/extensions/reference/api/storage),
[Anthropic privacy](https://www.anthropic.com/legal/privacy).
