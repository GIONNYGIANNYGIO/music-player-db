const fs = require('fs');
const fetch = require('node-fetch'); // La libreria che hai già nel package.json

// URL magico di Google Sheets: converte il tuo foglio direttamente in formato TSV (Tab Separated Values)
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/13-sm984ItiKRnO33fDHkVMKMzOYfjTMpJa24796PTq4/export?format=tsv';

async function generateJSON() {
  try {
    console.log('Scaricando i dati da Google Sheets...');
    const response = await fetch(GOOGLE_SHEET_URL);
    
    if (!response.ok) {
      throw new Error(`Errore nel download: ${response.status}`);
    }

    const tsvData = await response.text();
    const rows = tsvData.split('\n').slice(1); // Dividi in righe e salta l'intestazione

    const audioUrlsVisti = new Set(); // Per evitare duplicati
    const tracks = [];

    rows.forEach(row => {
      const cols = row.split('\t'); // Separa le colonne con il Tab

      // Salta righe vuote o malformate
      if (cols.length < 5) return;

      const track = {
        title: cols[0] ? cols[0].trim() : 'Senza Titolo',
        artist: cols[1] ? cols[1].trim() : 'Sconosciuto',
        cover: cols[2] ? cols[2].trim() : '',
        link: cols[3] ? cols[3].trim() : '',
        audio: cols[4] ? cols[4].trim() : '',
        popularity: cols[6] ? parseInt(cols[6], 10) : 0,
        date: cols[7] ? cols[7].trim() : new Date().toISOString().split('T')[0],
        explicit: cols[8] ? cols[8].trim().toUpperCase() === "TRUE" : false
      };

      // Inserisci solo se ha un audio valido e NON è un duplicato
      if (track.audio && track.audio.startsWith('http')) {
        if (!audioUrlsVisti.has(track.audio)) {
          audioUrlsVisti.add(track.audio);
          tracks.push(track);
        }
      }
    });

    // Salva il file tracks.json aggiornato
    fs.writeFileSync('tracks.json', JSON.stringify(tracks, null, 2));
    console.log(`Fatto! tracks.json aggiornato con ${tracks.length} tracce valide e univoche.`);

  } catch (error) {
    console.error('Errore critico durante la conversione:', error);
    process.exit(1); // Fa fallire la GitHub Action se c'è un errore
  }
}

generateJSON();
