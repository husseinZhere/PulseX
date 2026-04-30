export const toHTML = (text) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /(#[\w\u0600-\u06FF]+)/g,
      '<span style="color:#333CF5;font-weight:600">$1</span>',
    );

export const saveCaret = (el) => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;
  const range = sel.getRangeAt(0);
  const pre = range.cloneRange();
  pre.selectNodeContents(el);
  pre.setEnd(range.endContainer, range.endOffset);
  return pre.toString().length;
};

export const restoreCaret = (el, offset) => {
  const walk = (node, remaining) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (remaining[0] <= node.length) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(node, remaining[0]);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return true;
      }
      remaining[0] -= node.length;
      return false;
    }
    for (const child of node.childNodes) {
      if (walk(child, remaining)) return true;
    }
    return false;
  };
  walk(el, [offset]);
};
