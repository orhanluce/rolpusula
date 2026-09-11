# Üçüncü taraf bildirimleri

## AI Job Search

workspace-template içeriği Mads Lorentzen'in ai-job-search projesinden,
UPSTREAM.json'daki commit'in Git blob'larından alınmıştır.
Yerel kişiselleştirilmiş çalışma ağacı, Git geçmişi, .claude/settings.local.json,
CV PDF'leri ve özel belge klasörleri aktarılmamıştır.

Kaynak: https://github.com/MadsLorentzen/ai-job-search
Lisans: MIT; workspace-template/LICENSE içinde özgün metin korunur.
RolPusula eklemeleri: gizlilik sınırı, ayrı özel workspace kurulumu,
/apply-local paket akışı, eklenti, kontroller, Türkçe belgeler.
RolPusula, Anthropic/Google/Microsoft/Perplexity'nin resmî ürünü değildir.

## Fontlar

Lato font dosyaları Google Fonts deposundaki sabit commit'ten, dosya içeriği
değiştirilmeden alınır. Var olan şablonun dosya yollarını korumak için yalnızca
dosya adları eşlenir. Lato-Hai dosyaları Lato-Thin kaynağına karşılık gelir.
Kaynaklar ve SHA-256 değerleri FONT-SOURCES.json içindedir.
SIL OFL: workspace-template/cover_letters/OpenFonts/fonts/lato/OFL.txt.

Raleway OTF dosyaları özgün AI Job Search şablonundan gelir.
SIL OFL: workspace-template/cover_letters/OpenFonts/fonts/raleway/OFL.txt.
Font lisansları üretilen CV/ön yazı içeriğine uygulanmaz.
