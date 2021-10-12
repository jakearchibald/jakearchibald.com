import { toASCII } from 'punycode';

// Hopefully I can replace this with the real resource eventually.
// https://github.com/publicsuffix/list/issues/1433
const publicSuffixListUrl = 'https://cors-playground-a63c2044.deno.dev/psl';

interface PSLRule {
  rule: string;
  suffix: string;
  punySuffix: string;
  wildcard: boolean;
  exception: boolean;
}

let pslPromise: Promise<PSLRule[]> | undefined;

function getRules(): Promise<PSLRule[]> {
  if (!pslPromise) {
    pslPromise = (async () => {
      try {
        const response = await fetch(publicSuffixListUrl);
        const text = await response.text();
        return text
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('//'))
          .map((rule) => {
            const suffix = rule.replace(/^(\*\.|\!)/, '');
            return {
              rule,
              suffix,
              punySuffix: toASCII(suffix),
              wildcard: rule.charAt(0) === '*',
              exception: rule.charAt(0) === '!',
            };
          });
      } catch (err) {
        console.error(err);
        throw Error('Failed to fetch Public Suffix List');
      }
    })();
  }

  return pslPromise;
}

async function findRule(asciiHostname: string): Promise<PSLRule | undefined> {
  const rules = await getRules();
  let matchingRule: PSLRule | undefined;

  for (const rule of rules) {
    if (
      asciiHostname.endsWith('.' + rule.punySuffix) &&
      asciiHostname !== rule.punySuffix
    ) {
      matchingRule = rule;
      continue;
    }
  }

  return matchingRule;
}

const ipv6 = /^(?:[a-f0-9]{1,4}:){7}[a-f0-9]{1,4}$/;
const ipv4 =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export async function getSite(hostname: string): Promise<string> {
  hostname = hostname.toLowerCase();

  // I'm not 100% confident on some of this, so don't use it in security-sensitive situations :)
  if (ipv6.test(hostname) || ipv4.test(hostname)) return hostname;

  // A lot of this is adapted from https://github.com/lupomontero/psl/blob/master/index.js
  // But uses a 'live' list, and targeted at browsers.

  if (hostname.endsWith('.')) hostname = hostname.slice(0, -1);

  const asciiHostname = toASCII(hostname);

  if (asciiHostname.length < 1) throw TypeError('Domain too short');
  if (asciiHostname.length > 255) throw TypeError('Domain too long');

  const asciiLabels = asciiHostname.split('.');

  for (const label of asciiLabels) {
    if (label.length === 0) throw TypeError('Domain label too short');
    if (label.length > 63) throw TypeError('Domain label too long');
    if (label.startsWith('-')) {
      throw TypeError('Domain label starts with hyphen');
    }
    if (label.endsWith('-')) throw TypeError('Domain label ends with hyphen');
    if (!/^[a-z0-9\-]+$/.test(label)) {
      throw TypeError('Domain label contains invalid characters');
    }
  }

  if (asciiLabels[asciiLabels.length - 1] === 'local') return asciiHostname;

  const rule = await findRule(asciiHostname);

  if (!rule) {
    if (asciiLabels.length < 2) return asciiHostname;
    return asciiLabels.slice(-2).join('.');
  }

  const tldParts = rule.suffix.split('.');
  const privateParts = asciiLabels.slice(0, -tldParts.length);

  if (rule.exception) privateParts.push(tldParts.shift()!);

  if (privateParts.length === 0) return asciiHostname;

  let tld = tldParts.join('.');

  if (rule.wildcard) {
    tldParts.unshift(privateParts.pop()!);
    tld = tldParts.join('.');
  }

  if (privateParts.length === 0) return asciiHostname;

  const sld = privateParts.pop();
  return sld + '.' + tld;
}
