const fs = require('fs');

const GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/13-sm984ItiKRnO33fDHkVMKMzOYfjTMpJa24796PTq4/export?format=tsv';

async function fetchSheet() {
  const res = await fetch(GOOGLE_SHEET_URL);
  const text = await res.text();

  return text
    .split(/\r?\n/)
    .filter(r => r.trim() !== '')
    .slice(1);
}

function normalize(cols) {
  return {
    title: cols[0]?.trim() || '',
    artist: cols[1]?.trim() || '',
    cover: cols[2]?.trim() || '',
    link: cols[3]?.trim() || '',
    audio: cols[4]?.trim() || '',
    popularity: Number(cols[5]) || 0,
    date: cols[7]?.trim() || new Date().toISOString().split('T')[0],
    explicit: String(cols[8]).toLowerCase() === 'true'
  };
}

async function run() {
  const rows = await fetchSheet();

  const seen = new Set();
  const tracks = [];

  for (const row of rows) {
    const cols = row.split('\t');
    if (cols.length < 5) continue;

    const audio = cols[4]?.trim();
    if (!audio || seen.has(audio)) continue;

    seen.add(audio);
    tracks.push(normalize(cols));
  }

  fs.writeFileSync('tracks.json', JSON.stringify(tracks, null, 2));
  console.log('OK:', tracks.length);
}

run();
