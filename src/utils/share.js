export function buildWhatsAppLink(link) {
  const text = `⚽ Mirá esta formación de fútbol:\n${link}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export async function shareFormation(link) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Formación de fútbol',
        text: '⚽ Mirá esta formación',
        url: link,
      });
      return true;
    } catch (err) {
      if (err?.name === 'AbortError') return false;
      throw err;
    }
  }
  return false;
}
