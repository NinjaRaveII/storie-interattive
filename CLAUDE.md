# Storie Interattive — Documento di Progetto

> **Scopo di questo documento:** fornire a Claude Code (e a chiunque lavori al progetto) il contesto completo e *aggiornato*, allineato al codice reale, con le decisioni prese, le motivazioni e una roadmap passo-passo verso un MVP funzionante.
>
> *Versione 2.0 — 30 giugno 2026. Questa versione corregge diversi disallineamenti della v1.0 rispetto al codice effettivo.*

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
| Immagini scena | **File locali** in `images/<storia>/...` | **CORREZIONE**: la v1.0 indicava Unsplash; il codice usa file locali |
| Sintesi vocale | **Audio pre-generati (file) + Web Speech API come ripiego** | **CAMBIO DI ROTTA**: vedi §6. Il codice attuale tenta ElevenLabs live (con un bug, vedi §9) |
| Comunicazione cross-device | **Supabase Realtime (canale broadcast)** | **NUOVO**: sostituisce BroadcastChannel per l'uso multi-dispositivo |
| Comunicazione stesso-dispositivo | `BroadcastChannel('storie-interattive')` (opzionale, come ripiego locale) | declassato a fallback |
| Pairing TV↔telefono | **Codice stanza** veicolato via **QR code** | il QR esiste già nel codice ma oggi non collega davvero i dispositivi |
| Hosting | **Static hosting con HTTPS** (GitHub Pages / Netlify / Cloudflare Pages) | **NUOVO**: necessario per l'uso online |

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
- `speak(text, cb)` — narrazione (oggi: tentativo ElevenLabs + ripiego Web Speech; **da convertire** ad audio pre-generati, §6).
- `loadImg(path)` + `imgPath(storyId, type, variant)` — caricano **immagini locali**.
- `showQR()` — genera il QR verso `controller.html`.
- Listener di comunicazione → riceve `start` / `pick` / `restart`.

### `controller.html` — Telefono (controller)

**Schermate (UI):**
1. `#ctrl-list` — istruzioni + lista storie.
2. `#ctrl-choices` — scelte della fase corrente.
3. `#ctrl-end` — fine storia + tasto restart.
+ Status bar in basso con feedback d'invio.

**Logica principale:**
- `STORIES[]` — **copia ridotta** (solo `id, icon, title, tag, phases`).
- `PHASE2_KEYS` — mappa che traduce le chiavi-segnaposto della fase 2 (`x1,x2,x3`…) nelle chiavi reali della storia, in base alla scelta 1.
- `selectStory(id)` → invia `{action:'start', id}`.
- `pickChoice(key)` → invia `{action:'pick', key, si:phase}`.
- `doRestart()` → invia `{action:'restart'}`.

> 🔧 **Debito tecnico noto:** i dati delle storie sono duplicati tra `tv.html` e `controller.html`, e tenuti allineati a mano tramite `PHASE2_KEYS`. È fragile. Vedi §8 (fonte unica dei dati).

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
| Avvio storia | `{action:'start', id:'forest'}` | controller | tv |
| Scelta opzione | `{action:'pick', key:'deep', si:0}` | controller | tv |
| Restart | `{action:'restart'}` | controller | tv |

`si` = step index (0 = intro, 1 = middle).

> 💡 **Da aggiungere in fase 2:** un messaggio di **risincronizzazione** (`{action:'state', ...}`) inviato dalla TV quando un telefono si collega a storia già iniziata, così il controller mostra la fase corretta.

---

## 5. Struttura dati delle storie

Ogni storia in `tv.html` segue questo schema:

```js
{
  id: 'forest',          // identificatore univoco
  tag: 'Avventura',      // etichetta genere
  icon: '🌲',
  title: 'Il Bosco dei Sussurri',
  desc: 'Descrizione breve per la card.',
  steps: [
    // STEP 0 — INTRO
    {
      type: 'intro',
      label: "L'inizio",
      text: '…testo narrativo…',
      keyword: 'autumn forest sunset',   // residuo storico (era per Unsplash); oggi le immagini sono locali
      choices: [
        { text: 'Testo opzione A', key: 'deep' },
        { text: 'Testo opzione B', key: 'wait' },
        { text: 'Testo opzione C', key: 'run' }
      ]
    },
    // STEP 1 — MIDDLE (ramificato per choice1)
    {
      type: 'middle',
      label: 'Il cuore della storia',
      variants: {
        deep: { text: '…', keyword: '…', choices: [ … ] },
        wait: { text: '…', keyword: '…', choices: [ … ] },
        run:  { text: '…', keyword: '…', choices: [ … ] }
      }
    },
    // STEP 2 — END (ramificato per choice1 + choice2)
    {
      type: 'end',
      label: 'Il finale',
      ends: {
        'deep_msg': { text: '…', moral: '…', keyword: '…' },
        // … 9 combinazioni totali (3 × 3)
      }
    }
  ]
}
```

**Nomenclatura chiavi `ends`:** `<key_choice1>_<key_choice2>` (es. `deep_msg`, `wait_help`).

### Storie e ramificazioni reali

| ID | Titolo | Tag | Scelta 1 (chiavi) |
|---|---|---|---|
| `forest` | Il Bosco dei Sussurri | Avventura | `deep` / `wait` / `run` |
| `sea` | La Nave dei Mille Anni | Mistero | `board` / `look` / `call` |
| `mountain` | Luna e il Cristallo della Montagna | Fantasy · bambini | `flowers` / `bear` / `star` |

