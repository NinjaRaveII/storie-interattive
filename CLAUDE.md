# Storie Interattive — Documento di Progetto

> **Scopo di questo documento:** fornire a Claude Code (e a chiunque lavori al progetto) il contesto completo e *aggiornato*, allineato al codice reale, con le decisioni prese, le motivazioni e una roadmap passo-passo verso un MVP funzionante.
>
> *Versione 3.0 — 1 luglio 2026. Aggiornata dopo la sostituzione delle 3 storie dummy con 2 storie complete (audio + parte delle immagini generate), la correzione di due bug UI reali (sottotitoli invisibili, QR rotto) e l'aggiunta di una sezione "Lezioni apprese" (§13).*

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
| Immagini scena | **File locali** in `images/<storia>/...`, generate con Gemini (via browser) e convertite in `.jpg` | ✅ in corso: 5/5 per `oasis`, 1/5 per `bell` |
| Sintesi vocale | **Audio pre-generati (file) + Web Speech API come ripiego** | ✅ **FATTO** per `oasis` e `bell` (26 mp3 via ElevenLabs, script `generate-audio.mjs`, vedi §6) |
| Comunicazione cross-device | **Supabase Realtime (canale broadcast)** | **NON ANCORA FATTO**: sostituisce BroadcastChannel per l'uso multi-dispositivo |
| Comunicazione stesso-dispositivo | `BroadcastChannel('storie-interattive')` (opzionale, come ripiego locale) | è ancora l'**unico** trasporto attivo oggi |
| Pairing TV↔telefono | **Codice stanza** veicolato via **QR code** | il QR ora punta correttamente a `controller.html` (bug URL risolto, §13), ma non instaura ancora un collegamento cross-device reale |
| Hosting | **Static hosting con HTTPS** (GitHub Pages / Netlify / Cloudflare Pages) | **NON ANCORA FATTO**: necessario per l'uso online |

---

## 3. File del progetto (stato reale del codice)

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
- Si usa da **JavaScript vanilla** (client via CDN), coerente col "no framework".
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
| Avvio storia | `{action:'start', id:'oasis'}` | controller | tv |
| Scelta opzione | `{action:'pick', key:'dune', si:0}` | controller | tv |
| Restart | `{action:'restart'}` | controller | tv |

`si` = step index (0 = intro, 1 = middle).

> 💡 **Da aggiungere in fase 2:** un messaggio di **risincronizzazione** (`{action:'state', ...}`) inviato dalla TV quando un telefono si collega a storia già iniziata, così il controller mostra la fase corretta.

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

Ogni storia: **3 opzioni per fase → 9 finali distinti**.

> Le 3 storie precedenti (`forest`, `sea`, `mountain`) erano contenuti dimostrativi ("dummy") e sono state **rimosse** insieme ai loro regni attivi (ora bloccati, §7). `oasis` e `bell` sono le prime due storie scritte seguendo `GUIDA_STORIE.md`, pensate anche per validare l'intera pipeline (testo → audio → immagini) prima di scriverne altre.

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

## 6. Voce narrante (✅ implementata per `oasis` e `bell`)

**Strategia: audio pre-generati come file statici** (come le immagini), con **Web Speech API** come ripiego automatico.

Motivazioni:
- I testi sono **fissi** → si generano gli audio **una volta** e si riusano, con qualità costante.
- **Nessuna chiave segreta online** → nessun rischio di sicurezza, nessun server intermedio da costruire.
- **Funziona su tutti i dispositivi** (anche mobile, dove la voce automatica del browser è inaffidabile).
- Costo **una tantum**, non a ogni lettura.

Struttura cartella `audio/` (**attiva**, 26 file già generati):
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
| La Grande Foresta | 🌲 | bloccato ("Presto…") — storia dummy rimossa |
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

### Ancora aperti
6. **🟠 Comunicazione cross-device assente.** `BroadcastChannel` non collega dispositivi diversi: l'uso previsto oggi **non funziona**. Da sostituire con Supabase Realtime (§4). Nessun progresso su questo punto in questa sessione.
7. **🟡 Dati duplicati tra `tv.html` e `controller.html`.** Da unificare in `stories.js` (fonte unica) — obiettivo Fase 1, non ancora iniziato.
8. **🟡 QR scollegato dal concept di pairing.** Il QR ora punta all'URL corretto (punto 4), ma non instaura ancora un collegamento cross-device reale: serve Supabase + codice stanza (§4.1).
9. **🟡 Immagini incomplete.** `oasis` ha tutte e 5 le immagini; `bell` ne ha solo 1/5 (`intro.jpg`). Da completare nella stessa conversazione Gemini per coerenza del personaggio Tobia (vedi §13).

---

## 10. ROADMAP passo-passo

