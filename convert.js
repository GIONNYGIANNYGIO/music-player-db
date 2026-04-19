const fs = require('fs');

const csv = fs.readFileSync('database.csv', 'utf-8');
const rows = csv.split('\n').slice(1);

const tracks = rows.map(row => {
  const cols = row.split('\t');

  return {
    title: cols[0],
    artist: cols[1],
    cover: cols[2],
    link: cols[3],
    audio: cols[4],
    popularity: cols[6],
    date: cols[7],
    explicit: cols[8] === "TRUE"
  };
}).filter(t => t.audio && t.audio.startsWith('http'));

fs.writeFileSync('tracks.json', JSON.stringify(tracks, null, 2));