Ogni storia: **3 opzioni per fase → 9 finali distinti**.

### Immagini attese (file locali)

Struttura cartella `images/`:
```
images/<storia>/intro.jpg
images/<storia>/middle_<chiaveScelta1>.jpg   (es. middle_deep.jpg)
images/<storia>/end.jpg
```
Conteggio per storia: **1 intro + 3 middle + 1 end = 5 immagini**.

> ⚠️ **Limite noto:** tutti i **9 finali** condividono **un'unica** `end.jpg`. Migliorabile in futuro con un'immagine per finale (vedi roadmap fase 3).

---

## 6. Voce narrante (decisione v2.0)

**Strategia scelta: audio pre-generati come file statici** (come le immagini), con **Web Speech API** solo come ripiego.

Motivazioni:
- I testi sono **fissi** → si generano gli audio **una volta** e si riusano, con qualità costante.
- **Nessuna chiave segreta online** → nessun rischio di sicurezza, nessun server intermedio da costruire.
- **Funziona su tutti i dispositivi** (anche mobile, dove la voce automatica del browser è inaffidabile).
- Costo **una tantum**, non a ogni lettura.

Struttura cartella `audio/` (proposta, speculare alle immagini):
```
audio/<storia>/intro.mp3
audio/<storia>/middle_<chiaveScelta1>.mp3
audio/<storia>/end_<chiaveScelta1>_<chiaveScelta2>.mp3   (9 finali)
```

> Gli audio possono essere generati con un qualsiasi TTS di qualità (incluso ElevenLabs) **in fase di produzione, sul tuo computer** — non a runtime nel browser. Così la chiave segreta non finisce mai nel sito pubblico.

---

## 7. Mappa del mondo e regni (`REALMS`)

La home (`#screen-list`) è una **mappa SVG** con 6 regni cliccabili. Ogni regno ha forma poligonale, colore, icona, descrizione e una lista `storyIds`.

| Regno | Icona | Stato |
|---|---|---|
| La Grande Foresta | 🌲 | attivo (`forest`) |
| Le Cime Tempestose | 🏔️ | attivo (`mountain`) |
| L'Oceano Profondo | 🌊 | attivo (`sea`) |
| Le Terre Dimenticate | 🌵 | bloccato ("Presto…") |
| Le Terre di Mezzo | 🏰 | bloccato ("Presto…") |
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

## 9. Problemi noti da correggere (priorità alta)

1. **✅ SICUREZZA — chiave ElevenLabs (RISOLTO).** La API key è stata **rimossa dal codice** e **ripulita anche dalla cronologia di GitHub**. Con la strategia audio pre-generati (§6), nel sito non serve più alcuna chiave. *Promemoria di buona pratica:* se il repository è mai stato pubblico prima della pulizia, la vecchia chiave va comunque considerata "potenzialmente vista da altri" — quindi, se non già fatto, **rigenerarla su elevenlabs.io** (riscrivere la cronologia non annulla eventuali copie fatte da terzi mentre era online).
2. **🟠 BUG voce.** Il controllo `hasKey` confronta la chiave con se stessa, quindi è sempre `false`: ElevenLabs non si attiva **mai** e si usa sempre la voce del browser. (Verrà superato dalla strategia audio file.)
3. **🟠 Comunicazione cross-device assente.** `BroadcastChannel` non collega dispositivi diversi: l'uso previsto oggi **non funziona**. Da sostituire con Supabase Realtime (§4).
4. **🟡 Dati duplicati.** Storie in due file + `PHASE2_KEYS`. Da unificare in `stories.js` (fonte unica), eliminando `PHASE2_KEYS` (il controller deriva le scelte di fase 2 direttamente dai dati, in base alla scelta 1).
5. **🟡 QR scollegato dal concept.** Oggi il QR rimanda al controller ma non instaura alcun collegamento reale. Con Supabase + codice stanza, il QR diventa il meccanismo di pairing.

---

## 10. ROADMAP passo-passo

### ✅ Già fatto
- Struttura a due file (tv + controller).
- 3 storie complete (intro → middle ramificato → 9 finali).
- Mappa del mondo SVG con regni (3 attivi + 3 bloccati).
- Sottotitoli sincronizzati con la narrazione.
- Morale finale, progress bar, animazione stelle, status bar controller.
- Pannello QR (da ricollegare al pairing).

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
4. [ ] **Fonte unica dei dati:** creare `stories.js` con tutte le storie; `tv.html` e `controller.html` lo importano. Eliminare la copia ridotta e `PHASE2_KEYS`.
5. [ ] **Voce:** pre-generare gli audio (1 intro + 3 middle + 9 end per storia) e salvarli in `audio/`; far suonare i file; Web Speech come ripiego.
6. [ ] **Immagini:** preparare le 5 immagini locali per ciascuna delle 3 storie.
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
- [ ] Nuove storie e sblocco dei regni `desert` / `kingdom` / `sky`.
- [ ] Modalità "solo TV" (scelte con timer, senza telefono).
- [ ] Musica di sottofondo / effetti sonori.
- [ ] PWA installabile (manifest + service worker).
- [ ] Multilingua (struttura già predisponibile).
- [ ] Immagini generate via AI (offline, in produzione) per coerenza visiva.

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

*Documento generato il 30 giugno 2026 — versione 2.2 (aggiunta §11 Visione futura "Storia Libera" con input push-to-talk).*
