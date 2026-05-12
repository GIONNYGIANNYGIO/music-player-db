const fs = require('fs');

const GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/13-sm984ItiKRnO33fDHkVMKMzOYfjTMpJa24796PTq4/export?format=tsv';

async function generateJSON() {
  try {
    console.log('Scarico dati Google Sheets...');

    const response = await fetch(GOOGLE_SHEET_URL);

    if (!response.ok) {
      throw new Error(`Errore download: ${response.status}`);
    }

    const tsvData = await response.text();

    const rows = tsvData
      .split(/\r?\n/)
      .filter(r => r.trim() !== '')
      .slice(1);

    const seen = new Set();
    const tracks = [];

    for (const row of rows) {
      const cols = row.split('\t');
      if (cols.length < 5) continue;

      const audio = cols[4]?.trim();
      if (!audio || !audio.startsWith('http')) continue;

      if (seen.has(audio)) continue;
      seen.add(audio);

      tracks.push({
        title: cols[0]?.trim() || 'Senza Titolo',
        artist: cols[1]?.trim() || 'Sconosciuto',
        cover: cols[2]?.trim() || '',
        link: cols[3]?.trim() || '',
        audio: audio,

        popularity: parseInt(cols[5]?.trim(), 10) || 0,

        date:
          cols[7]?.trim() ||
          new Date().toISOString().split('T')[0],

        explicit:
          cols[8]?.trim().toLowerCase() === 'true'
      });
    }

    fs.writeFileSync(
      'tracks.json',
      JSON.stringify(tracks, null, 2)
    );

    console.log(`OK: create ${tracks.length} tracks`);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

generateJSON();
