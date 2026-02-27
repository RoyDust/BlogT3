import { pinyin } from 'pinyin-pro';

/**
 * 生成 URL 友好的 slug
 * 支持中文（转拼音）、英文、数字、连字符
 */
export function generateSlug(text: string): string {
  if (!text.trim()) return '';

  // 检测是否包含中文字符
  const hasChinese = /[\u4e00-\u9fff]/.test(text);

  let slug: string;
  if (hasChinese) {
    // 中文转拼音，用空格分隔
    slug = pinyin(text, { toneType: 'none', type: 'array' }).join(' ');
  } else {
    slug = text;
  }

  return slug
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
