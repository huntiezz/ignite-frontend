import emojisData from '../assets/emojis/emojis.json';

// Shared emoji shortcode ↔ unicode mapping
export const emojiMap = new Map();

// Populate map synchronously from local JSON
// Comprehensive list of all unicode surrogates for regex
export const allUnicodeEmojis = [];

try {
  Object.values(emojisData).forEach((categoryEmojis) => {
    categoryEmojis.forEach((emoji) => {
      // Map each name to the surrogate
      if (emoji.names && emoji.surrogates) {
        allUnicodeEmojis.push(emoji.surrogates);
        emoji.names.forEach((name) => {
          const shortcode = `:${name}:`;
          if (!emojiMap.has(shortcode)) {
            emojiMap.set(shortcode, emoji.surrogates);
          }
        });
      }
    });
  });
} catch (error) {
  console.error('Failed to load local emoji data:', error);
}

// Create a regex that matches any of the unicode emojis
// Sort by length descending to match longer sequences (like family emojis) first
const unicodeEmojiRegex = new RegExp(
  allUnicodeEmojis
    .sort((a, b) => b.length - a.length)
    .map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // escape for regex
    .join('|'),
  'g'
);

// Legacy function - kept for compatibility but does nothing now
export const loadEmojiData = async () => {
  // Data is already loaded synchronously
};

export const registerEmoji = (label, emoji) => {
  const shortcode = `:${label.toLowerCase().replace(/\s+/g, '_')}:`;
  if (!emojiMap.has(shortcode)) {
    emojiMap.set(shortcode, emoji);
  }
};

export const convertEmojiShortcodes = (text) => {
  return text.replace(/:[\w_+-]+:/g, (match) => {
    const surrogate = emojiMap.get(match);
    if (surrogate) {
      return `![${match}](${getTwemojiUrl(surrogate)})`;
    }
    return match;
  });
};

export const convertUnicodeEmojis = (text) => {
  if (!text) return '';
  return text.replace(unicodeEmojiRegex, (match) => {
    return `![${match}](${getTwemojiUrl(match)})`;
  });
};

export const getTwemojiUrl = (emoji) => {
  const code = [...emoji]
    .map((char) => char.codePointAt(0).toString(16))
    .filter((hex) => hex !== 'fe0f') // Remove VS16
    .join('-');
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${code}.svg`;
};
