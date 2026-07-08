# Storie Interattive — Documento di Progetto

> **Scopo di questo documento:** fornire a Claude Code (e a chiunque lavori al progetto) il contesto completo e *aggiornato*, allineato al codice reale, con le decisioni prese, le motivazioni e una roadmap passo-passo verso un MVP funzionante.
>
> *Versione 3.11 — 8 luglio 2026. **Correzioni dopo il secondo test in TV (medaglie + pausa + segni scelte).** Sistemati 6 punti emersi provando l'app sul televisore (modificati **solo `tv.html`** e l'asset `images/medals/first_story.png` → niente cambi a controller/protocollo, QR resta `?v=10`): (1) **tasto «🗑 Azzera medaglie» spostato** dal fondo del medagliere a un **pulsante fisso in alto a destra, sotto «Schermo intero»** (visibile solo in `#screen-medals`, toggle via `.visible` in `show()`); la conferma è ora un **piccolo modale centrale** (`#reset-confirm` fixed) invece che inline, con toast «azzerate» che non si sovrappone al tasto. (2) **«In pausa» reso discreto**: da velo a schermo intero (`rgba .82`, z-300) a un **badge piccolo in alto a destra** (sotto «Schermo intero», z-180) — immagine e sottotitoli restano visibili mentre la storia è ferma (il bimbo può continuare a guardare). (3) **Medaglia «La prima storia» finalmente visibile**: `first_story.png` aveva uno **sfondo nero opaco** (le altre medaglie sono ritagli trasparenti) e si confondeva col fondo scuro → ritagliata in trasparenza con flood-fill dai bordi (PIL+scipy, il libro/le scintille preservati; originale salvato fuori dal repo). Aggiunto cache-buster `?m=3` sulle `src` delle immagini medaglie (`MEDAL_ASSET_V`) così la TV non ripesca la versione nera dalla cache (§13.8). (4) **Segni sulle scelte dinamici** (`choiceMark()`): prima scelta → **stelline accese/spente + «n finali su N»** (es. ★★☆ «2 finali su 3»; pill piena «ramo completato» a ramo completo); seconda scelta già percorsa → **★ «opzione completata»**; sempre cliccabili, calcolati da `progress.js`. Stelline `★/☆` (glifi BMP, TV-safe) al posto delle emoji. (5) **Medaglie ingrandite e ridistribuite**: da 4 righe strette a **piramide su 3 righe** (Prima storia · Le storie · I regni+gran finale, unendo `realm:*` e `all` in una riga) → medaglie da ~90px a **~115px @720p / ~170px @1080p**, più spaziatura, sempre a schermo senza scroll (misurato in-browser: fondo a 677/720 e 977/1080). (6) **Medaglie col lucchetto non spariscono più**: il filtro `brightness(.3)` le rendeva invisibili sul fondo scuro TV → ora **silhouette grigie visibili** (`grayscale(1) brightness(.78)` + `opacity:.55`) col **lucchetto dorato** in evidenza. Semplificati anche i filtri delle medaglie (rimosse le catene lunghe di `drop-shadow` e le animazioni di `filter`, non affidabili sui browser TV — base statica sempre visibile). Tutto **verificato in Chrome (720p+1080p)**: screenshot dei tre stati (galleria, storia con segni, badge pausa) e ispezione delle proprietà calcolate (dimensioni, opacità, filtri, lucchetti, fit senza scroll). ⚠️ **Resta il test sulla Samsung reale** (rendering effettivo di silhouette/badge/segni): in cima alla checklist.*
>
> *Versione 3.10 — 7 luglio 2026. **Avvio a due step: schermo intero → QR.** Diviso in due passi l'avvio dell'app su `tv.html`, che prima erano compressi in un unico pannello QR: **(step 1)** al caricamento appare un velo scuro (`#fs-gate`) che oscura tutta la pagina e un pop-up in alto a destra con freccia `⤴` puntata verso il bottone «⛶ Schermo intero» — il bottone viene portato in primo piano e fatto pulsare (`.fs-highlight`); nessun QR ancora. **(step 2)** l'handler `onFsChange` (agganciato a `fullscreenchange`/`webkit`/`ms`) rileva l'ingresso in fullscreen, chiude il velo e mostra il pannello QR, **senza** più la scritta sul fullscreen (rimossa `.qr-fs-hint` da HTML e CSS). Reti di sicurezza: se il browser TV non supporta il fullscreen (o è già attivo) si salta lo step 1 e si va dritti al QR; link discreto «Continua senza →» (`skipFsGate()`) per non restare bloccati se il fullscreen fallisce in silenzio (§13.12); `closeFsGate()` chiamato anche quando il controller si collega, così il velo non blocca l'app se il telefono entra durante lo step 1. Modificato **solo `tv.html`** (niente `stories.js`/`transport.js`/`controller.html`) → **nessun bump `?v=`**, il QR resta `?v=10`. Verificato in preview desktop (stato DOM + screenshot dei due step, console pulita). ⚠️ **Il fullscreen reale NON è testabile in preview headless** (API gated da user-activation, §13.12): validati logica e grafica, ma l'ingresso fullscreen effettivo va provato sulla **TV Samsung vera** — in cima alla checklist manuale.*
>
> *Versione 3.9 — 7 luglio 2026. **Correzioni dopo il primo test in famiglia sulla TV.** Sistemati i punti emersi provando l'app sul televisore con la famiglia: (1) **font più grandi** su scelte (max 22→28px), sottotitoli (30→36px, e meno sottili: weight 300→400), morale (20→28px) e descrizioni delle card — erano poco leggibili da divano; (2) **segno finali «🌟 n/tot»** trasformato da testino in una **pillola dorata** con sfondo/bordo, ben visibile (prima non si capiva); (3) **medaglie del medagliere ingrandite e ridistribuite** (~1,5×, più spazio, piramide 1-3-3-1): le dimensioni verticali ora scalano con `vh` così la galleria **resta dentro lo schermo anche a 720p** (misurato in-browser: fondo del medagliere a 709/720 e 955/1080), sempre con ripiego px statico prima di ogni `clamp`/`vh` per i browser TV vecchi (§13.8); (4) **fine storia → mappa dei regni** invece che alle storie del regno: `restart()` fa `show('screen-list')`+`sendState()`, così TV e controller restano allineati (era il bug del disallineamento segnalato); (5) **pulsante Pausa** (toggle «⏸ Pausa / ▶ Riprendi» sul controller, per quando il bimbo si distrae): la TV ferma audio + sottotitoli + timer della morale e mostra l'overlay «In pausa», riprendendo dal punto esatto — il motore dei sottotitoli è stato reso **ri-pianificabile** (`subPlan`/`scheduleSubtitles(fromTime)`) per non sfasarli alla ripresa. Nuovi messaggi di protocollo `pause`/`resume`; (6) **reset progressi**: tasto «🗑 Azzera medaglie» in fondo al medagliere (TV) con conferma inline, comandabile **anche dal controller** quando si è nella galleria (nuovi messaggi `reset-ask`/`reset`/`reset-cancel`, conferma mostrata su entrambi) — risponde alla domanda «come si azzera la memoria della TV»: cancella la chiave `localStorage` `storie-progress-v1`. La **festa a fine storia resta solo al 1° sblocco** (scelta confermata dall'utente): non era rotta, semplicemente non ripartiva su medaglie già conquistate — ora col reset si rivede da capo. Cache-busting QR a `?v=10` (controller cambiato). ⚠️ Tutte queste novità **non sono ancora provate su TV Samsung reale**: restano in cima alla checklist manuale (`TEST_CHECKLIST.md` §B4/B7).*
>
> *Versione 3.8 — 7 luglio 2026. **Code review completa + batteria di test (nessun bug funzionale trovato).** Prima review a tutto tondo del progetto dopo il sistema medaglie: validazione automatica dati↔asset (`STORIES`/`REALMS` ↔ 39 audio + 15 immagini + 7 medaglie, 9 finali×3 storie tutti raggiungibili — 18/18 check ok), test in-browser a 720p/1080p (mappa, motore storia, festa/galleria medaglie, controller, risincronizzazione — tutto verde), test logico della transizione esplorata→completa e della non-ripetizione della festa. Corrette **3 fragilità di compatibilità smart TV** trovate in review: (1) rimosso ogni `gap:` su flexbox (introdotto col sistema medaglie) e sostituito con `margin` sui figli — il flex-`gap` non è affidabile sui browser TV più vecchi e non ha fallback via `@supports`; (2) rimosso `backdrop-filter:blur()` da `#btn-home` (fondo reso più opaco); (3) aggiunto `onerror` sull'immagine della mappa (`buildMap()`), che ora degrada a un placeholder invece di far collassare i marker in alto a sinistra. Migliorata anche l'estetica della mappa (spazio verticale riservato ridotto, alone radiale dietro il fondale). Cache-busting QR a `?v=9`. Nuovo file **`TEST_CHECKLIST.md`**: checklist ripetibile con la parte automatica già eseguita e la checklist manuale per la **TV Samsung reale** (ancora il solo grande "da fare" aperto, ora con priorità sulla galleria/festa medaglie mai testate su un browser TV vero).*
>
> *Versione 3.7 — 6 luglio 2026. **Sistema medaglie implementato (galleria + festa).** Aggiunta la **galleria** in `tv.html` (`#screen-medals`): bottone «🏅 Medaglie» sulla mappa e «Le mie medaglie» sul controller (`{action:'medals'}` → la galleria appare sulla TV, telefono telecomando), medaglie generate dinamicamente da STORIES/REALMS con stati (da conquistare / esplorata / completa) calcolati da `progress.js`, layout compatto TV-safe; stato `screen-medals` nella risincronizzazione. Aggiunta la **festa a fine storia** (`#end-medals`): al **primo sblocco** mostra le medaglie appena conquistate affiancate + `canvas-confetti` (coriandoli + **fuochi** sugli sblocchi "accesi"). **`canvas-confetti` caricato `async`** (bloccante = rischio "app morta" su TV se il CDN è lento). Cache-busting QR a `?v=8`. Restano il test su TV reale e il click-per-ingrandire in galleria.*
>
> *Versione 3.6 — 6 luglio 2026. **Mappa dei regni dipinta + tutti gli asset delle medaglie.** (1) **Nuova mappa della home**: fondale dipinto (Gemini, stile delle storie) che «fluttua» sul nero senza cornice (bordi sfumati a trasparente con Pillow), con **6 marker cliccabili** al posto dei poligoni SVG piatti — `buildMap()` riscritta, coordinate `mapX/mapY` in `REALMS`, dimensionamento TV-safe senza scroll a 720p, cache-busting `?v=7`; asset in `images/map/world.png`. ⚠️ Da testare su TV reale. (2) **Asset medaglie completi** (`images/medals/`): landmark dei regni (`realm_forest/kingdom/desert.png` — generati isolati con Gemini nella chat della mappa, i ritagli diretti dalla mappa erano troppo piccoli) e **livello 1 deciso e fatto**: il **Libro delle Storie** (`first_story.png`, libro aperto + stella dorata). Livelli 6/7 riusano la mappa stessa. Resta solo la **galleria in `tv.html`** (+ festa a fine storia).*
>
> *Versione 3.5 — 5 luglio 2026. **Sistema medaglie progettato + primi asset.** Definito il sistema di medaglie (spec completa in `SISTEMA_MEDAGLIE.md` v2.0): **7 livelli a piramide derivati da `progress.js`** (nessun dato nuovo), grafica **2.5D** in CSS (niente WebGL, niente rotazione), tre stati **«da conquistare / esplorata / completa (accesa)»** al posto di oro/argento (l'oro/argento non è percepito dai 3-6 anni), forma **«ritaglio sul corpo»** (la medaglia ha la sagoma del personaggio vero). Creati i ritratti scontornati dei 3 protagonisti in `images/medals/` (`oasis`/`bell`/`firefly`) con `rembg` in locale, **ritagliando dalle immagini esistenti** (coerenza garantita, non rigenerati). Restano: simboli dei regni e la **galleria in `tv.html`** (non ancora implementata). Ricetta scontorno aggiunta a `BRIEF_IMMAGINI.md`.*
>
> *Versione 3.4 — 5 luglio 2026. **Progressi persistenti + robustezza cross-device. Fase 1 (MVP) completata al 100%.** Novità: (1) **salvataggio progressi** in `localStorage` via nuovo modulo `progress.js` (ultima storia, storie completate, finali scoperti) con contatore «X / 9 finali scoperti» sulle card e segni 🌟 sulle scelte già esplorate (restano cliccabili); attenzione: i progressi sono legati al browser della TV, non alla persona — vedi step evolutivo in Fase 3; (2) **tasto «Esci dalla storia»** sul controller (storia avviata per sbaglio); (3) **anti-doppio-tap**: `pick()` accetta solo la scelta del passo corrente; (4) **risincronizzazione**: la TV risponde a `hello` con `{action:'state',…}` e il controller salta alla schermata giusta anche a storia iniziata; (5) **riconnessione**: watchdog sull'heartbeat in `transport.js`, stato `reconnecting` visibile su TV e controller, ri-`hello` automatico. Chiusi anche il test su rete dati 4G (indipendenza dalla LAN confermata) e la rigenerazione della chiave ElevenLabs. Cache-busting a `?v=6` (transport + QR). La v3.3 aveva ridisegnato la schermata storia (immagine a larghezza piena in rapporto nativo 1856×576, scelte sovrapposte) e aggiunto lo schermo intero (solo via telecomando, §13); le basi restano: `stories.js` fonte unica, WebSocket puro (niente `supabase-js` sulle smart TV), stanza + QR, GitHub Pages, compatibilità smart TV (§13).*
>
> 📈 **Strategia commerciale e priorità di prodotto:** vedi `storie-interattive-strategia-commercializzazione.md` (modelli di monetizzazione, roadmap verso i primi utenti, funzionalità decise e loro ordine di sviluppo). Le decisioni di prodotto prese lì sono riflesse nella roadmap di questo documento (§10).

---

## 1. Obiettivo del progetto

Applicazione web **family-friendly** per raccontare storie interattive in modalità "secondo schermo":

- **TV / schermo grande** (`tv.html`) → mostra la storia: immagine di scena, sottotitoli, narrazione vocale, scelte, progresso, morale finale.
- **Telefono (controller)** (`controller.html`) → il genitore o il bambino sceglie le opzioni della storia.

### Decisione fondamentale d'uso (confermata)

L'uso reale previsto è **telefono e TV su dispositivi DIVERSI** (telefono in mano, storia sulla TV/PC), con l'app **pubblicata online** e accessibile a **famiglia e amici**.

> ⚠️ **Conseguenza tecnica cruciale:** questo scenario **non è compatibile con `BroadcastChannel`**, che funziona solo tra schede dello *stesso browser sullo stesso dispositivo*. Per la comunicazione tra dispositivi diversi serve un servizio di realtime online (vedi §4). Questa è la modifica architetturale principale rispetto alla v1.0.

---

## 2. Stack tecnico

| Voce | Scelta v2.0 | Note rispetto alla v1.0 |
|---|---|---|
| Linguaggio | HTML5 + CSS3 + JavaScript vanilla (no framework) | invariato (scelta deliberata) |
| Font | Google Fonts — Playfair Display (titoli) + Crimson Pro (corpo) | invariato |
| Immagini scena | **File locali** in `images/<storia>/...`, generate con Gemini (via browser) e convertite in `.jpg` | ✅ **FATTO**: 5/5 per tutte e 3 le storie (`oasis`, `bell`, `firefly`) |
| Sintesi vocale | **Audio pre-generati (file) + Web Speech API come ripiego** | ✅ **FATTO** per `oasis`, `bell` e `firefly` (39 mp3 via ElevenLabs, script `generate-audio.mjs`, vedi §6) |
| Comunicazione cross-device | **Supabase Realtime via WebSocket puro** | ✅ **funzionante e testato su TV reale** (4 luglio 2026) e **su rete dati 4G** (5 luglio 2026): indipendente dalla LAN. Riconnessione con watchdog e risincronizzazione automatica (§4.2) |
| Comunicazione stesso-dispositivo | `BroadcastChannel('storie-interattive')` | ✅ ripiego automatico dentro `transport.js`, sempre attivo |
| Pairing TV↔telefono | **Codice stanza** veicolato via **QR code** | ✅ **implementato**: la TV genera il codice (`sessionStorage`), lo mostra nel pannello QR e lo include nell'URL (`?room=`); il controller lo legge e entra nella stanza |
| Hosting | **GitHub Pages** | ✅ **ONLINE**: `https://ninjaraveii.github.io/storie-interattive/` — deploy automatico a ogni push su `main` |

---

## 3. File del progetto (stato reale del codice)

### `stories.js` — Fonte unica dei dati (✅ dal 3 luglio 2026)

Contiene `STORIES[]` completo (steps, testi, keyword, 9 finali) **più** le anteprime del controller in un campo `ctrl` per storia (`ctrl.intro`, `ctrl.middle.<chiave>`). Consumatori:
- `tv.html` → usa la struttura completa;
- `controller.html` → deriva anteprime e scelte per fase in `phaseData()`;
- `generate-audio.mjs` (Node, via `createRequire`) → deriva i testi degli mp3.

**Aggiungere/modificare una storia = toccare solo questo file** (più l'assegnazione al regno in `REALMS` di `tv.html`).

### `transport.js` — Comunicazione TV ↔ controller (✅ dal 3 luglio 2026)

`createTransport(roomCode, onMessage, onStatus)` unifica i due trasporti: canale Supabase Realtime `storie-<codice>` (cross-device) + `BroadcastChannel` (ripiego stesso-dispositivo, sempre attivo). In testa al file la config `SUPABASE_URL` / `SUPABASE_KEY` (publishable, pubblica per design): se vuota, funziona solo il ripiego locale e `roomCode` resta `null`.

> ⚠️ **Niente libreria `supabase-js`.** Il client ufficiale non gira sui browser delle smart TV. `transport.js` implementa a mano il **protocollo Phoenix** (quello di Supabase Realtime) su **WebSocket nativo**, in **ES5**: `phx_join` del canale `realtime:storie-<codice>`, heartbeat ogni 25s, eventi `broadcast`, riconnessione automatica alla chiusura. Ogni messaggio porta un `_mid` per la deduplica (lo stesso `send` può arrivare sia via WebSocket sia via BroadcastChannel quando telefono e TV sono sullo stesso dispositivo). Dal 5 luglio 2026: **watchdog sull'heartbeat** (se entro 10s dall'heartbeat non arriva nulla dal server, il socket viene chiuso per innescare la riconnessione — copre le connessioni "morte" senza evento `close`) e stato **`reconnecting`** in `onStatus` (distinto da `error`: la stanza era attiva e sta tornando), mostrato dal badge della TV e dalla status bar del controller.

### `progress.js` — Progressi persistenti (✅ dal 5 luglio 2026)

Modulo `Progress` (IIFE, ES5, tutto in try/catch: se `localStorage` manca o è in sola lettura si degrada a memoria volatile). Salva sotto la chiave `storie-progress-v1`: `lastStory`, `completed` (storie completate), `endings` (finali scoperti per storia). API: `recordEnding(storyId, endKey)`, `endingsCount`, `branchEndingsCount(storyId, c1)`, `hasEnding`, `isCompleted`, `getLastStory`, `setLastStory`, `reset`. Generico per design: non conosce `STORIES`/`REALMS`. Consumatore: `tv.html` (registra il finale allo step `end`, contatore sulle card, segni 🌟 sulle scelte). ⚠️ I progressi sono legati **al browser del dispositivo TV** (vedi Fase 2/3 in §10).

### `tv.html` — Schermo grande (TV / laptop)

**Schermate (UI):**
1. `#screen-list` — **mappa del mondo in SVG** con i "regni" (NON una semplice griglia: vedi §7).
2. `#screen-realm` — lista delle storie di un regno selezionato.
3. `#screen-story` — scena attiva: immagine full-width, sottotitoli sovrapposti, etichetta fase, indicatore voce, scelte, morale.
4. `#screen-end` — schermata di fine storia.
+ Pannello **QR code** (`#qr-panel`) e badge controller in basso a destra.

**Logica principale:**
- `STORIES[]` — array con tutte le storie (struttura al §5).
- `REALMS[]` — array dei regni della mappa (§7).
- `buildMap()` — disegna la mappa SVG dei regni.
- `openRealm(id)` / `startStory(id)` — naviga regno → storia.
- `renderStep()` — renderizza lo step corrente (intro / middle / end).
- `pick(key, stepIndex)` — registra la scelta e avanza.
- `speak(text, audioSrc, cb)` — narrazione: riproduce l'mp3 pre-generato (`audioPath()`) sincronizzando i sottotitoli in proporzione alla durata; se il file manca o non carica, ripiego automatico su `speakFallback()` (Web Speech, frase per frase). Vedi §6.
- `loadImg(path)` + `imgPath(storyId, type, variant)` — caricano **immagini locali**.
- `showQR()` — genera il QR verso `controller.html` con una libreria QR **locale via CDN** (non più un servizio esterno), risolvendo l'URL con `new URL(...)` invece di una replace di stringa fragile (§13).
- Listener di comunicazione → riceve `start` / `pick` / `restart`.

### `controller.html` — Telefono (controller)

**Schermate (UI):**
1. `#ctrl-list` — istruzioni + lista storie.
2. `#ctrl-choices` — scelte della fase corrente.
3. `#ctrl-end` — fine storia + tasto restart.
+ Status bar in basso con feedback d'invio.

**Logica principale:**
- `STORIES[]` — **copia ridotta** (`id, icon, title, tag, phases`). La fase 2 (`phases[1]`) è ora **branch-aware**: ha un oggetto `variants` con preview/scelte reali per ciascuna chiave di scelta 1, non più testi segnaposto generici.
- ~~`PHASE2_KEYS`~~ — **rimossa**: era la mappa che traduceva le chiavi-segnaposto della fase 2 nelle chiavi reali. Sostituita rendendo `variants` direttamente branch-aware (vedi §13, lezione appresa).
- `selectStory(id)` → invia `{action:'start', id}`.
- `pickChoice(key)` → invia `{action:'pick', key, si:phase}`.
- `doRestart()` → invia `{action:'restart'}`.

> 🔧 **Debito tecnico noto (resta):** i dati delle storie sono ancora duplicati tra `tv.html` e `controller.html` (testi diversi, struttura simile). `PHASE2_KEYS` è stata eliminata, ma l'unificazione in un `stories.js` unico resta un obiettivo di Fase 1 (§10).

---

## 4. Comunicazione tra dispositivi (architettura v2.0)

### Perché cambia

`BroadcastChannel` = messaggi tra schede dello **stesso browser/stesso dispositivo**. Non attraversa la rete. Per "telefono in mano + TV separata" è inutilizzabile.

### Soluzione: Supabase Realtime (canale broadcast)

Un servizio online fa da "centralino": il telefono pubblica un messaggio su un canale, la TV — iscritta allo stesso canale — lo riceve all'istante. **Il protocollo dei messaggi resta identico** (§4.2): cambia solo il trasporto.

- Piano gratuito ampiamente sufficiente per uso familiare (centinaia di connessioni, milioni di messaggi/mese).
- Si usa da **JavaScript vanilla via WebSocket nativo** (niente libreria: non gira sulle smart TV — vedi §3, `transport.js`), coerente col "no framework".
- La chiave usata lato browser è la **publishable key** (pubblica per progetto): **può stare nel file statico** senza rischi di sicurezza (a differenza di chiavi segrete come quella di ElevenLabs).

### 4.1 Pairing con "codice stanza"

Online più famiglie possono usare l'app insieme: ogni telefono deve parlare **solo con la propria TV**. Soluzione:
- La TV genera un **codice stanza** breve (es. `LUNA42`).
- Il **nome del canale** diventa dinamico: `storie-<codice>` (es. `storie-LUNA42`).
- Il **QR già esistente** codifica l'URL del controller **con il codice stanza incluso**; il telefono lo inquadra ed entra automaticamente nella stanza giusta.

### 4.2 Protocollo messaggi (invariato)

Oggetti JSON inviati sul canale della stanza.

| Azione | Payload | Chi invia | Chi riceve |
|---|---|---|---|
| Saluto (collegamento) | `{action:'hello'}` | controller | tv (toglie il QR e risponde con `state`) |
| Stato corrente (risincronizzazione) | `{action:'state', screen, realmId, storyId, si, c1}` | tv | controller (ricostruisce la schermata giusta) |
| Apertura regno | `{action:'realm', id:'forest'}` | controller | tv (mostra il regno) |
| Torna alla mappa | `{action:'home'}` | controller | tv |
| Apri galleria medaglie | `{action:'medals'}` | controller | tv (apre `#screen-medals`) |
| Avvio storia | `{action:'start', id:'oasis'}` | controller | tv |
| Scelta opzione | `{action:'pick', key:'dune', si:0}` | controller | tv |
| Restart (fine storia) | `{action:'restart'}` | controller | tv (torna alla **mappa dei regni**) |
| Pausa / Riprendi | `{action:'pause'}` / `{action:'resume'}` | controller | tv (ferma/riprende audio, sottotitoli, timer morale; overlay «In pausa») |
| Reset medaglie | `{action:'reset-ask'}` → `{action:'reset'}` / `{action:'reset-cancel'}` | controller | tv (apre la conferma nel medagliere, poi azzera o annulla) |

`si` = step index (0 = intro, 1 = middle). Ogni messaggio porta anche un `_mid` (id univoco aggiunto da `transport.js` per la deduplica locale/online).

> ✅ **Risincronizzazione (fatta, 5 luglio 2026):** a ogni `hello` (telefono appena collegato *o riconnesso dopo una caduta*) la TV risponde con `state`; il controller — che ora ascolta i messaggi in arrivo — salta direttamente alla schermata coerente (mappa / regno / fase 1 / fase 2 / finale). Anti-doppio-tap: `pick(key,si)` sulla TV accetta solo `si === stepIdx` corrente, quindi doppi tap e messaggi in ritardo/fuori ordine vengono ignorati.

---

## 5. Struttura dati delle storie

Ogni storia in `tv.html` segue questo schema:

```js
{
  id: 'oasis',            // identificatore univoco
  tag: 'Avventura · bambini',      // etichetta genere
  icon: '🌵',
  title: 'L\'Oasi delle Sabbie Dorate',
  desc: 'Descrizione breve per la card.',
  steps: [
    // STEP 0 — INTRO
    {
      type: 'intro',
      label: "L'inizio",
      text: '…testo narrativo…',
      keyword: 'desert oasis child golden sand',   // spunto in inglese per generare l'immagine (§6 di GUIDA_STORIE.md)
      choices: [
        { text: 'Testo opzione A', key: 'dune' },
        { text: 'Testo opzione B', key: 'camel' },
        { text: 'Testo opzione C', key: 'wind' }
      ]
    },
    // STEP 1 — MIDDLE (ramificato per choice1)
    {
      type: 'middle',
      label: 'Il cuore della storia',
      variants: {
        dune:  { text: '…', keyword: '…', choices: [ … ] },
        camel: { text: '…', keyword: '…', choices: [ … ] },
        wind:  { text: '…', keyword: '…', choices: [ … ] }
      }
    },
    // STEP 2 — END (ramificato per choice1 + choice2)
    {
      type: 'end',
      label: 'Il finale',
      ends: {
        'dune_dig': { text: '…', moral: '…', keyword: '…' },
        // … 9 combinazioni totali (3 × 3)
      }
    }
  ]
}
```

**Nomenclatura chiavi `ends`:** `<key_choice1>_<key_choice2>` (es. `dune_dig`, `camel_map`).

### Storie e ramificazioni reali

| ID | Titolo | Tag | Regno | Scelta 1 (chiavi) |
|---|---|---|---|---|
| `oasis` | L'Oasi delle Sabbie Dorate | Avventura · bambini | Le Terre Dimenticate (deserto) | `dune` / `camel` / `wind` |
| `bell` | La Campana d'Oro del Villaggio | Fiaba · bambini | Le Terre di Mezzo | `tower` / `florist` / `feathers` |
| `firefly` | La Notte delle Lucciole | Buonanotte · bambini | La Grande Foresta | `owl` / `stream` / `oak` |

Ogni storia: **3 opzioni per fase → 9 finali distinti**.

> Le 3 storie precedenti (`forest`, `sea`, `mountain`) erano contenuti dimostrativi ("dummy") e sono state **rimosse** insieme ai loro regni attivi. `oasis` e `bell` sono le prime due storie scritte seguendo `GUIDA_STORIE.md`, pensate anche per validare l'intera pipeline (testo → audio → immagini). `firefly` (3 luglio 2026) è la prima con **protagonista animale** (l'orsetto Bruno) e la prima con tag di genere "Buonanotte", in linea con la varietà di generi indicata dal documento di strategia.

### Immagini attese (file locali)

Struttura cartella `images/`:
```
images/<storia>/intro.jpg
images/<storia>/middle_<chiaveScelta1>.jpg   (es. middle_deep.jpg)
images/<storia>/end.jpg
```
Conteggio per storia: **1 intro + 3 middle + 1 end = 5 immagini**.

> ⚠️ **Scelta deliberata (non un bug):** tutti i **9 finali** condividono **un'unica** `end.jpg` neutra/trionfale — a differenza dell'audio, dove ogni finale ha testo diverso e quindi *deve* avere un mp3 diverso. Decisione confermata: si resta con 5 immagini finché non si verifica che lo stile regge ed è coerente; solo dopo si passerà a 9 immagini di finale distinte (13 per storia, vedi roadmap Fase 3).

---

## 6. Voce narrante (✅ implementata per tutte e 3 le storie)

**Strategia: audio pre-generati come file statici** (come le immagini), con **Web Speech API** come ripiego automatico.

Motivazioni:
- I testi sono **fissi** → si generano gli audio **una volta** e si riusano, con qualità costante.
- **Nessuna chiave segreta online** → nessun rischio di sicurezza, nessun server intermedio da costruire.
- **Funziona su tutti i dispositivi** (anche mobile, dove la voce automatica del browser è inaffidabile).
- Costo **una tantum**, non a ogni lettura.

Struttura cartella `audio/` (**attiva**, 39 file già generati):
```
audio/<storia>/intro.mp3
audio/<storia>/middle_<chiaveScelta1>.mp3
audio/<storia>/end_<chiaveScelta1>_<chiaveScelta2>.mp3   (9 finali)
```

**Come si generano (script pronto, `generate-audio.mjs`):**
- Node legge i testi delle storie (copiati nello script), chiama l'API ElevenLabs e salva gli mp3 in `audio/<storia>/`.
- La chiave API **non è mai nel codice**: lo script la legge da `.env.local` (file locale, escluso da git tramite `.gitignore`), oppure da una variabile d'ambiente `ELEVENLABS_API_KEY`.
- Rilancio sicuro: lo script salta i file già presenti, quindi si può interrompere e riprendere.
- **Chiave API ElevenLabs — permessi consigliati:** solo endpoint "Text to Speech" abilitato (principio del minimo privilegio); credito per chiave impostato a un numero esplicito (mai `0`, che nella UI di ElevenLabs è ambiguo) — per 2 storie (26 audio, ~7.500 caratteri totali) un limite di 10000 crediti è ampiamente sufficiente. La modalità gratuita/a pagamento dipende dall'abbonamento dell'account (pagina Subscription/Billing su elevenlabs.io), non dal limite impostato sulla singola chiave.
- **Riproduzione lato client:** `speak(text, audioSrc, cb)` in `tv.html` riproduce l'mp3 con `<audio>`, sincronizzando i sottotitoli in proporzione alla lunghezza di ogni frase rispetto alla durata totale (non ci sono audio per singola frase). Se `audioSrc` manca o l'audio fallisce a caricare, ripiega automaticamente su Web Speech (frase per frase, come prima).

---

## 7. Mappa del mondo e regni (`REALMS`)

La home (`#screen-list`) è una **mappa SVG** con 6 regni cliccabili. Ogni regno ha forma poligonale, colore, icona, descrizione e una lista `storyIds`.

| Regno | Icona | Stato |
|---|---|---|
| La Grande Foresta | 🌲 | **attivo** (`firefly`) |
| Le Cime Tempestose | 🏔️ | bloccato ("Presto…") — storia dummy rimossa |
| L'Oceano Profondo | 🌊 | bloccato ("Presto…") — storia dummy rimossa |
| Le Terre Dimenticate | 🌵 | **attivo** (`oasis`) |
| Le Terre di Mezzo | 🏰 | **attivo** (`bell`) |
| Il Cielo Infinito | ✨ | bloccato ("Presto…") |

I regni senza storie hanno classe `.locked` (non cliccabili). Aggiungere storie a un regno = aggiungere id in `storyIds`.

---

## 8. Design system

Variabili CSS principali (`:root` su entrambi i file):

| Variabile | Valore | Uso |
|---|---|---|
| `--bg` | `#0a0a0f` | Sfondo pagina |
| `--surface` | `#12121a` | Superfici (solo tv) |
| `--card` | `#1a1a26` | Card e contenitori |
| `--gold` | `#c9a84c` | Accenti, bordi, etichette |
| `--gold2` | `#e8c96b` | Titoli principali |
| `--text` | `#f0ead6` | Testo principale |
| `--muted` | `#8a8070` | Testo secondario / corsivi |
| `--accent` | `#4a90a4` | Indicatori di stato |

Tema **dark fantasy / libro illustrato** — nessun colore vivace, tutto caldo e soffuso.

---

## 9. Problemi noti

### Risolti
1. **✅ SICUREZZA — chiave ElevenLabs esposta.** La API key è stata **rimossa dal codice** e **ripulita anche dalla cronologia di GitHub**. *Promemoria di buona pratica ancora valido:* se il repository è mai stato pubblico prima della pulizia, la vecchia chiave va considerata "potenzialmente vista da altri" — se non già fatto, **rigenerarla su elevenlabs.io**.
2. **✅ BUG voce.** Risolto implementando la strategia audio pre-generati (§6): `speak()` ora riproduce gli mp3 reali con ripiego Web Speech, non c'è più alcun tentativo di chiamata ElevenLabs a runtime nel browser.
3. **✅ Sottotitoli invisibili.** `.subtitle-bar` non aveva alcuna regola di posizionamento CSS: `#img-loading` (con `height:100%` in flusso normale) lo spingeva fuori dal riquadro immagine, che ha `overflow:hidden`. Il testo veniva scritto correttamente nel DOM ma non era mai visibile a schermo. Vedi lezione appresa in §13.
4. **✅ QR rotto/fragile.** `showQR()` costruiva l'URL con `location.href.replace('tv.html','')`, che si rompeva se l'URL non conteneva letteralmente `tv.html` (es. hosting con URL "puliti"). Sostituito con risoluzione URL standard (`new URL(...)`) e con una libreria QR **locale via CDN** al posto del servizio esterno `api.qrserver.com`.
5. **✅ Dati duplicati (parziale).** `PHASE2_KEYS` è stata **eliminata**: il controller ora ha scelte di fase 2 branch-aware direttamente nei dati (`variants`), niente più testi segnaposto generici. Resta comunque la duplicazione dei dati tra i due file (vedi punto 7).
6. **✅ Voce robotica dopo "Home".** `stopSpeak()` azzerava `currentAudio.src`, il che innescava l'evento `onerror` dell'`<audio>` ancora in ascolto: la promise di `speakPregenerated()` si risolveva a `false` e `speak()` cadeva sul ripiego Web Speech **anche quando l'interruzione era voluta**. Corretto rimuovendo i listener (`onended/onerror/onloadedmetadata`) prima di fermare l'audio.
7. **✅ Immagine che copriva il contenuto sotto (desktop).** Con finestre più basse, l'altezza fissa dell'immagine (`clamp(200px,42vh,420px)`) lasciava troppo poco spazio a etichetta/scelte/morale, che venivano tagliate da `overflow:hidden`. Ridotta l'altezza immagine (`clamp(180px,34vh,360px)`) e aggiunto scroll verticale (`overflow-y:auto` su `#app`) come rete di sicurezza per finestre molto piccole.
8. **✅ Immagini incomplete — risolto (3 luglio 2026).** Tutte e 3 le storie hanno 5/5 immagini in `images/` (1856×576, jpg), generate con Gemini via browser: `bell` completata nella stessa conversazione dell'`intro.jpg` (Tobia coerente), `firefly` in una conversazione nuova (Bruno coerente). Coerenza dei personaggi verificata visivamente su tutte le scene.

9. **✅ Dati duplicati — risolto (3 luglio 2026).** Unificati in `stories.js` (fonte unica, §3): `tv.html`, `controller.html` e `generate-audio.mjs` derivano tutto da lì. Verificato con deep-compare contro i dati precedenti.
10. **✅ QR + pairing — implementato (3 luglio 2026).** Codice stanza generato dalla TV, incluso nel QR (`?room=`), letto dal controller (§4.1).
11. **✅ Sfumatura che copriva l'immagine — risolto (3 luglio 2026).** Banda ridotta (55%→30% di altezza) e alleggerita (opacità .92→.72): illustrazione interamente visibile, sottotitoli ancora leggibili (hanno una text-shadow propria).
12. **✅ Morale visibile troppo poco — risolto (3 luglio 2026).** Permanenza proporzionale alla lunghezza (minimo 12s) + pulsante "Continua ➜" per proseguire subito; timer ripulito in `stopSpeak()`.
13. **✅ Cross-device — funzionante e testato su TV reale (4 luglio 2026).** Progetto Supabase configurato; il telefono inquadra il QR, entra nella stanza e pilota la TV (regno, storia, scelte). Il trasporto è passato da `supabase-js` a un client WebSocket puro perché la libreria non gira sui browser delle smart TV (§13).
14. **✅ Compatibilità browser smart TV (4 luglio 2026).** Prima del test su TV Samsung la pagina era muta: risolti a cascata errore di sintassi (optional chaining), libreria Supabase non eseguibile, cache che mescolava versioni dei file, e immagini invisibili (CSS `clamp()` non supportato → riquadro ad altezza zero). Dettagli e regole in §13.
15. **✅ Terza scelta tagliata su TV + immagine ingrandita (4 luglio 2026).** Le scelte erano impilate *sotto* l'immagine: con testi lunghi che andavano a capo, la colonna superava i `100vh` e la terza scelta usciva dallo schermo (la TV non scrolla). Risolto spostando le scelte in **overlay sovrapposto** in fondo all'immagine (dove stanno i sottotitoli, che ora si alternano con le scelte): stando *sopra* l'immagine la loro altezza non entra più nel layout → overflow impossibile a qualsiasi risoluzione (verificato `pageScrolls:false` a 720p e 1080p). Contestualmente l'immagine è stata ingrandita a larghezza piena bloccata sul rapporto nativo 1856×576 (`height:0;padding-top:31.03%`, niente `aspect-ratio` per compatibilità TV) e centrata a letterbox: resta nitida (scala ~0,99×, mai ingrandita, nessun crop). **Vincolo scoperto:** le immagini sono panoramiche 3,22:1 alte solo 576px → un vero fullscreen 16:9 le ingrandirebbe ~1,9× (sgranatura) e ne taglierebbe ~45% ai lati; il massimo nitido è la fascia a larghezza piena in rapporto nativo (§13).
16. **✅ Schermo intero + pulizia pannello QR (4 luglio 2026).** Aggiunto pulsante «Schermo intero» (in alto a destra) che nasconde la barra del browser TV; essendo l'app una pagina sola, una volta in fullscreen ci si resta per tutta la sessione. Sul pannello QR: avviso che invita a premere schermo intero col telecomando prima di proseguire col telefono, e rimosso il link `http/...` sotto il codice stanza (inutile). *Limite noto:* il fullscreen si attiva **solo col telecomando** (vedi §13) — l'automatismo al collegamento del controller è stato tentato e **rimosso** perché non funziona.

17. **✅ Test su reti diverse (5 luglio 2026).** Verificato col telefono su rete dati (4G): il cross-device funziona anche fuori dalla LAN, non dipende dalla rete locale.
18. **✅ `gap` flexbox introdotto col sistema medaglie — risolto (7 luglio 2026).** La review ha trovato che il sistema medaglie (v3.7) aveva introdotto l'unica feature CSS moderna del progetto priva di fallback: `gap:` su flexbox (Chromium ≥84, 2020), usato in `.medals-row`, `#end-medals` e in vari punti già esistenti (`.choices`, `.realm-header`, badge…). Sostituito **ovunque** in `tv.html` e `controller.html` con `margin` sui figli, universali su qualsiasi browser TV. Rimosso anche `backdrop-filter:blur()` da `#btn-home` (fondo reso più opaco: non tutti i browser TV lo supportano).
19. **✅ Mappa senza ripiego se l'immagine non carica — risolto (7 luglio 2026).** `buildMap()` non aveva `onerror` sull'`<img>` della mappa (a differenza delle scene): se `images/map/world.png` non si decodifica, i marker (posizionati in %) collasserebbero in alto a sinistra. Aggiunto un placeholder (dimensioni esplicite + sfumatura) come rete di sicurezza.

### Ancora aperti
- **Test su TV Samsung reale del sistema medaglie (galleria + festa).** Introdotto in v3.7, non ancora provato su un browser TV vero: priorità #1 per la prossima sessione hands-on con la TV (checklist in `TEST_CHECKLIST.md` §B4).

---

## 10. ROADMAP passo-passo

### ✅ Già fatto
- Struttura a due file (tv + controller).
- 3 storie complete (intro → middle ramificato → 9 finali): `oasis`, `bell`, `firefly`. Le 3 storie dummy precedenti sono state rimosse.
- Mappa del mondo SVG con regni (3 attivi — deserto, Terre di Mezzo, Grande Foresta — + 3 bloccati).
- Sottotitoli sincronizzati con la narrazione, **overlaid correttamente sull'immagine** (bug di posizionamento CSS risolto, §9).
- Morale finale, progress bar, animazione stelle, status bar controller.
- **Cross-device funzionante** (Supabase Realtime via WebSocket puro): dal telefono si sceglie regno → storia → opzioni e la TV segue in tempo reale. Testato su TV Samsung reale (4 luglio 2026).
- Pairing con codice stanza + QR; il QR sparisce dallo schermo TV appena il controller si collega (messaggio `hello`).
- Audio narrante pre-generato (ElevenLabs) per tutte e 3 le storie, con ripiego Web Speech automatico.
- Immagini generate con Gemini per tutte e 3 le storie (5/5 ciascuna, 15 totali), con personaggi coerenti verificati (Sara, Tobia, Bruno); riquadro scena ingrandito a ~46vh (4 luglio 2026).
- Prima storia con protagonista animale (`firefly`, orsetto Bruno) e primo tag di genere "Buonanotte" (3 luglio 2026).
- Controller: navigazione a due livelli regno → storia (come sulla TV); fase 2 con testi reali per ramo, `PHASE2_KEYS` eliminata.
- Sito pubblicato su GitHub Pages con deploy automatico a ogni push su `main`.
- Corretto bug voce robotica dopo il tasto Home (§9) e layout immagine/contenuto su finestre desktop basse (§9), con scroll di sicurezza aggiunto.
- **Schermata storia ridisegnata (4 luglio 2026):** immagine a larghezza piena bloccata sul rapporto nativo (nitida, centrata a letterbox), scelte **sovrapposte** in fondo all'immagine → risolto il bug della terza scelta tagliata su TV; progresso ed etichetta fase spostati in una barra sovrapposta in alto (§9 punto 15).
- **Schermo intero (4 luglio 2026):** pulsante «Schermo intero» attivabile col telecomando per nascondere la barra del browser TV; avviso relativo sul pannello QR e rimozione del link inutile (§9 punto 16).
- **Progressi persistenti (5 luglio 2026):** modulo `progress.js` (localStorage), contatore «X / 9 finali scoperti» sulle card e segni 🌟 sulle scelte già esplorate (restano cliccabili; sulla prima scelta il segno è un contatore di ramo «🌟 n/3»).
- **Tasto «Esci dalla storia» sul controller (5 luglio 2026):** esce da una storia avviata (anche per sbaglio) riportando controller e TV alla mappa in sincrono.
- **Robustezza cross-device (5 luglio 2026):** anti-doppio-tap, risincronizzazione via `state`, riconnessione con watchdog e stato visibile (§4.2 e Fase 2).
- **Test 4G (5 luglio 2026):** confermato che il cross-device funziona col telefono su rete dati, indipendente dalla LAN. Chiave ElevenLabs rigenerata. **Fase 1 (MVP) completata al 100%.**
- **Code review completa + batteria di test (7 luglio 2026):** validazione automatica dati↔asset (18/18 check ok, 0 errori), test in-browser 720p/1080p su mappa/motore storia/medaglie/controller/risincronizzazione, corrette 3 fragilità di compatibilità TV introdotte col sistema medaglie (`gap` flexbox, `backdrop-filter`, mappa senza `onerror` — vedi §9 punti 18-19). Creato `TEST_CHECKLIST.md` con la checklist manuale per il test su TV reale.

---

### ✅ FASE 0 — Messa in sicurezza (COMPLETATA)
- [x] Chiave ElevenLabs rimossa da `tv.html`.
- [x] Chiave ripulita anche dalla cronologia di GitHub.
- [x] Rigenerata la chiave su elevenlabs.io per sicurezza (5 luglio 2026).

### 🟦 FASE 1 — MVP funzionante cross-device
*Obiettivo: telefono e TV su dispositivi diversi, online, per famiglia e amici.*

1. [x] **Account Supabase** → progetto creato → *Project URL* e *publishable key* nella config in testa a `transport.js`.
2. [x] **Trasporto:** `transport.js` con canale Supabase Realtime **via WebSocket puro** (niente `supabase-js`: non gira sulle smart TV), messaggi invariati, BroadcastChannel come ripiego automatico stesso-dispositivo, deduplica per `_mid`.
3. [x] **Codice stanza + QR:** la TV genera il codice, il canale è `storie-<codice>`, il QR include `?room=`, il telefono entra nella stanza giusta; il QR sparisce da solo al collegamento.
4. [x] **Fonte unica dei dati:** `stories.js` con tutte le storie **e i regni** (`REALMS`); `tv.html`, `controller.html` e `generate-audio.mjs` derivano da lì.
5. [x] **Voce:** pre-generati gli audio (1 intro + 3 middle + 9 end per storia) per `oasis`, `bell` e `firefly`, salvati in `audio/`; i file suonano correttamente; Web Speech come ripiego funzionante.
6. [x] **Immagini:** 5/5 per tutte e 3 le storie (`oasis`, `bell`, `firefly`), personaggi coerenti verificati; riquadro scena ingrandito.
7. [x] **Pubblicazione:** ✅ online su GitHub Pages — `https://ninjaraveii.github.io/storie-interattive/` (deploy automatico a ogni push su `main`).
8. [x] **Test reale:** ✅ funziona su TV Samsung reale col telefono, sia in casa (stessa rete) sia col telefono su **rete dati (4G)** — confermata l'indipendenza dalla LAN (5 luglio 2026).

**Definizione di "MVP riuscito":** ✅ **raggiunta** — da un telefono inquadro il QR sulla TV, scelgo regno → storia → opzioni, e la TV mostra scena + immagine + narrazione audio fino al finale con morale.

### 🟩 FASE 2 — Robustezza e qualità
- [x] **Salvataggio persistente dei progressi** (`localStorage`) — *fatto 5 luglio 2026.* Modulo `progress.js` (fonte unica dei progressi, generico: non conosce STORIES/REALMS, ES5 + try/catch per le smart TV). Salva `lastStory`, `completed`, `endings` (finali scoperti per storia). `tv.html` registra il finale allo step `end` e mostra il contatore **"X / N finali scoperti"** (→ "✦ Tutti i finali scoperti" quando sono tutti) sulle card del regno. ⭐ *Era la "fondamenta prioritaria" (doc strategia §6): medaglie, contatore finali, regni sbloccabili e mappa viva dipendono da questo.*
  - ⚠️ **Limite noto (per design attuale):** `localStorage` lega i progressi **al browser di quel singolo dispositivo (la TV)**, non alla persona/famiglia. Non c'è nickname né login; non dipende da IP né dal codice stanza (quello vive in `sessionStorage`). Progressi = "della TV di casa": cambiando dispositivo/browser si riparte da zero. Va bene per lo scenario attuale (una famiglia, una TV), ma vedi lo step evolutivo in Fase 3 ("progressi legati alla persona").
- [x] **Interrompere la storia e tornare ai regni dal controller** *(richiesta e fatta 5 luglio 2026)*: aggiunto il pulsante «← Esci dalla storia» nella schermata scelte del controller; invia `{action:'home'}`, che lato TV ferma la narrazione e torna alla mappa, riportando controller e TV in cima e in sincrono.
- [x] Risincronizzazione *(fatta 5 luglio 2026)*: la TV risponde a `hello` con `{action:'state',…}`; il controller ricostruisce la schermata giusta anche collegandosi a storia già iniziata (§4.2).
- [x] Gestione disconnessioni/riconnessioni *(fatta 5 luglio 2026)*: watchdog sull'heartbeat in `transport.js` (connessioni morte senza `close`), stato `reconnecting` distinto da `error`, feedback su TV (badge) e controller (status bar); alla riconnessione il controller ri-manda `hello` e si risincronizza.
- [ ] Immagini dedicate per ciascuno dei 9 finali.
- [x] Piccoli controlli *(fatti 5 luglio 2026)*: anti-doppio-tap e ordine dei messaggi — `pick(key,si)` sulla TV accetta solo `si === stepIdx` corrente (§4.2).
- [x] UI: immagine interamente visibile (sfumatura ridotta) e morale a schermo più a lungo con tasto "Continua" (§9, punti 11–12 — fatto 3 luglio 2026).
- [x] **Review grafica della mappa** *(richiesta 3 luglio 2026, fatta 6 luglio 2026)*: via i poligoni piatti — ora fondale **dipinto** (Gemini, stile delle storie) che fluttua sul nero senza cornice (richiesta di Alberto su reference: terra sagomata, bordi dissolti nel buio), con 6 marker cliccabili (3 attivi, 3 «Presto…») ed etichette discrete. `buildMap()` riscritta, asset `images/map/world.png`. ⚠️ Resta il test sulla TV Samsung reale.
- [ ] **Revisione design complessiva** con il plugin `frontend-design` *(richiesta 3 luglio 2026)*: passata generale su tipografia, colori, componenti di entrambe le pagine.

### 🟪 FASE 3 — Evoluzioni
> Le funzionalità di prodotto **già decise** (con il loro ordine di sviluppo) sono elencate nel documento di strategia, §5–6: salvataggio progressi → icone sulle scelte → contatore finali scoperti → medaglie argento/oro → regni con nuvole (sblocco graduale) → mappa viva.

- [ ] Nuove storie e sblocco dei regni `mountain` / `sea` / `sky` — obiettivo catalogo dal documento di strategia: 2 storie per regno (12 totali) + un regno "vetrina" a 3, verso il traguardo 3×6 = 18.
- [x] **Sistema medaglie** *(progettato 5 luglio, implementato 6 luglio 2026 — spec in `SISTEMA_MEDAGLIE.md` v2.0)*: **7 livelli a piramide** (prima storia; storia esplorata/completa; regno esplorato/completo; tutti i regni esplorati/completati), **derivati da `progress.js`** (nessun dato nuovo salvato; stati calcolati al volo). Grafica **2.5D** in CSS (no WebGL/rotazione), tre stati **da conquistare / esplorata / completa (accesa)**. Forma **«ritaglio sul corpo»**: la medaglia è la sagoma del personaggio/landmark vero. **✅ Asset** in `images/medals/`: 3 protagonisti (scontornati con `rembg`), 3 landmark dei regni, livello 1 = **Libro delle Storie**; livelli 6/7 riusano `images/map/world.png`. **✅ Galleria in `tv.html`** (`#screen-medals`): bottone «🏅 Medaglie» sulla mappa, `{action:'medals'}` dal controller (bottone «Le mie medaglie», telefono resta telecomando), stato `screen-medals` incluso nella risincronizzazione; medaglie generate dinamicamente da STORIES/REALMS, dimensionamento compatto TV-safe (sta a schermo a 720p). **✅ Festa a fine storia** (`#end-medals`): solo al **primo sblocco** (confronto stati prima/dopo `recordEnding`), medaglie affiancate + **`canvas-confetti`** (coriandoli sempre, **fuochi** sugli sblocchi "accesi"). ⚠️ **`canvas-confetti` caricato `async`** (se fosse bloccante e il CDN lento/irraggiungibile, l'intera app non partirebbe — §13); uso protetto da `typeof confetti`. **⏳ Resta:** test su TV Samsung reale (animazioni CSS + confetti, con ripiego statico); click-to-ingrandire in galleria (rimandato).
- [x] **Contatore finali scoperti** *(decisa — doc strategia §5)*: ✅ fatto 5 luglio 2026 — "X / N finali scoperti" sulle card del regno (`tv.html`), alimentato da `progress.js` (Fase 2).
- [ ] ⭐ **Progressi legati alla persona/famiglia, non al dispositivo** *(step evolutivo importante — richiesta 5 luglio 2026)*: oggi `localStorage` lega i progressi al singolo browser della TV (vedi limite in Fase 2). Per farli "seguire l'utente" tra dispositivi diversi (TV di casa ↔ TV dei nonni) servirebbe un profilo leggero — es. codice/nickname salvato su **Supabase** (già usato per il realtime), da cui la TV recupera i progressi invece che da `localStorage`. Alternativa minima: export/import manuale. Scelta di prodotto da valutare quando l'uso diventa multi-dispositivo.
- [ ] **Icone sulle scelte** *(decisa — doc strategia §5)*: grandi simboli colorati accanto/al posto del testo, per chi non legge ancora.
- [ ] **Regni con sblocco graduale** e **mappa viva** *(decise — doc strategia §5)*.
- [ ] Modalità "solo TV" (scelte con timer, senza telefono).
- [ ] Musica di sottofondo / effetti sonori.
- [ ] PWA installabile (manifest + service worker) — percorso distribuzione: web puro → PWA + casting → store (doc strategia §4).
- [ ] Multilingua (struttura già predisponibile).
- [ ] 9 immagini di finale distinte per storia (oggi condividono `end.jpg`), una volta validato che lo stile a 5 immagini regge bene.
- [x] **Varietà di protagonisti** *(segnalata 1 luglio 2026)*: ✅ prima storia con protagonista animale fatta (`firefly`, orsetto Bruno, 3 luglio 2026). Continuare a variare nelle prossime storie — vedi nota in `GUIDA_STORIE.md` §2.
- [ ] **Voce narrante variabile** *(segnalata 1 luglio 2026)*: valutare voci diverse per regno nei prossimi lotti di audio (oggi tutte le storie usano la stessa voce ElevenLabs) — vedi nota in `GUIDA_STORIE.md` §7.

---

## 11. Visione futura — Modalità "Storia Libera" (generativa)

> Direzione strategica di lungo periodo. **Non** sostituisce le storie statiche: le affianca. Le 3 storie attuali diventano *"Avventure guidate"*; nasce accanto una *"Avventura libera"*.

### Idea

Oltre a scegliere tra bivi predefiniti, il bambino **inventa con le proprie parole** come prosegue la storia, e un modello di AI genera al volo il pezzo successivo, coerente e adatto all'età. L'obiettivo è massima libertà creativa: niente copione fisso.

### Impatto sull'architettura (importante)

Questa modalità **rompe due assunti** del progetto base, in modo consapevole:

- **Serve un piccolo backend.** Il "cervello" AI e una voce di qualità usano chiavi segrete che **non possono stare in un sito statico pubblico**. Serviranno **funzioni serverless** (piccoli pezzi di codice ospitati online) che custodiscono le chiavi e fanno da intermediario tra browser e servizi AI. La struttura telefono ↔ Supabase ↔ TV resta valida: è il "sistema nervoso"; qui si aggiunge il "cervello".
- **Cambia il modello di costo.** Dalle storie statiche (paghi una volta, usi all'infinito) si passa a un piccolo costo *per ogni* frase generata e *per ogni* lettura vocale. Per uso familiare sono cifre contenute, ma vanno monitorate.
- **Niente audio pre-registrati in questa modalità.** Poiché il testo è diverso ogni volta, la voce va generata **dal vivo** (le storie statiche continuano invece a usare audio pre-generati, §6).

### I quattro "mattoncini"

1. **Orecchie** — voce del bambino → testo (riconoscimento vocale). **Input scelto: pulsante "tieni premuto per parlare" (push-to-talk)** — il microfono si attiva solo mentre si tiene premuto. Più affidabile con i bambini, più rispettoso della privacy (niente ascolto continuo), e gestisce meglio rumore e pause. Prevedere sempre un ripiego a **tastiera** e un messaggio gentile in caso di mancata comprensione ("Non ho capito bene, me lo ripeti?").
2. **Cervello** — l'AI che, dato il "detto" del bambino + la storia finora, scrive il pezzo successivo.
3. **Voce** — lettura ad alta voce del testo appena generato (TTS live).
4. **Occhi** *(opzionale)* — immagini generate al volo; lente e con costo per immagine. All'inizio si può rinunciare o usare poche immagini d'atmosfera generiche.

### Le tre sfide critiche con i bambini

1. **Sicurezza dei contenuti (pilastro, non rifinitura).** Il narratore deve restare sempre dolce, adatto all'età, mai spaventoso o inappropriato, e gestire con delicatezza input strani o tristi. Da progettare fin da subito: istruzioni molto rigide al modello + filtri sui contenuti + possibilità per il genitore di intervenire.
2. **Latenza.** Orecchie → cervello → voce in fila possono richiedere diversi secondi: per un bambino il silenzio rompe la magia. Mitigazioni: suono/animazione d'attesa, testo che compare mentre viene letto.
3. **Voce dei bambini.** Difficile da trascrivere (parole inventate, sussurri). Il push-to-talk aiuta; un'alternativa è far parlare il genitore.

### Scala di ambizione (gradini, dal più sicuro al più ambizioso)

- **Gradino 1 — "Finale libero":** storie e bivi restano fissi; alla fine il bambino aggiunge a parole come va a finire e l'AI scrive solo quel pezzo. Rischio minimo.
- **Gradino 2 — "Centro libero in cornice sicura":** inizio fisso (mappa, regni, apertura curata), parte centrale gestita liberamente dall'AI, **input a tastiera**. Riusa tutto l'esistente come "cornice".
- **Gradino 3 — "La voce":** si aggiunge il push-to-talk, il bambino parla davvero.
- **Gradino 4 — "Tutto":** voce in entrata + AI + voce premium in uscita + immagini generate.

> Approccio consigliato: salire la scala un gradino per volta. Il Gradino 2 è il miglior rapporto valore/rischio perché non butta via nulla del lavoro fatto e consegna già il cuore della visione.

---

## 12. Note operative per Claude Code

- **Strategia commerciale e priorità di prodotto:** vedi `storie-interattive-strategia-commercializzazione.md` — contiene le funzionalità decise, il loro ordine di sviluppo e la roadmap verso i primi utenti. In caso di dubbio su *cosa* costruire prima, la risposta è lì; su *come*, è qui.
- **Non usare framework:** vanilla HTML/CSS/JS. Librerie esterne solo via CDN, con parsimonia (oggi solo `qrcodejs`). Per Supabase Realtime **niente libreria**: WebSocket puro in `transport.js` (§3), perché il client ufficiale non gira sulle smart TV.
- **Compatibilità smart TV (vincolo di prima classe):** sintassi ≤ ES6/2017 (niente optional chaining/nullish), fallback CSS prima delle proprietà moderne (`clamp`, `inset`), cache-busting `?v=N` quando cambiano `stories.js`/`transport.js`. Vedi §13, lezioni 8–9.
- **I due file restano separati:** la divisione tv/controller è il cuore del concept.
- **Fonte unica dei dati (obiettivo):** dopo la Fase 1, modificare una storia significa toccare *solo* `stories.js`.
- **Mai chiavi segrete nel codice client:** la publishable key Supabase è ammessa (è pubblica per design); chiavi di TTS o simili vanno usate **solo offline** in fase di produzione.
- **`BroadcastChannel` è solo un ripiego locale:** la comunicazione "vera" passa da Supabase Realtime.
- **Aggiungere una storia (post Fase 1):** aggiungere il blocco in `stories.js`, generare immagini e audio relativi, ed eventualmente assegnare la storia a un regno in `REALMS`.

---

## 13. Lezioni apprese

> Note pratiche emerse lavorando sul progetto, utili per non ripetere gli stessi errori.

1. **Verificare sempre visivamente, non solo via DOM/JS.** Un testo può risultare "corretto" interrogando `textContent` ma essere comunque invisibile a schermo per un problema di layout CSS. Il bug dei sottotitoli (§9) è passato inosservato per diverse sessioni di test proprio perché veniva verificato solo leggendo il valore JS, mai con uno screenshot o un'ispezione delle bounding box.
2. **Evitare dipendenze da servizi esterni per funzionalità centrali quando esiste un'alternativa locale matura.** Il QR usava un'API pubblica di terzi (`api.qrserver.com`) solo per disegnare l'immagine: sostituita con una libreria QR locale via CDN, eliminando un punto di fragilità (rete, ad-blocker, privacy) per un meccanismo — il pairing TV↔telefono — che è centrale al concept.
3. **La coerenza del personaggio nelle immagini AI regge molto meglio nella stessa conversazione.** Generare le 5 immagini di una storia nella stessa chat, richiamando esplicitamente "lo stesso identico personaggio" a ogni prompt successivo, dà risultati nettamente più coerenti che generare ogni immagine da zero.
4. **"Child-friendly" nel prompt non basta per un pubblico di 3-6 anni.** Serve elencare esplicitamente cosa non deve comparire (ombre inquietanti, zanne/artigli minacciosi, armi, pericolo reale), non solo lo stile desiderato — vedi il preambolo aggiornato in `BRIEF_IMMAGINI.md`.
5. **Le chiavi API restano sempre fuori dalla conversazione.** Gestite tramite file locale non tracciato (`.env.local`, in `.gitignore`), mai incollate in chat né nei file del sito — anche quando serve che l'utente le inserisca lui stesso.
6. **Rendere i dati "branch-aware" invece di mantenere mappe di traduzione separate.** `PHASE2_KEYS` traduceva chiavi segnaposto in chiavi reali; eliminata rendendo la fase 2 del controller direttamente branch-aware (un oggetto `variants` per chiave di scelta 1). Una fonte di disallineamento in meno.
7. **Controllare la documentazione di progetto prima di assumere lo scope "giusto".** Prima di generare 9 immagini di finale (una per combinazione), la domanda corretta era "quante ne prevede `GUIDA_STORIE.md`?" — la risposta (5, non 13) era già scritta e motivata nel documento.
8. **I browser delle smart TV richiedono attenzioni speciali (lezione centrale del 4 luglio 2026).** Il primo test sulla TV Samsung reale ha rivelato una catena di problemi che il PC non mostrava mai, risolti uno dopo l'altro: (a) *sintassi*: un solo costrutto moderno (`story?.id`, optional chaining) ha ucciso l'intero script — restare su sintassi ≤ ES6/2017 nei file del sito; (b) *librerie*: `supabase-js` non gira affatto sulla TV — sostituita con un client WebSocket puro del protocollo Phoenix in `transport.js` (ES5); (c) *cache*: la TV tiene i `.js` in cache anche ricaricando la pagina, mescolando versioni vecchie e nuove dei file (`REALMS is not defined`) — da qui il cache-busting `?v=N` sugli script include e nell'URL del QR (aumentare `N` a ogni modifica di `stories.js`/`transport.js`); (d) *CSS moderno*: `clamp()` (2020) e `inset` (2021) venivano ignorati → il riquadro immagine restava ad **altezza zero** (audio ok, immagine invisibile) e le stelle sparivano — servono fallback statici *prima* della proprietà moderna (`height:34vh;height:clamp(...)`, `top/right/bottom/left` prima di `inset`). Strumento che ha reso possibile diagnosticare tutto questo **da remoto**: l'**overlay errori a schermo** (`window.onerror` in ES5, in testa a `tv.html`), dato che sulla TV non esiste console — senza, ogni errore è una schermata muta.
9. **Testare sul dispositivo target reale il prima possibile.** Tutti i problemi del punto 8 erano invisibili nei test su browser desktop moderno (dove tutto funzionava): sono emersi solo aprendo il sito sulla TV Samsung vera. Per un progetto il cui concept *è* "gira sulla TV di casa", il browser della smart TV è l'ambiente di riferimento, non un caso limite — va messo nel giro di test presto, non alla fine.
10. **Ogni scelta del controller che deve riflettersi sulla TV è un messaggio esplicito.** All'inizio il controller mandava solo `start`/`pick`/`restart`: aprire un regno sul telefono non cambiava nulla sulla TV. Ogni azione di navigazione condivisa (aprire un regno, tornare alla mappa) va aggiunta al protocollo (`realm`, `home`) — non basta cambiarla localmente sul telefono.
11. **La risoluzione nativa degli asset è un vincolo di design, non un dettaglio (4 luglio 2026).** Le immagini sono panoramiche 1856×576 (rapporto 3,22:1, alte solo 576px). Prima di "mettere l'immagine a tutto schermo" la domanda giusta è stata il calcolo del fattore di scala con `object-fit:cover`: un box 16:9 pieno su TV 1080p richiede ~1,9× di ingrandimento (sgranatura visibile *proprio sulla TV*) e ritaglia ~45% dell'illustrazione ai lati. Il massimo nitido è un box **bloccato sul rapporto nativo** (scala ≤1×, nessun crop). Morale: verificare cosa la risoluzione *permette* prima di promettere un layout — e un vero fullscreen richiederebbe di rigenerare gli asset più grandi/alti.
12. **Il fullscreen del browser richiede un gesto utente: niente automatismi da rete (4 luglio 2026).** `requestFullscreen()` viene accettato solo se innescato da un'interazione diretta dell'utente. Farlo partire dal messaggio `hello` del controller (che arriva via WebSocket) è stato tentato e **non funziona**: il browser TV lo ignora silenziosamente. L'unica via affidabile sulla TV è un **pulsante premuto col telecomando**. Anche l'aggancio "al primo gesto qualunque sulla pagina" è stato scartato per semplicità: sulla Samsung il pulsante manuale basta. Lezione generale: le API gated da user-activation (fullscreen, autoplay audio, clipboard) non si possono orchestrare da eventi di rete o timer.
13. **Trucco del rapporto (`height:0;padding-top:%`) al posto di `aspect-ratio` sulle smart TV (4 luglio 2026).** Per bloccare un box su un rapporto fisso senza dipendere da viewport-height, `aspect-ratio` (2021) non è affidabile sui browser TV (§13.8). Il vecchio "padding-top hack" (percentuale = altezza/larghezza dell'immagine, `576/1856=31.03%`) funziona ovunque, purché **tutti i figli siano in posizione assoluta** (immagine, barre, scelte) perché l'altezza reale del box è 0.

---

*Documento generato il 30 giugno 2026, ultimo aggiornamento 8 luglio 2026 — versione 3.11.*
