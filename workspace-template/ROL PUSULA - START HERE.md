# RolPusula kişisel çalışma alanı

Bu klasör yalnızca sizin başvurularınız içindir; paylaşılacak ürün reposu değildir.
Kurulum aracı .gitignore dosyasına * yazar, Git reposu başlatmaz ve remote eklemez.
Klasörü bulut eşitlenen bir konuma koyarsanız işletim sisteminiz dosyaları eşitleyebilir.

1. Ürün klasöründe `node bin/rolpusula.mjs launch "BU_KLASOR"` çalıştırın.
   Claude/Gemini için /setup, Codex/Ollama için `$rolpusula setup` yazın.
2. Kendi CV'nizi documents/cv altına koyun veya mülakat sorularını cevaplayın.
3. /scrape ile ilanları arayın; önce pazar, konum ve kaynakları seçin.
4. Eklenti paketini import komutuyla alın; komutun gösterdiği apply-local görevini çalıştırın.
5. Bir ilan URL'si için doğrudan /apply de kullanılabilir.

Claude Code, OpenAI Codex ve Gemini CLI kendi hesabınızı/API erişiminizi ve ağ
bağlantısını kullanır. Ollama seçeneğinde model çıkarımı cihazda yapılır; ancak
ilan araştırması gibi ayrıca onayladığınız web adımları yine ağa çıkabilir.
Bu çalışma alanındaki belgeler açık metin/PDF dosyalarıdır; eklenti kasası gibi
şifrelenmez. BitLocker/FileVault gibi disk şifrelemesi ve kişisel OS hesabı kullanın.

Windows: Python komutları için py -3 kullanın. Bun portal araması için; LuaLaTeX
CV için, XeLaTeX ön yazı için, pypdf PDF metin denetimi için gereklidir.

Dış servis, e-posta ve Notion senkronizasyonu varsayılan akışın parçası değildir.
Hiçbir başvuru sizin ayrı talebiniz olmadan gönderilmemelidir.