### ✅ Già fatto
- Struttura a due file (tv + controller).
- 2 storie complete (intro → middle ramificato → 9 finali): `oasis`, `bell`. Le 3 storie dummy precedenti sono state rimosse.
- Mappa del mondo SVG con regni (2 attivi — deserto e Terre di Mezzo — + 4 bloccati).
- Sottotitoli sincronizzati con la narrazione, **overlaid correttamente sull'immagine** (bug di posizionamento CSS risolto, §9).
- Morale finale, progress bar, animazione stelle, status bar controller.
- Pannello QR funzionante (URL corretto, libreria locale — ancora da collegare al pairing cross-device reale).
- Audio narrante pre-generato (ElevenLabs) per entrambe le storie, con ripiego Web Speech automatico.
- Immagini generate con Gemini per `oasis` (5/5) e parzialmente per `bell` (1/5).
- Controller: fase 2 con testi reali per ramo, `PHASE2_KEYS` eliminata.

---

### ✅ FASE 0 — Messa in sicurezza (COMPLETATA)
- [x] Chiave ElevenLabs rimossa da `tv.html`.
- [x] Chiave ripulita anche dalla cronologia di GitHub.
- [ ] *(consigliato, se non già fatto)* Rigenerare la chiave su elevenlabs.io per sicurezza, nel caso il repo sia stato pubblico prima della pulizia.

### 🟦 FASE 1 — MVP funzionante cross-device
*Obiettivo: telefono e TV su dispositivi diversi, online, per famiglia e amici.*

1. [ ] **Account Supabase** → creare progetto → annotare *Project URL* e *publishable key*.
2. [ ] **Sostituire il trasporto:** rimpiazzare `BroadcastChannel` con un canale Supabase Realtime, mantenendo invariati i messaggi `start`/`pick`/`restart`. (Opzionale: tenere BroadcastChannel come ripiego se TV e telefono sono sullo stesso dispositivo.)
3. [ ] **Codice stanza + QR:** la TV genera un codice; il canale diventa `storie-<codice>`; il QR include il codice; il telefono entra nella stanza giusta.
4. [ ] **Fonte unica dei dati:** creare `stories.js` con tutte le storie; `tv.html` e `controller.html` lo importano. Eliminare la copia ridotta (`PHASE2_KEYS` già eliminata).
5. [x] **Voce:** pre-generati gli audio (1 intro + 3 middle + 9 end per storia) per `oasis` e `bell`, salvati in `audio/`; i file suonano correttamente; Web Speech come ripiego funzionante.
6. [~] **Immagini:** 5/5 per `oasis`, 1/5 per `bell` (mancano `middle_tower`, `middle_florist`, `middle_feathers`, `end` — da generare nella stessa conversazione Gemini di `intro.jpg` per coerenza del personaggio Tobia).
7. [ ] **Pubblicazione:** caricare il sito su hosting statico con HTTPS (GitHub Pages / Netlify / Cloudflare Pages).
8. [ ] **Test reale:** provare con un telefono e un PC *diversi*, su reti diverse.

**Definizione di "MVP riuscito":** da un telefono qualsiasi inquadro il QR sulla TV, scelgo una storia e le opzioni, e la TV mostra scena + immagine + narrazione audio fino al finale con morale.

### 🟩 FASE 2 — Robustezza e qualità
- [ ] Risincronizzazione: la TV invia lo stato corrente quando un telefono si collega a metà.
- [ ] Gestione disconnessioni/riconnessioni e messaggi di stato connessione.
- [ ] `localStorage`: ricordare l'ultima storia / eventuali progressi.
- [ ] Immagini dedicate per ciascuno dei 9 finali.
- [ ] Piccoli controlli: evitare doppi tap, gestire ordine dei messaggi.

### 🟪 FASE 3 — Evoluzioni
- [ ] Nuove storie e sblocco dei regni `forest` / `mountain` / `sky` (i primi due avevano storie dummy ora rimosse, da riscrivere da zero seguendo `GUIDA_STORIE.md`).
- [ ] Modalità "solo TV" (scelte con timer, senza telefono).
- [ ] Musica di sottofondo / effetti sonori.
- [ ] PWA installabile (manifest + service worker).
- [ ] Multilingua (struttura già predisponibile).
- [ ] 9 immagini di finale distinte per storia (oggi condividono `end.jpg`), una volta validato che lo stile a 5 immagini regge bene.
- [ ] **Badge di completamento storie** *(idea da dettagliare meglio — segnalata 1 luglio 2026)*: un sistema di badge assegnati man mano che si completano storie diverse (più storie completate → più badge). Ipotesi da esplorare: i badge potrebbero anche "sbloccare" nuovi regni sulla mappa, invece che (o oltre a) semplicemente aggiungere `storyIds`. Da definire: dove si salva il progresso (probabilmente `localStorage`, coerente col punto Fase 2 sulla persistenza), come si presentano i badge in UI, se sono per bambino/dispositivo o condivisi.

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

- **Non usare framework:** vanilla HTML/CSS/JS. Librerie esterne solo via CDN, con parsimonia (es. client Supabase).
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

---

*Documento generato il 30 giugno 2026, ultimo aggiornamento 1 luglio 2026 — versione 3.0.*
