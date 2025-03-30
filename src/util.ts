import { GetCompetitorBasicInfo, SearchCompetitors } from './const';
import { CompetitorBasicInfo, SearchCompetitor, WaApi } from './types';

export const searchCompetitors = async (query: string, waApi: WaApi): Promise<SearchCompetitor[]> => {
  const { data } = await (
    await fetch(waApi.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': waApi.apiKey,
      },
      body: JSON.stringify({
        operationName: 'SearchCompetitors',
        variables: { query },
        query: SearchCompetitors,
      }),
    })
  ).json();
  return data.searchCompetitors;
};

export const competitorBasicInfo = async (id: string, waApi: WaApi): Promise<CompetitorBasicInfo> => {
  const { data } = await (
    await fetch(waApi.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': waApi.apiKey,
      },
      body: JSON.stringify({
        operationName: 'GetCompetitorBasicInfo',
        query: GetCompetitorBasicInfo,
        variables: { id },
      }),
    })
  ).json();
  return data.competitor;
};

export const getAvatarUrl = (aaAthleteId: string) => `https://media.aws.iaaf.org/athletes/${aaAthleteId}.jpg`;

export const evtSort = (a: string, b: string) => {
  const DIGITS = '0123456789';
  const normalize = (s: string) => s.replace('Mile', '1609').replace('MILE', '1609');
  const firstNumericWord = (s: string) => s.split(' ').find((w) => DIGITS.includes(w[0])) ?? s.slice(1);
  const gender = (s: string) => s.match(/(Men|Women)/)?.[0] ?? s[0];
  a = normalize(a);
  b = normalize(b);
  if (gender(a) !== gender(b)) return a.localeCompare(b);
  return Number.parseInt(firstNumericWord(a)) - Number.parseInt(firstNumericWord(b));
};

export const normalize = (str: string) => {
  const replacements: { [key: string]: string } = {
    '—': '-',   // Em dash
    '–': '-',   // En dash
    '‘': "'",   // Left single quote
    '’': "'",   // Right single quote
    '“': '"',   // Left double quote
    '”': '"',   // Right double quote
    '…': '...', // Ellipsis
  };
  const regex = new RegExp(`[${Object.keys(replacements).join('')}]`, 'g');

  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(regex, (char) => replacements[char])
    .replace(/[^\x00-\x7F]/g, '');
}
