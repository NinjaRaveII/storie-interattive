// Genera gli audio narranti (ElevenLabs TTS) per le storie statiche.
// Uso: ELEVENLABS_API_KEY deve essere impostata come variabile d'ambiente di sistema
// (mai incollata qui nel codice). Esecuzione: node generate-audio.mjs
//
// Salva i file in audio/<storia>/intro.mp3, middle_<key>.mp3, end_<key1>_<key2>.mp3
// Non richiama le API per i file già presenti (rilancio sicuro in caso di interruzioni).

import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const VOICE_ID = 'pFZP5JQG7iQjIQuC4Bku'; // Serena — voce italiana (stessa usata in tv.html)
const MODEL_ID = 'eleven_multilingual_v2';

async function loadApiKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  try {
    const content = await readFile('.env.local', 'utf8');
    const match = content.match(/^ELEVENLABS_API_KEY=(.+)$/m);
    if (match) return match[1].trim();
  } catch {}
  return null;
}

const API_KEY = await loadApiKey();

if (!API_KEY) {
  console.error('ERRORE: nessuna chiave ElevenLabs trovata.');
  console.error('Crea un file ".env.local" nella cartella del progetto con dentro una riga:');
  console.error('  ELEVENLABS_API_KEY=la-tua-chiave');
  console.error('(il file è escluso da git, la chiave non finisce mai nel repository)');
  process.exit(1);
}

/* Testi delle storie: derivati da stories.js (fonte unica dei dati).
   intro -> steps[0].text, middle_<k> -> variants[k].text, end_<k1>_<k2> -> ends[chiave].text */
const require = createRequire(import.meta.url);
const { STORIES: STORY_DATA } = require('./stories.js');
const STORIES = Object.fromEntries(STORY_DATA.map(s => [s.id, {
  intro: s.steps[0].text,
  middle: Object.fromEntries(Object.entries(s.steps[1].variants).map(([k, v]) => [k, v.text])),
  end: Object.fromEntries(Object.entries(s.steps[2].ends).map(([k, e]) => [k, e.text]))
}]));

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function generateOne(text, outPath) {
  if (await fileExists(outPath)) {
    console.log('  già presente, salto:', outPath);
    return;
  }
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: { stability: 0.45, similarity_boost: 0.82, style: 0.3, use_speaker_boost: true }
    })
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs error ${res.status} per ${outPath}: ${await res.text()}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buf);
  console.log('  generato:', outPath, `(${(buf.length / 1024).toFixed(0)} KB)`);
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  for (const [storyId, data] of Object.entries(STORIES)) {
    const dir = path.join('audio', storyId);
    await mkdir(dir, { recursive: true });
    console.log(`\n== ${storyId} ==`);

    await generateOne(data.intro, path.join(dir, 'intro.mp3'));
    await wait(400);

    for (const [key, text] of Object.entries(data.middle)) {
      await generateOne(text, path.join(dir, `middle_${key}.mp3`));
      await wait(400);
    }

    for (const [key, text] of Object.entries(data.end)) {
      await generateOne(text, path.join(dir, `end_${key}.mp3`));
      await wait(400);
    }
  }
  console.log('\nCompletato.');
}

run().catch(err => { console.error(err); process.exit(1); });
