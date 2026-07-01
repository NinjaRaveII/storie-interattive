// Genera gli audio narranti (ElevenLabs TTS) per le storie statiche.
// Uso: ELEVENLABS_API_KEY deve essere impostata come variabile d'ambiente di sistema
// (mai incollata qui nel codice). Esecuzione: node generate-audio.mjs
//
// Salva i file in audio/<storia>/intro.mp3, middle_<key>.mp3, end_<key1>_<key2>.mp3
// Non richiama le API per i file già presenti (rilancio sicuro in caso di interruzioni).

import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
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

const STORIES = {
  oasis: {
    intro: 'Nel villaggio di sabbia dorata viveva Sara, che ogni mattina riempiva la brocca alla fonte dell\'oasi. Ma quel giorno l\'acqua non c\'era più: solo un piccolo pesce d\'argento la guardava con occhi tristi, immobile sulla sabbia secca. "Aiutami a ritrovare la sorgente," sussurrò il pesce, "e l\'oasi tornerà a vivere." Sara non ci pensò due volte: si mise lo zaino in spalla e uscì tra le dune dorate.',
    middle: {
      dune: 'Le dune la portarono fino a un arco di pietra antica, coperto di incisioni scintillanti. Ai suoi piedi, una piccola volpe color sabbia dorata la osservava con occhi d\'ambra. "Sono Sabbiosa," disse la volpe, "la guardiana di questo arco. Il vento ha sepolto l\'ingresso della sorgente, e da sola non riesco a liberarlo."',
      camel: 'Il vecchio Yusuf sedeva all\'ombra della sua tenda, accanto al suo cammello Vento. Ascoltò la storia di Sara con gli occhi socchiusi. "Anch\'io ho visto quella fonte prosciugarsi, quando ero bambino come te," disse infine. "Ma so che è tornata a scorrere una volta. Bisogna solo ricordare come."',
      wind: 'Tra le rocce, il vento sembrava intonare una melodia. Da un turbine di sabbia dorata prese forma Zefira, un uccello fatto di luce e polvere scintillante. "Ti ho sentita arrivare da lontano," disse. "Sali sul mio dorso: da qui in alto tutto si vede meglio."'
    },
    end: {
      dune_dig: 'Sara e Sabbiosa scavarono insieme, i granelli dorati che scivolavano come polvere di stelle. Sotto le loro mani apparvero antiche piastrelle blu, e poi l\'acqua, calda e limpida, che risalì gorgogliando. L\'oasi si risvegliò tutta insieme, e Sabbiosa le si strofinò contro la gamba, felice.',
      dune_legend: 'Sabbiosa raccontò la leggenda: la sorgente torna a scorrere solo per chi sa ascoltare fino in fondo, senza fretta. Sara si sedette e ascoltò ogni parola con il cuore aperto. Quando la volpe finì di parlare, un filo d\'acqua sgorgò lentamente dalla roccia, come se la sabbia avesse solo aspettato qualcuno pronto ad ascoltare.',
      dune_water: 'Sara porse a Sabbiosa l\'ultima acqua della sua borraccia, senza pensarci due volte. Commossa, la volpe scavò con le zampe un varco nascosto sotto l\'arco, rivelando la sorgente segreta. "Chi dona anche l\'ultima goccia," disse Sabbiosa, "merita di trovarne un fiume intero."',
      camel_memory: 'Yusuf chiuse gli occhi e lasciò riaffiorare un ricordo lontano: da bambino aveva visto suo padre inginocchiarsi tra due palme gemelle e cantare piano. Sara lo seguì fino a quelle stesse palme, si inginocchiò, e cantò. La sabbia tremò, e la sorgente tornò a scorrere come cent\'anni prima.',
      camel_map: 'Yusuf tirò fuori da un baule una mappa ingiallita, disegnata da suo nonno. Seguendola tra le dune, Sara trovò due rocce gemelle proprio come indicato, e sotto di esse un pozzo coperto di sabbia. Con un ultimo colpo di vento, la sabbia si aprì e l\'acqua tornò a brillare.',
      camel_together: 'Yusuf e il suo cammello Vento accompagnarono Sara per tutto il viaggio, portando in groppa gli otri vuoti. Quando finalmente trovarono la sorgente, la riempirono tutti insieme, ridendo per la fatica e la gioia. Tornarono al villaggio in tre, con l\'acqua che scintillava sotto il sole.',
      wind_sing: 'Sara cantò insieme a Zefira, e le loro voci si intrecciarono nel vento come un unico canto dorato. La melodia scivolò tra le rocce fino a un\'antica crepa sigillata, che si spezzò dolcemente lasciando scorrere l\'acqua. "La musica apre porte che la forza non troverebbe mai," disse Zefira sorridendo di luce.',
      wind_family: 'Zefira raccontò di essere l\'ultima di una lunga stirpe di spiriti del vento, custodi dell\'oasi da generazioni. "Quando la mia famiglia se ne andò, nessuno rimase a cantare alla sorgente," disse con tristezza dolce. Sara le promise che sarebbe tornata spesso a cantare con lei, e la sorgente, sentendosi di nuovo custodita, ricominciò a scorrere.',
      wind_sky: 'Zefira volò altissima sopra le dune, e da lassù Sara vide una macchia verde scura nascosta in una valle che da terra nessuno poteva scorgere. Scesero insieme, e lì, protetta dalle rocce, trovarono la sorgente intatta, che aspettava solo di essere ritrovata dall\'alto.'
    }
  },
  bell: {
    intro: 'Nel villaggio ai piedi del castello dorato viveva Tobia, che ogni mattina si svegliava al suono della grande campana sulla torre. Ma quel giorno il silenzio riempiva le strade: i fiori del mercato erano un po\' appassiti, e i vicini si guardavano tristi senza sapere perché. Il vecchio fornaio gli disse: "Dentro la campana vive un uccellino che canta per farla suonare. Forse è volato via." Tobia annodò le scarpe e corse verso il castello.',
    middle: {
      tower: 'Salendo i gradini a spirale, Tobia trovò la stanza della campana vuota, tranne un piccolo nido con dentro un uovo dorato incrinato. Da un angolo comparve Mastro Nando, il vecchio guardiano della torre. "Quell\'uovo aspetta solo un po\' di calore per schiudersi," disse con un sorriso stanco, "ma le mie mani ormai tremano troppo."',
      florist: 'La fioraia del mercato posò il suo annaffiatoio e sospirò. "La campana canta solo quando un\'allodola dorata vive felice nel giardino del castello," disse, "ma non la vedo da giorni." Gli porse un fiore che brillava appena. "Seguine il profumo: ti condurrà da lei."',
      feathers: 'Le piume dorate lo condussero fino al labirinto di rose nel giardino del castello. Lì, nascosta tra i petali, tremava una piccola allodola dal piumaggio d\'oro. Sembrava spaventata, come se avesse dimenticato come si canta.'
    },
    end: {
      tower_warm: 'Tobia scaldò l\'uovo tra le mani insieme a Mastro Nando, tenendolo vicino al cuore finché non si schiuse. Ne uscì un\'allodola piccolissima, che lanciò il suo primo verso proprio mentre il sole sorgeva. La campana, come svegliata da quel canto, suonò più dolce che mai.',
      tower_story: 'Mastro Nando raccontò che la campana suona solo quando il villaggio è pieno di gioia vera. Tobia allora raccolse fiori da ogni vicino e li portò in cima alla torre, riempiendola di colori e profumi. Sentendo tanta allegria intorno, la campana iniziò a suonare da sola.',
      tower_clues: 'Tra i vecchi ingranaggi della torre, Tobia trovò una scia di piume dorate che scendevano fino al giardino sottostante. Seguendola, scoprì l\'allodola nascosta tra le rose, sola e impaurita. Bastò la sua presenza gentile perché l\'uccellino si fidasse e tornasse a cantare.',
      florist_scent: 'Il profumo del fiore condusse Tobia fino a un angolo segreto del giardino, dove l\'allodola si era rifugiata. Si avvicinò piano, senza far rumore, e le si sedette accanto finché non smise di tremare. Poco dopo, l\'uccellino spiccò il volo cantando verso la torre.',
      florist_nest: 'Tobia trovò il vecchio nido dell\'allodola, ormai vuoto e spettinato dal vento. Con rametti e petali lo sistemò con cura, rendendolo di nuovo accogliente. Quando l\'allodola lo vide, tornò subito a viverci, e il giorno dopo la campana suonò come non faceva da tempo.',
      florist_plant: 'Tobia piantò il fiore luminoso proprio al centro della piazza, annaffiandolo ogni giorno con pazienza. Pian piano il fiore crebbe, attirando farfalle dorate e, infine, l\'allodola stessa, incuriosita da tanta bellezza. Il giorno del suo ritorno, la campana suonò per tutto il villaggio.',
      feathers_approach: 'Tobia si avvicinò piano canticchiando una ninna nanna che sua nonna gli cantava da piccolo. L\'allodola, rassicurata da quella melodia gentile, uscì dai petali e si unì al canto. Insieme, volarono cantando fino alla torre, e la campana suonò in coro con loro.',
      feathers_crumbs: 'Tobia posò qualche briciola di pane dorato vicino all\'allodola, senza avvicinarsi troppo. Piano piano, l\'uccellino si fidò e iniziò a beccare dalla sua mano. Da quel giorno lo seguì ovunque, tornando a cantare felice sulla torre del castello.',
      feathers_wait: 'Tobia restò seduto in silenzio accanto alle rose, senza fretta di muoversi. Con il tempo, l\'allodola smise di tremare e si avvicinò da sola, posandosi sulla sua spalla. Insieme tornarono alla torre, e la campana suonò più forte che mai.'
    }
  }
};

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
