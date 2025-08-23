export interface LinkCheckResult {
  url: string;
  isValid: boolean;
  isTwitter: boolean;
  hostname?: string;
}

const TWITTER_HOSTS = new Set(['twitter.com', 'www.twitter.com', 'mobile.twitter.com', 'x.com', 'www.x.com']);

export function extractAndCheckTwitterLinks(text: string): LinkCheckResult[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) ?? [];

  return matches.map((raw) => {
    const url = raw.replace(/[)\],.?!;:'"]+$/g, '');

    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();

      return {
        url,
        isValid: true,
        isTwitter: TWITTER_HOSTS.has(hostname),
        hostname,
      };
    } catch {
      return {
        url,
        isValid: false,
        isTwitter: false,
      };
    }
  });
}

export function isAffirmative(text: string): boolean {
  if (!text) return false;

  let norm = text
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’ʻ`´]/g, "'")
    .replace(/[\p{Z}\s]+/gu, ' ');

  const emojiAffirmatives = /([👍👌🙏✅☑️✔✓🙆🙆‍♂️🙆‍♀️])+/gu;
  if (emojiAffirmatives.test(norm)) return true;

  const exact = new Set([
    'y',
    'yy',
    'yyy',
    'ya',
    'yah',
    'yea',
    'yeah',
    'yep',
    'yup',
    'yup!',
    'yas',
    'aye',
    'ok',
    'k',
    'kk',
    'okay',
    'sure',
    'indeed',
    'affirmative',
    'roger',
    'copy',
    'deal',
    'bet',
    'si',
    'oui',
    'ja',
    'da',
    'hai',
    'pls',
    'plz',
    'surething',
    'alright',
    'all right',
    'fine',
    'works',
    'approved',
    'confirm',
    'confirmed',
  ]);
  const bare = norm.replace(/[.!?]+$/g, '');
  if (exact.has(bare)) return true;

  const tokens = bare
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

  if (tokens.length === 0) return false;

  const phraseParts = [
    'sounds good',
    'looks good',
    'seems good',
    'sounds great',
    'sounds fine',
    'works for me',
    'works for us',
    'works',
    'good for me',
    'good for us',
    'go ahead',
    'go for it',
    'do it',
    'lets do it',
    "let's do it",
    'proceed',
    'please do',
    'please',
    'sure thing',
    'of course',
    'by all means',
    'i agree',
    'agree',
    "i'm in",
    'im in',
    'count me in',
    'i approve',
    'ok then',
    'ok cool',
    'ok great',
    'okie',
    'okey',
    'okej',
    'okk',
    'kk',
    'sgtm',
    'sgtm!',
    'sgtm.',
    'sounds like a plan',
  ];

  const singleWord = new Set([
    'yes',
    'yeah',
    'yep',
    'yup',
    'sure',
    'okay',
    'affirmative',
    'roger',
    'copy',
    'deal',
    'bet',
    'confirmed',
    'approve',
    'approved',
    'alright',
    'fine',
    'ok',
  ]);

  const phraseRegex = new RegExp(
    '\\b(?:' +
    phraseParts.map((p) => p.replace(/\s+/g, '\\s+').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') +
    ')\\b',
    'i',
  );

  const hasSingleWordPositive = tokens.some((t) => singleWord.has(t));
  const hasPhrasePositive = phraseRegex.test(bare);

  if (!hasSingleWordPositive && !hasPhrasePositive) {
    if (!tokens.some((t) => ['si', 'oui', 'ja', 'da', 'hai'].includes(t))) {
      return false;
    }
  }

  const negationSet = new Set([
    'no',
    'nah',
    'nope',
    'not',
    'dont',
    "don't",
    'do',
    'cannot',
    'cant',
    "can't",
    'wont',
    "won't",
    'never',
    'stop',
    'skip',
    'hold',
    'wait',
    'later',
    'delay',
    'defer',
    'cancel',
    'nahh',
    'nahhh',
    'rather',
    'prefer',
    'unless',
    'except',
  ]);

  const windowSize = 3;
  const posIndices: number[] = [];
  tokens.forEach((t, i) => {
    if (singleWord.has(t) || ['si', 'oui', 'ja', 'da', 'hai'].includes(t)) posIndices.push(i);
  });

  if (hasPhrasePositive && posIndices.length === 0) posIndices.push(Math.max(0, Math.floor(tokens.length / 2)));

  const negIndices: number[] = [];
  tokens.forEach((t, i) => {
    if (negationSet.has(t)) negIndices.push(i);
  });

  const joined = tokens.join(' ');
  const negPhrases = [
    'not yet',
    'not now',
    'do not',
    'dont do',
    'please dont',
    "please don't",
    'rather not',
    'prefer not',
    'ok if we dont',
    "ok if we don't",
    "won't do",
    'cant do',
    "can't do",
    'no thanks',
    'no thank you',
    'no thankyou',
    'no go',
    "let's not",
    'lets not',
    'hold off',
    'hold on',
    'wait up',
    'wait a bit',
    'wait a sec',
    'maybe later',
  ];
  const hasNegPhrase = negPhrases.some((p) => new RegExp('\\b' + p.replace(/\s+/g, '\\s+') + '\\b', 'i').test(joined));

  if (hasNegPhrase) return false;

  const hasButNegation = /\bbut\b.*\b(not|later|cant|can't|dont|don't|no|nah|nope)\b/i.test(joined);
  if (hasButNegation) return false;

  for (const pi of posIndices) {
    for (const ni of negIndices) {
      if (Math.abs(pi - ni) <= windowSize) return false;
    }
  }

  return true;
}
