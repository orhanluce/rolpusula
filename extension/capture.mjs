// Serialized by scripting.executeScript; intentionally self-contained.
// Reads only on user action, in an isolated world. No inputs, cookies or page-body fallback.
export function capturePosting() {
  if (document.activeElement?.closest('input,textarea,select,[contenteditable]')) {
    throw new Error('Form alanları okunmaz. İlan açıklamasını seçin veya elle yapıştırın.');
  }
  const selection = window.getSelection()?.toString().trim();
  const roots = ['[itemprop="description"]', '.jobs-description__content', '.show-more-less-html__markup', '[data-testid="job-description"]', 'article'];
  let body = selection || '';
  if (!body) {
    const node = roots.map(s => document.querySelector(s)).find(n => n && n.getBoundingClientRect().height > 0);
    if (node) {
      // Traverse visible text nodes only; hidden styles and form controls excluded.
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      const chunks = [];
      let current, size = 0;
      while ((current = walker.nextNode()) && size < 40_001) {
        const el = current.parentElement;
        if (!el || el.closest('script,style,noscript,input,textarea,select,button,[contenteditable],[hidden],[aria-hidden="true"]')) continue;
        let ancestor = el, visible = true;
        while (ancestor) {
          const style = getComputedStyle(ancestor);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') { visible = false; break; }
          ancestor = ancestor.parentElement;
        }
        if (!visible || !el.getClientRects().length) continue;
        const s = current.textContent.trim();
        if (s) { chunks.push(s); size += s.length + 1; }
      }
      body = chunks.join('\n');
    }
  }
  if (!body) throw new Error('İlan alanı bulunamadı. Sayfadaki ilan metnini seçip yeniden deneyin veya elle yapıştırın.');
  return { title: (document.querySelector('h1')?.innerText || document.title || '').slice(0, 500), text: body.slice(0, 40_000), truncated: body.length > 40_000, url: location.href, company: '' };
}
