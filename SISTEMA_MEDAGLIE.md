# Sistema Medaglie — Storie Interattive

> Documento di specifica per l'implementazione del sistema di medaglie (gamification).
> Scritto per Claude Code. Contiene tutte le decisioni prese e le motivazioni.
> **Versione 2.0 — 5 luglio 2026.** Allineata allo stato reale del progetto (vedi `CLAUDE.md` v3.4). Novità rispetto alla v1.0:
> (1) **niente dato nuovo da salvare**: le medaglie si derivano tutte da `progress.js`, che già esiste e già memorizza *quali* finali sono stati scoperti; (2) **niente 3D/three.js**: si va su un **2.5D** simulato in CSS/SVG (estrusione + luce, nessuna rotazione), per compatibilità smart TV; (3) **niente oro/argento**: la distinzione diventa **«spenta ➜ accesa»** (tre stati: da conquistare / esplorata / completa); (4) trasporto e realtime già pronti (Supabase Realtime via WebSocket puro): il messaggio «mostra medaglie» viaggia sul canale esistente.

---

## 1. Obiettivo

Aggiungere un sistema di **medaglie** che premia i bambini man mano che scoprono le storie e i loro finali. Serve a dare piccoli traguardi motivanti e a invogliare a esplorare tutti i contenuti dell'app.

Ogni storia ha **9 finali diversi**. Le medaglie si sbloccano in base a quanti finali vengono visti, a livello di singola storia, di regno, e dell'intera app.

> Questo sistema **sostituisce** la vecchia idea generica di "medaglie argento/oro per regno" della roadmap (`CLAUDE.md` Fase 3): la ingloba e la supera.

---

## 2. Dove vivono i dati (memoria) — **usa `progress.js`, non creare nuove strutture**

⚠️ **Correzione rispetto alla v1.0.** Il progetto ha già il modulo **`progress.js`** (dal 5 luglio 2026, vedi `CLAUDE.md` §3) che salva i progressi in `localStorage` (chiave `storie-progress-v1`) sul dispositivo TV. Non va inventata una struttura dati nuova: **le medaglie si derivano da quella esistente**.

- I progressi restano **sul televisore/PC** (`tv.html`), in `localStorage`, legati al dispositivo (progresso "di famiglia"). ✅ già così.
- `progress.js` salva già, per ogni storia, **quali** finali sono stati scoperti (campo `endings`) — non solo il conteggio. Questo serve già oggi ai segni 🌟 sulle scelte e al contatore di ramo «🌟 n/3». **Il numero di finali per storia si ottiene da lì**, non serve salvarlo a parte.
- API già disponibili in `progress.js`: `recordEnding(storyId, endKey)`, `endingsCount`, `branchEndingsCount(storyId, c1)`, `hasEnding`, `isCompleted`, `getLastStory`, `setLastStory`, `reset`.
- **Nessuna medaglia va salvata**: si ricalcolano sempre dai finali scoperti (single source of truth, coerente col resto del progetto). Se al momento dello sblocco serve sapere "quali medaglie sono nuove rispetto a prima", si confronta lo stato prima/dopo `recordEnding`.

> **Estensione minima ammessa:** se durante l'implementazione servono aggregazioni comode (es. "finali distinti in un regno"), aggiungerle come *helper derivati* dentro `progress.js`, senza aggiungere campi salvati. `progress.js` resta generico: non deve conoscere `STORIES`/`REALMS` (quelli li conosce `tv.html`, che fa da orchestratore).

---

## 3. Struttura delle storie e dei regni

Ogni **regno** contiene una o più **storie** (definiti in `stories.js`: `STORIES` + `REALMS`). Il sistema deve essere **dinamico**: il numero di medaglie NON va scritto a mano, ma calcolato in base a quante storie/regni esistono. Aggiungendo una storia o un regno, le medaglie relative compaiono da sole.

> **Stato reale oggi:** 3 storie attive (`oasis`, `bell`, `firefly`), una per ciascuno dei 3 regni attivi (Le Terre Dimenticate, Le Terre di Mezzo, La Grande Foresta); altri 3 regni bloccati. Il conteggio delle medaglie si adegua automaticamente man mano che il catalogo cresce (obiettivo strategia: verso 2 storie per regno).

---

## 4. La piramide delle medaglie (7 livelli)

I livelli sono a piramide: ogni livello superiore "contiene" quelli inferiori. Ogni medaglia superiore verifica solo se le condizioni inferiori sono soddisfatte.

