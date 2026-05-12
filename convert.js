const fs = require('fs');
const fetch = require('node-fetch');

// URL Google Sheets TSV
const GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/13-sm984ItiKRnO33fDHkVMKMzOYfjTMpJa24796PTq4/export?format=tsv';

async function generateJSON() {
  try {
    console.log('Scaricando i dati da Google Sheets...');

    const response = await fetch(GOOGLE_SHEET_URL);

    if (!response.ok) {
      throw new Error(`Errore nel download: ${response.status}`);
    }

    const tsvData = await response.text();

    // Gestisce sia \n che \r\n
    const rows = tsvData
      .split(/\r?\n/)
      .filter(row => row.trim() !== '')
      .slice(1);

    const audioUrlsVisti = new Set();
    const tracks = [];

    rows.forEach(row => {

      // Divide colonne TSV
      const cols = row.split('\t');

      // Salta righe rotte
      if (cols.length < 5) return;

      const track = {
        title: cols[0]?.trim() || 'Senza Titolo',

        artist: cols[1]?.trim() || 'Sconosciuto',

        cover: cols[2]?.trim() || '',

        link: cols[3]?.trim() || '',

        audio: cols[4]?.trim() || '',

        // Views
        v: cols[5]
          ? parseInt(cols[5].replace(/\r/g, '').trim(), 10) || 0
          : 0,

        // Popularity
        p: cols[6]
          ? parseInt(cols[6].replace(/\r/g, '').trim(), 10) || 0
          : 0,

        // Date
        y: cols[7]
          ? cols[7].replace(/\r/g, '').trim()
          : new Date().toISOString().split('T')[0],

        // Explicit
        explicit: cols[8]
          ? cols[8]
              .replace(/\r/g, '')
              .trim()
              .toLowerCase() === 'true'
          : false
      };

      // Solo audio validi e non duplicati
      if (track.audio && track.audio.startsWith('http')) {

        if (!audioUrlsVisti.has(track.audio)) {

          audioUrlsVisti.add(track.audio);

          tracks.push(track);
        }
      }
    });

    // Salva JSON finale
    fs.writeFileSync(
      'tracks.json',
      JSON.stringify(tracks, null, 2)
    );

    console.log(
      `Fatto! tracks.json aggiornato con ${tracks.length} tracce valide e univoche.`
    );

  } catch (error) {

    console.error(
      'Errore critico durante la conversione:',
      error
    );

    process.exit(1);
  }
}

generateJSON();
