# RolPusula Kullanım Kılavuzu

RolPusula'yı iki şekilde kullanabilirsin:

1. **Yalnız tarayıcı eklentisi:** İlanları kaydet, karşılaştır ve takip et. AI
   hesabı veya komut satırı gerekmez.
2. **Tam başvuru çalışma alanı:** Eklentiye ek olarak Claude Code, OpenAI Codex,
   Gemini CLI veya yerel Ollama modeliyle CV ve ön yazı hazırla.

Başvurular kendiliğinden gönderilmez. Son karar ve gönderim her zaman kullanıcıdadır.

## 1. Dosyaları indir

[Son sürüm sayfasını](https://github.com/orhanluce/rolpusula/releases/latest) aç.

- Yalnız eklenti için `rolpusula-extension-*.zip` dosyasını indir.
- AI çalışma alanı için ayrıca `rolpusula-source-*.zip` dosyasını indir.
- İndirdiğin ZIP'i normal bir klasöre çıkar. Tarayıcıya ZIP dosyasını doğrudan
  göstermeye çalışma.

İstersen `SHA256SUMS.txt` ile indirilen dosyaların bütünlüğünü kontrol edebilirsin.

## 2. Eklentiyi Chrome veya Edge'e kur

### Chrome

1. Adres çubuğuna `chrome://extensions` yaz.
2. Sağ üstten **Geliştirici modu**nu aç.
3. **Paketlenmemiş öğe yükle** düğmesine bas.
4. Açtığın eklenti paketinde `manifest.json` dosyasının bulunduğu klasörü seç.

### Edge

1. Adres çubuğuna `edge://extensions` yaz.
2. **Geliştirici modu**nu aç.
3. **Paketlenmemiş yükle** düğmesine bas.
4. `manifest.json` dosyasının bulunduğu klasörü seç.

Comet çoğu Chrome eklentisini destekler; ancak RolPusula'nın Comet kurulumu bu
sürümde ayrıca doğrulanmamıştır. Kurumsal bilgisayarlarda geliştirici modu kapalı olabilir.

## 3. İlk ilanını kaydet

1. RolPusula'yı tarayıcı araç çubuğuna sabitle.
2. En az 12 karakterlik bir kasa parolası oluştur. Bu parola hiçbir sunucuya
   gönderilmez ve unutulursa kurtarılamaz.
3. **Profilim** bölümüne yalnızca başvurularda kullanmak istediğin bilgileri yaz.
4. Bir ilan sayfasını aç ve RolPusula simgesine tıkla.
5. **İlan ekle → Açık sayfadan ilanı al** yolunu kullan.
6. Başlık, şirket ve ilan metnini kontrol ettikten sonra kaydet.

Eklenti ilan alanını bulamazsa sayfadaki ilan metnini seçip yeniden dene veya
metni elle yapıştır. Eklenti giriş duvarlarını ya da site kısıtlamalarını aşmaz.

## 4. İlanları karşılaştır ve takip et

Profilinde hedeflediğin becerileri anahtar kelime olarak yazabilirsin. RolPusula
bu kelimelerin ilanda geçip geçmediğini gösterir. Gösterilen oran bir ATS puanı
veya işe alınma ihtimali değildir.

İlan durumunu kaydettikten sonra **Kaydedildi**, **Başvuruldu**, **Görüşme** gibi
aşamalarda güncelleyebilirsin. Saklama süresi dolan ilanlar kasa yeniden açıldığında temizlenir.

## 5. AI çalışma alanını hazırla

Bu bölüm isteğe bağlıdır. Önce şunları kur:

- [Node.js](https://nodejs.org/en/download) 22 veya üstü
- Kullanacağın AI çalışma zamanı: Claude Code, OpenAI Codex, Gemini CLI veya
  Codex CLI ile Ollama
- İlan arama komutları için Bun
- PDF için Python 3.10+, `pypdf`, LuaLaTeX ve XeLaTeX

Kaynak paketini açtığın klasörde terminal çalıştır:

```powershell
node bin/rolpusula.mjs providers
```

Bu komut kullanılabilen sağlayıcıları ve cihazdaki Ollama modellerini gösterir.
Sonra kişisel çalışma klasörünü **ürün klasörünün dışında** oluştur:

```powershell
# Claude Code
node bin/rolpusula.mjs init ..\basvurularim --provider claude

# OpenAI Codex
node bin/rolpusula.mjs init ..\basvurularim --provider codex

# Gemini CLI
node bin/rolpusula.mjs init ..\basvurularim --provider gemini

# Cihazdaki Ollama modeli; model adını "ollama list" çıktısından al
node bin/rolpusula.mjs init ..\basvurularim --provider ollama --model qwen3:8b
```

Bu seçeneklerden yalnızca birini çalıştır. Hedef klasör daha önce var olmamalı
ve başka bir Git reposunun içinde bulunmamalıdır. RolPusula bu özel klasöre Git
remote eklemez; CV'n ürün reposuna girmez.

Kurulumu kontrol et ve seçtiğin AI'ı aç:

```powershell
node bin/rolpusula.mjs doctor ..\basvurularim
node bin/rolpusula.mjs launch ..\basvurularim
```

`doctor` PDF araçlarını eksik gösterse bile profil kurulumuna başlayabilirsin;
fakat hazır PDF almak için LuaLaTeX ve XeLaTeX gerekir.

## 6. AI içindeki komutlar

| Yapılacak iş | Claude Code / Gemini CLI | Codex / Ollama |
|---|---|---|
| Profil oluştur | `/setup` | `$rolpusula setup` |
| İlan ara ve değerlendir | `/scrape` | `$rolpusula scrape` |
| Bir ilana hazırlan | `/apply İLAN_URL` | `$rolpusula apply İLAN_URL` |
| Eklenti paketini işle | `/apply-local UUID` | `$rolpusula apply-local UUID` |

İlk kullanımda `setup` çalıştır. CV dosyanı özel çalışma alanındaki `documents/cv`
klasörüne koyabilir veya kısa mülakatı cevaplayabilirsin. AI yalnız doğruladığın
mesleki bilgileri kullanmalı; eksik deneyim veya başarı uydurmamalıdır.

`apply` önce uygunluk ve eksikleri gösterir. Devam etmeyi seçersen CV ve ön yazı
taslağı hazırlanır, ayrı bir eleştiri turundan geçirilir ve PDF araçları hazırsa
çıktılar derlenip metin katmanı kontrol edilir.

## 7. Eklentiden AI'a ilan aktar

1. Eklentide kaydettiğin ilanın **Başvuru hazırla** düğmesine bas.
2. Aktarılacak içeriği kontrol et. Profil ekleme seçeneği her aktarımda kapalı başlar.
3. `*.rpjob.json` paketini indir.
4. Kaynak paketinin bulunduğu terminalde şu komutu çalıştır:

```powershell
node bin/rolpusula.mjs import "C:\Downloads\ilan-paketi.rpjob.json" ..\basvurularim
```

Komut sana sağlayıcına uygun bir `apply-local` görevi verir. Bu görevi açık AI
oturumuna yapıştır. İçe aktarma komutu tek başına hiçbir AI servisine veri göndermez.

## 8. Sağlayıcıyı değiştir

CV ve ilan dosyalarını taşımadan AI seçimini değiştirebilirsin:

```powershell
node bin/rolpusula.mjs provider ..\basvurularim
node bin/rolpusula.mjs provider set ..\basvurularim gemini
node bin/rolpusula.mjs provider set ..\basvurularim ollama --model qwen3:8b
```

RolPusula API anahtarı saklamaz. Claude Code, Codex ve Gemini kendi bulut
hesaplarını kullanır. Ollama seçeneğinde model çıkarımı cihazda yapılır; yine de
ayrıca onayladığın web araştırmaları ve ilan portalı sorguları internete çıkabilir.

## 9. Verilerin nerede tutulur?

- Eklenti kasası tarayıcının yerel deposunda AES-256-GCM ile şifrelenir.
- Kasa parolası saklanmaz; beş dakika hareketsizlikte kasa kilitlenir.
- Dışa aktarılan `rpjob.json`, özel çalışma alanındaki CV'ler ve PDF'ler açık
  metin dosyalarıdır.
- Özel çalışma alanını OneDrive, Dropbox veya başka bir eşitlenen klasöre
  koyarsan işletim sistemi bu dosyaları buluta yükleyebilir.
- Claude, Codex veya Gemini kullandığında sağladığın içerik ilgili sağlayıcıda işlenir.

Gerçek CV kullanmadan önce [gizlilik sınırlarını](PRIVACY.md) oku.

## 10. Yedekleme, güncelleme ve kaldırma

- Kasa ekranından şifreli `rpvault.json` yedeği alabilirsin. Yedek parolası olmadan açılamaz.
- Eklentiyi güncellerken mevcut klasörün içeriğini yeni sürümle değiştir ve
  uzantılar sayfasındaki **Yenile** düğmesini kullan. Önce yedek al.
- Eklentiyi kaldırmak tarayıcı kasasını silebilir; indirdiğin paketleri, CV'leri
  ve PDF'leri silmez.
- Yerel çalışma alanını silmeden önce başvuru dosyalarını ayrıca yedekle.

## Sık karşılaşılan sorunlar

**`node` komutu bulunamadı:** Node.js 22+ kur ve terminali yeniden aç.

**`claude`, `codex`, `gemini` veya `ollama` bulunamadı:** Seçtiğin çalışma
zamanını resmî kurulumuyla yükle, terminali yeniden aç ve `doctor` komutunu çalıştır.

**PDF oluşmadı:** LuaLaTeX, XeLaTeX, Python ve `pypdf` kontrolünü yap. Yalnızca
`.tex` dosyasının oluşması PDF doğrulamasının tamamlandığı anlamına gelmez.

**Kasa açılmıyor:** Parolayı kontrol et. RolPusula'da parola kurtarma veya merkezi hesap yoktur.

**İlan alınamıyor:** İlan metnini seçerek tekrar dene veya elle yapıştır.

Daha teknik kurulum ayrıntıları için [Kurulum](docs/INSTALL.md), ölçülmüş test
sonuçları için [Doğrulama kaydı](docs/VERIFICATION.md), güvenlik bildirimi için
[Güvenlik](SECURITY.md) belgelerine bak.
