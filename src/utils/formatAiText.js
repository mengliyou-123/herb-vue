const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const warningPattern = /(警告|禁忌|风险|注意事项|温馨提示|及时就医|立即就医|尽快就医|医疗机构)/;
const advicePattern = /^(建议|调理|饮食|起居|运动|茶饮|穴位|用法用量|功效主治|辨证结论)[^，。]{0,12}[：:]/;

const formatInline = (value) => {
  let result = value;
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong class="ai-emphasis">$1</strong>');
  result = result.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<strong class="ai-emphasis">$2</strong>');
  result = result.replace(/^([^：:<>]{1,16}[：:])/, '<span class="ai-label">$1</span>');
  return result;
};

const semanticClass = (text) => {
  if (warningPattern.test(text)) return ' ai-warning';
  if (advicePattern.test(text)) return ' ai-advice';
  return '';
};

export const formatAiText = (text) => {
  if (!text) return '';

  const escaped = escapeHtml(String(text).replace(/\r\n?/g, '\n'));
  return escaped.split('\n').map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return '<div class="ai-spacer" aria-hidden="true"></div>';

    const markdownHeading = trimmed.match(/^#{1,4}\s+(.+)$/);
    const boldHeading = trimmed.match(/^\*\*([^*]{1,40})\*\*\s*$/);
    const chineseHeading = trimmed.match(/^((?:[一二三四五六七八九十]+、|（[一二三四五六七八九十\d]+）|【[^】]{1,24}】))\s*(.*)$/);
    const heading = markdownHeading?.[1]
      || boldHeading?.[1]
      || (chineseHeading ? `${chineseHeading[1]}${chineseHeading[2]}` : '');

    if (heading) {
      const warningClass = warningPattern.test(heading) ? ' ai-warning-title' : '';
      return `<div class="ai-section-title${warningClass}">${formatInline(heading)}</div>`;
    }

    const bullet = trimmed.match(/^[-•]\s*(.+)$/);
    if (bullet) {
      return `<div class="ai-line ai-list-item${semanticClass(bullet[1])}"><span class="ai-bullet">•</span><span>${formatInline(bullet[1])}</span></div>`;
    }

    const numbered = trimmed.match(/^(\d{1,2})[.、．]\s*(.+)$/);
    if (numbered) {
      return `<div class="ai-line ai-numbered${semanticClass(numbered[2])}"><span class="ai-number">${numbered[1]}</span><span>${formatInline(numbered[2])}</span></div>`;
    }

    return `<div class="ai-line${semanticClass(trimmed)}">${formatInline(trimmed)}</div>`;
  }).join('');
};

export const formatPlainText = (text) => {
  if (!text) return '';
  return escapeHtml(String(text).replace(/\r\n?/g, '\n')).replace(/\n/g, '<br>');
};
