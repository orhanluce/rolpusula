# Kurulum

## Yalnızca eklenti

Kaynak ZIP'ini aç. Chrome → chrome://extensions, Edge → edge://extensions.
Geliştirici modu → Paketlenmemiş öğe yükle → extension klasörü.
Manifest dosyasını değil, dosyanın bulunduğu klasörü seç.
Yeni sürümde aynı klasörü güncelleyip Yenile düğmesine bas; kaldırıp yeniden
yüklemek kasayı silebilir. Önce şifreli yedek al.

Comet: Ayarlar → Uzantılar. Chromium uzantı desteği resmî olarak belgelenmiştir;
bu sürümün Comet'teki elle kurulum akışı henüz gerçek tarayıcıda doğrulanmamıştır.
Yükleme seçeneği yoksa geliştirici modunun kurum politikanızca kapatılmadığını kontrol edin.

Eklentiyi araç çubuğuna sabitle. Parolanı oluştur, Profilim alanını doldur.
Tam sayfa görünümünde elle ilan ekleyebilirsin. Bir web sayfasını okumak için
**o ilan sayfasındayken araç çubuğundaki eklentiyi açman** gerekir.
Kapalı popup içeriği kaybolur; uzun profil düzenlemesi için Tam sayfa aç kullan.

## AI ve PDF araçları

Eklenti bu programları kendiliğinden indirmez veya kurmaz:

- [Node.js](https://nodejs.org/en/download): 22 veya üstü.
- [Claude Code](https://code.claude.com/docs/en/setup): resmî kurucuyu kullan.
  İlk claude çalıştırmasında kendi hesabınla giriş yap. Hesap ücretleri sana aittir.
- [Bun](https://bun.sh/docs/installation): portal arama komutları için.
- [Python](https://www.python.org/downloads/): 3.10 veya üstü.
- [MiKTeX](https://miktex.org/download) (Windows) veya
  [TeX Live](https://tug.org/texlive/) / [MacTeX](https://tug.org/mactex/).

Node kurulduktan sonra ürün klasöründe:

    node bin/rolpusula.mjs doctor
    node bin/rolpusula.mjs init ../basvurularim

Çalışma klasörünün üst dizini var olmalı, hedef klasör henüz var olmamalı.
Ürün reposunun veya başka Git reposunun içine oluşturulamaz. Bulut eşitlenen
bir dizin seçersen dosyaların işletim sistemince eşitlenebileceğini unutma.

Python için Windows'ta:

    py -3 -m pip install pypdf

macOS/Linux'ta bir sanal ortam kullan:

    python3 -m venv ../rolpusula-tools
    source ../rolpusula-tools/bin/activate
    python3 -m pip install pypdf

Portal CLI'ları için özel çalışma alanında ilgili .agents/skills/<portal>/cli
klasörüne girip bun install çalıştır. LinkedIn ve freehire aramalarının çalışma
zamanı bağımlılığı yoktur. Diğer portalların bağımlılıkları vardır.
Hedef pazarındaki kaynakları /setup sırasında seç; erişim ve kullanım koşullarını gözet.

MiKTeX'te gerekli paketleri MiKTeX Console ile kur veya eksik paketlerin otomatik
kurulumunu bilinçli olarak etkinleştir. RolPusula bu ayarı sisteminde değiştirmez.
LuaLaTeX ve XeLaTeX komutlarının yeni terminalde bulunduğunu kontrol et.
Minimal TeX Live için örnek paket seti:

    tlmgr install moderncv fontawesome5 fontawesome6 academicons import luatexbase pgf titlesec textpos xltxtra xunicode cite realscripts needspace

Dağıtımına bağlı ek paketler istenebilir; workspace-template/SETUP.md daha ayrıntılıdır.

## İlk başvuru

Yeni çalışma alanında claude → /setup. Kendi CV'ni ver ya da mülakata gir.
PDF/DOCX metin çıkarma Claude ortamındaki araçlara bağlıdır; okunamadığında
metni kendin yapıştırabilirsin. RolPusula eklentisi PDF/DOCX ayrıştırmaz.

/scrape ilan arar; /apply URL uygunluğu değerlendirir.
Eklenti paketini ürün klasöründen import ile aldıysan dönen /apply-local UUID
komutunu kullan. Paket içindeki aday bilgileri mevcut profili sessizce değiştirmez.

## Sorun giderme

- Kasa açılmıyor: parola yanlış veya dosya bozuk olabilir; orijinal yedeği koru.
- İlan alınamıyor: metni sayfada seç; giriş duvarını aşmaya çalışmaz.
- Komut bulunamıyor: yeni terminal aç, doctor çalıştır.
- PDF oluşmuyor: TeX logunu kontrol et; yalnızca .tex üretilmesi tamamlanmış PDF değildir.
- MiKTeX 'fresh TeX installation' diyorsa kurulum/ilk hazırlık tamamlanmamıştır;
  MiKTeX Console üzerinden kurulum ve güncellemeleri tamamla, ardından test:pdf çalıştır.
- Birden çok pencerede kasa değişti: yeniden aç, güncel kaydı düzenle.
- Unutulan parola: sunucu/kurtarma yok. Kasayı silip yeni kasa açabilirsin.