| # | Nome | Condizione di sblocco | Quante medaglie | Stato visivo |
|---|------|----------------------|-----------------|--------------|
| 1 | **Prima storia in assoluto** | Il primissimo finale visto, di qualsiasi storia | 1 (totale) | accesa |
| 2 | **Storia esplorata** | Almeno 1 finale (1/9) di UNA specifica storia | 1 per storia | esplorata (spenta) |
| 3 | **Storia completa** | Tutti i 9 finali (9/9) di UNA specifica storia | 1 per storia | **completa (accesa)** |
| 4 | **Regno esplorato** | Almeno 1 finale in OGNI storia di quel regno | 1 per regno | esplorata (spenta) |
| 5 | **Regno completo** | Tutti i 9 finali in TUTTE le storie di quel regno | 1 per regno | **completa (accesa)** |
| 6 | **Tutti i regni esplorati** | Condizione del livello 4 in OGNI regno | 1 (totale) | esplorata (spenta) |
| 7 | **Completamento assoluto** | Condizione del livello 5 in OGNI regno | 1 (totale) | **completa (accesa)** |

**Nota sui livelli 2/3 e 4/5:** stessa sagoma (personaggio o regno), cambia solo lo **stato**: esplorata (spenta) → completa (accesa). Questo dimezza il lavoro sugli asset.

### Calcolo del totale (esempio 6 regni × 2 storie = 12 storie)
Livello 1: `1` · Livello 2: `12` · Livello 3: `12` · Livello 4: `6` · Livello 5: `6` · Livello 6: `1` · Livello 7: `1` → **Totale: 39** (cambia da solo con il catalogo).

---

## 5. Grafica delle medaglie — **2.5D, non 3D**

⚠️ **Correzione centrale rispetto alla v1.0.** Niente `three.js`, niente WebGL, niente rotazione piena. Il browser delle smart TV ha già "ucciso" librerie e CSS moderni (vedi `CLAUDE.md` §13, lezioni 8–9): WebGL è un rischio troppo alto e non necessario. Si usa un **2.5D simulato** in **CSS + SVG**, che gira ovunque.

### Aspetto generale
- **Personaggio VERO, non una sagoma stilizzata** *(decisione 5 luglio 2026)*: la medaglia mostra **l'illustrazione reale** del protagonista (o del regno), la stessa che appare nella storia — non un profilo disegnato che "lo ricorda". Deve leggersi "quella è la medaglia di Tobia" a colpo d'occhio.
- **Forma della medaglia — RITAGLIO SUL CORPO** *(scelta 5 luglio 2026)*: la medaglia ha il **contorno del personaggio** (niente cornice tonda), per la massima resa "è proprio lui". *Richiede un asset nuovo*: un ritratto del personaggio su **sfondo trasparente** (PNG), da cui il 2.5D estrae automaticamente forma, spessore e alone (via `drop-shadow` sul canale alpha). L'alternativa "cameo" (illustrazione reale dentro una cornice tonda, riusando le immagini esistenti) è stata **scartata**.
- **Effetto 2.5D** (illusione di spessore, senza 3D reale), identico per entrambe le forme:
  - **Estrusione**: copie/ombre dell'immagine sfalsate verso il basso-destra in tono scuro → simulano lo spessore del bordo (una serie di `box-shadow`/`drop-shadow` opachi).
  - **Luce**: highlight speculare in alto a sinistra + ombreggiatura interna → volume.
  - **Bordo** dorato sottile.
- **Movimento leggero, NON rotazione**: un dondolio impercettibile (`translateY` + `rotate` ±1–2°) per dare vita, senza far girare la medaglia. Compatibile TV e non distrae.
- **Ripiego statico**: se una TV non regge le animazioni CSS (`filter`, `drop-shadow`, `mix-blend-mode`), la medaglia resta comunque visibile e leggibile — l'animazione è un di più, mai un requisito.

### I tre stati (sostituiscono oro/argento)
Per un pubblico di 3–6 anni "oro vale più di argento" è una convenzione culturale, non una percezione. I bambini percepiscono **luce, colore e festa**. Quindi:

| Stato | Quando | Come appare |
|-------|--------|-------------|
| **Da conquistare** | non ancora sbloccata | silhouette **grigia/scura**, opaca, con lucchetto 🔒 → si vede cosa manca |
| **Esplorata** (spenta) | livelli 2, 4, 6 | medaglia coi **colori veri** del personaggio/regno (es. Bruno marrone, Tobia col mantello turchese). Volume 2.5D, nessun effetto magico |
| **Completa** (accesa) | livelli 3, 5, 7, e la 1 | la **stessa** medaglia che **si accende**: alone dorato pulsante, bordo luminoso, **scintille ✦ orbitanti**, riflesso che scorre (shimmer) |

