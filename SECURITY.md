# Güvenlik

Desteklenen sürüm: 0.1.x (erken sürüm). Açık saldırı yüzeyi: kullanıcı tıklamasıyla
okunan web içeriği, yedek/paket içe aktarma, şifreli yerel depolama ve Claude'a
aktarılan güvenilmeyen ilan metni.

Gerçek CV, iletişim bilgisi, parola, anahtar veya ilan içindeki özel metni public
issue'ya koymayın. Kurmaca bir yeniden üretim örneği kullanın. GitHub deposunun
Security → Report a vulnerability özelliği etkinse özel bildirim yapın. Etkin
değilse ayrıntıyı açık yazmak yerine bakımcıdan özel bir kanal isteyin.

## Kontroller

- Eklentide ağ çıkışı ve kalıcı host erişimi yok.
- WebCrypto AEAD, bounded parser, sürüm/KDF/IV doğrulaması.
- Veri HTML olarak işletilmez; uzaktan komut/LLM otomatik çalıştırılmaz.
- Export tek ilanla ve açık içerik onayıyla; profil varsayılan olarak hariç.
- Kasa eşzamanlı yazımlarında Web Locks ve sürüm görüntüsü kontrolü.
- Import yalnızca kurucu tarafından işaretlenmiş özel klasöre; sembolik bağlantı,
  Git reposu ve yol geçişi kontrolü; sabit dosya adı ve rastgele klasör kimliği.
- Paketleme allowlist kullanır, kişiselleştirilmiş şablon ve olası sır taraması yapar.
- İşverenlere otomatik başvuru gönderimi yok. İlan metinleri ajan talimatı sayılmaz.

Testler riskleri azaltır; profesyonel penetrasyon testi veya kriptografi denetimi
yerine geçmez. Dosya sistemi aynı kullanıcı tarafından eşzamanlı değiştirilirse
CLI kontrollerinde TOCTOU riski tamamen ortadan kalkmaz. Kullanıcı hesabını koruyun.

Şifreleme, izin veya veri akışı değişiyorsa PRIVACY.md, README ve testleri aynı
değişiklikte güncelleyin. CI'da ağ erişimli canlı portal testleri varsayılan çalışmaz.