**Perché così:**
1. **Riusa l'asset identico** (stessa sagoma, stessi colori): cambia solo lo strato di effetti → mantiene il dimezzamento del lavoro.
2. **Coerente col linguaggio già in app**: i finali scoperti sono già segnati con 🌟. "Medaglia con le stelline intorno = ho scoperto tutto" chiude il cerchio visivo senza codici nuovi.
3. **Regge nel ripiego 2D/piatto**: un glow + stelline si leggono bene anche senza WebGL, mentre argento-vs-oro metallici in piatto si distinguono pochissimo.

Nella galleria la gerarchia è leggibile a colpo d'occhio senza leggere: **grigia** = da conquistare · **colorata** = esplorata · **colorata e brillante** = completa.

### Aspetto per livello (asset: ✅ tutti pronti in `images/medals/`, 6 luglio 2026)

| Livello | Soggetto raffigurato | Stato | Asset |
|---------|---------------------|-------|-------|
| 2 — Storia esplorata | Il **protagonista** vero (ritaglio) | esplorata (spenta) | `oasis.png` / `bell.png` / `firefly.png` |
| 3 — Storia completa | Il **protagonista** vero (ritaglio) | completa (accesa) | idem (cambia solo lo stato) |
| 4 — Regno esplorato | Il **landmark** del regno | esplorata (spenta) | `realm_forest.png` (quercia con lucciole) / `realm_kingdom.png` (castello dorato) / `realm_desert.png` (oasi) |
| 5 — Regno completo | Il **landmark** del regno | completa (accesa) | idem |
| 1 — Prima storia | **Il Libro delle Storie** aperto con stella dorata che si alza (scelto 6 luglio 2026: rappresenta la prima storia e l'app stessa, neutro sui regni, coerente col linguaggio 🌟) | sempre accesa | `first_story.png` |
| 6 — Tutti i regni esplorati | **mappa del mondo** intera | esplorata (spenta) | riusa `images/map/world.png` (la mappa dipinta della home) |
| 7 — Completamento assoluto | **mappa del mondo tutta illuminata** (gancio con la futura "mappa viva") | completa (accesa) | idem + trattamento "accesa" |

---

## 6. Asset grafici da preparare

Scelta la forma **ritaglio sul corpo** (§5), per ogni **personaggio** e per ogni **regno** serve un **ritratto su sfondo trasparente** (PNG con alpha), nella stessa resa grafica della storia. Da lì il 2.5D ricava forma, spessore (estrusione via `drop-shadow` sull'alpha) e bordo — nessun tracciato SVG da disegnare a mano.

**✅ TUTTI GLI ASSET SONO PRONTI (6 luglio 2026)** in `images/medals/`. Metodo usato (ricetta in `BRIEF_IMMAGINI.md`):
- **Protagonisti** (Sara/Tobia/Bruno): **scontornati dalle scene esistenti** con `rembg` (identici a quelli delle storie, non rigenerati).
- **Landmark dei regni**: ritagliarli dalla mappa dipinta dava risultati troppo piccoli (~110px) o impossibili (la foresta non ha un soggetto unico isolabile) → **generati con Gemini nella stessa chat della mappa** (stile identico, alta risoluzione, fondo bianco) e poi scontornati con `rembg`.
- **Livello 1** (Libro delle Storie): generato come i landmark.
- **Livelli 6/7**: nessun asset nuovo — si riusa la mappa dipinta `images/map/world.png` (che ha già i bordi sfumati a trasparente).

> Per i livelli 1, 6, 7 (medaglie globali) gli asset dipendono dalle decisioni in §9.

---

## 7. Comportamento dell'animazione

### Quando appare
- Alla **fine della storia**, nell'**ultima pagina, DOPO la morale** (coordinare col timer di permanenza della morale e col tasto "Continua ➜" già esistenti in `tv.html`).
- **SOLO la prima volta** che una medaglia viene sbloccata. Rigiocare un finale già visto → **nessuna animazione**.

### Medaglie multiple insieme
- Un singolo finale può sbloccare **più medaglie** (es. l'ultimo finale di una storia che è anche l'ultima storia mancante di un regno → "storia completa" + "regno completo").
- Vanno mostrate **affiancate orizzontalmente**, tutte visibili insieme (non in sequenza).

### Effetto festa
- **Coriandoli** (stile app Robinhood) a ogni sblocco, con **`canvas-confetti`** (leggera, una riga). Partono **solo** su sblocco nuovo. Effetto di sfondo, non coprono le medaglie.
- In più, per gli sblocchi di una medaglia **«accesa»** (completa): un **burst tipo fuochi d'artificio** oltre ai coriandoli, per marcare il traguardo maggiore.
- ⚠️ **Da testare sulla TV Samsung reale** prima di darlo per scontato: `canvas-confetti` (canvas 2D, probabilmente ok) e le animazioni CSS (`filter`, `drop-shadow`, `mix-blend-mode`). Prevedere sempre il ripiego statico (§5).

---

## 8. Interfaccia utente (bottoni e galleria)

### Sulla TV (`tv.html`)
- Nella **schermata dei regni**, un **bottone** apre la **galleria delle medaglie**.
- La galleria elenca tutte le medaglie:
  - **Vinte**: colorate e **cliccabili** → si vedono ingrandite (con il loro alone/animazione).
  - **Non vinte**: in stato "da conquistare" (silhouette grigia + 🔒), così il bambino vede cosa gli manca.
- Aggiungere lo stato **"galleria"** alla **risincronizzazione** via `{action:'state',…}` (vedi `CLAUDE.md` §4.2), così un telefono che si collega/riconnette con la galleria aperta ricostruisce la schermata giusta.

### Sul telefono (`controller.html`)
- Nella **schermata dei regni**, un **bottone "Guarda le mie medaglie"**.
- **Comportamento**: il telefono **NON** mostra le medaglie; invia un messaggio alla TV e la galleria appare **sulla TV**. Il telefono resta un telecomando.
- **Nota tecnica (aggiornata):** il trasporto cross-device è già pronto — **Supabase Realtime via WebSocket puro** in `transport.js` (non più "in roadmap": è fatto e testato, `CLAUDE.md` §4). Aggiungere al protocollo un messaggio, es. `{action:'medals'}` (apre la galleria) e `{action:'home'}`/`{action:'realm'}` già esistono per uscirne. Ricordare il cache-busting `?v=N` quando si toccano `stories.js`/`transport.js`.

---

## 9. Decisioni ancora aperte

1. ~~**Grafica dei livelli 1, 6, 7**~~ → **decisa (6 luglio 2026)**: L1 = **Libro delle Storie** aperto con stella dorata che si alza (`first_story.png`, sempre accesa); L6 = mappa del mondo (esplorata); L7 = mappa del mondo illuminata (accesa, gancio con "mappa viva"). L6/L7 riusano `images/map/world.png`.
2. Testo/etichetta sotto ogni medaglia nella galleria (nome del traguardo? nome della storia?).
3. Eventuale **suono** allo sblocco (valutare; coerente con l'audio già presente).
4. ~~Colore base delle medaglie "esplorate"~~ → **decisa nei fatti**: illustrazione a colori pieni (il personaggio/landmark vero, non monocromo).

---

## 10. Riepilogo delle decisioni chiave

- Progressi → **già** su `progress.js` (`localStorage`, TV, di famiglia). **Nessun nuovo dato**: le medaglie si **derivano** dai finali scoperti già salvati.
- **7 livelli** a piramide, numero **dinamico** da `stories.js` (`STORIES`/`REALMS`).
- Medaglie in **2.5D** (CSS: estrusione + luce, **niente three.js/WebGL, niente rotazione**), con dentro il **personaggio VERO** (illustrazione reale, non una sagoma stilizzata).
- **Forma scelta: ritaglio sul corpo** (medaglia a forma del personaggio). Richiede un **ritratto su sfondo trasparente** per ogni personaggio e regno (brief in `BRIEF_IMMAGINI.md`). Vedi §5/§6.
- **Niente oro/argento**: tre stati → **da conquistare (grigia)** / **esplorata (personaggio a colori)** / **completa (accesa: glow + scintille + shimmer)**. Coerente coi 🌟 già usati sulle scelte.
- Animazione a **fine storia dopo la morale**, **solo al primo sblocco**, medaglie multiple **affiancate**, con **coriandoli** (`canvas-confetti`) + **fuochi** per gli sblocchi "accesi". Ripiego statico sempre previsto. **Da testare sulla TV reale.**
- **Galleria** sulla TV (cliccabili ingrandite, le bloccate in grigio + 🔒); stato "galleria" incluso nella risincronizzazione.
- Bottone **"Guarda le mie medaglie"** sul telefono → apre la galleria **sulla TV** via `{action:'medals'}` sul canale realtime esistente.

---

*Documento aggiornato il 5 luglio 2026 — versione 2.0. Mockup di riferimento del 2.5D: 3 stati di Tobia (da conquistare / esplorata / completa).*
