# Storie Interattive — Strategia, roadmap e nuove funzionalità
*Sintesi della sessione di pianificazione — Luglio 2026*

---

## 1. Strade di commercializzazione possibili

1. **Abbonamento (subscription)** — modello dominante nel settore; richiede contenuti nuovi in continuazione
2. **Freemium** — alcune storie gratis, le altre a pagamento; ottimo per farsi provare
3. **Acquisto una tantum** — più semplice da gestire, ma incassi minori nel tempo
4. **Licenza B2B** — scuole, biblioteche, hotel per famiglie, sale d'attesa pediatriche; il formato TV + telefono è un punto di forza per spazi condivisi

### Prezzi di mercato (riferimenti)
- Epic! (~£9,99/mese), Vooks (~£7,99/mese), Homer (~$11,99/mese), app AI di storytelling da ~£9,99/mese
- **Fascia di riferimento: 7–12 € al mese**

### Posizionamento unico del progetto
Esperienza sul **televisore di casa con lo smartphone come telecomando**, in italiano, con narrazione vocale: esperienza familiare condivisa sul divano, non bambino da solo col tablet. Nessun competitor diretto con questo formato.

**Rischi:** mercato italiano piccolo; catalogo attuale (3 storie) insufficiente per qualsiasi monetizzazione.

---

## 2. Vendere/proporre il progetto ad aziende del settore

### Il caso Faba
- Azienda italiana in forte crescita: round da 4,5 M€ (CDP Venture Capital + Oltre Impact + Ad4Ventures/Mediaset), fatturato 2024 di 10 M€, obiettivo 15 M€
- **Paradosso di posizionamento:** il brand Faba si fonda sull'essere alternativa agli schermi → il progetto vive sulla TV. Obiezione da anticipare: il modello "la TV mostra, il telefono controlla, la voce racconta" è più vicino al teatro condiviso che al tablet solitario

### Cosa comprano davvero le aziende
Non idee o prototipi (rifarli internamente costa poco), ma:
- **Trazione** (utenti attivi, abbonati)
- **Contenuti** (catalogo di qualità con diritti chiari)
- **Team**

### Forme realistiche, in ordine di probabilità
1. **Licenza** — l'azienda usa tecnologia/formato pagando fee o royalty
2. **Partnership sui contenuti** — io la piattaforma, loro catalogo e brand
3. **Acquisizione** — realistica solo con utenti che usano e pagano

### Altri interlocutori da considerare
- **Lunii** (Francia) — storie interattive a scelte, il parente concettuale più stretto
- Editori per ragazzi italiani
- Player TV (Mediaset investe già nel settore via Ad4Ventures)

**Regola d'oro:** prima di bussare servono numeri, anche piccoli. 50 famiglie che usano l'app ogni settimana valgono più di mille slide.

---

## 3. Roadmap in 4 tappe verso i primi utenti

### Tappa 1 — Preparare il terreno
- Portare il catalogo a ~10–12 storie (soglia minima perché la gente torni)
- Varietà di generi: avventura, paura leggera, umorismo, buonanotte
- Primo avvio "a prova di nonno": collegamento TV–telefono in meno di 30 secondi

### Tappa 2 — Cerchio ristretto (5–10 famiglie)
- Amici, parenti, colleghi con bambini
- Osservare i fatti, non le opinioni: l'hanno riaperto spontaneamente? Il bambino ha chiesto "ancora"? Dove si sono annoiati?

### Tappa 3 — Misurare
- Aggiungere (con Claude Code) un contatore anonimo: sessioni avviate e storie completate
- Senza questi dati, nessuna conversazione con un'azienda è credibile

### Tappa 4 — Primo cerchio esterno
- Biblioteche comunali (serate di lettura), gruppi Facebook di genitori, maestre della scuola dell'infanzia
- Vantaggio: essendo web (GitHub Pages), basta condividere un link — nessuna installazione

### Obiettivo catalogo concordato
- **Traguardo finale:** 3 storie per regno × 6 regni = 18 storie
- **Via di mezzo per partire:** 2 storie per regno (12 totali) + un regno "vetrina" completo a 3 → feedback prima, correzioni di rotta più economiche
- Definire un **formato standard** per le storie (lunghezza, numero di scelte, struttura) prima di produrne molte, per non rigenerare l'audio ElevenLabs a ogni modifica

---

## 4. Esperienza utente e distribuzione

### Principio: web, non store (per ora)
Il progetto è un sito web, non un'app da store — e in questa fase è un vantaggio.

### Percorso di distribuzione consigliato
**Web puro ora → PWA + casting quando si allarga → store solo se il progetto decolla**

### PWA ("finto scaricamento")
- Il sito propone "Aggiungi a schermata Home": icona come una vera app, apertura a schermo intero, funzionamento parziale offline
- Aggiornamenti istantanei per tutti, zero commissioni Apple/Google
- Limite: su iPhone la procedura è più nascosta (Condividi → Aggiungi alla schermata Home) → mostrare un suggerimento a schermo la prima volta

### Casting ("lancia" lo schermo sulla TV)
- Il genitore apre l'app solo sul telefono, tocca "trasmetti", la mappa appare sulla TV, il telefono diventa telecomando
- Elimina il problema di aprire il sito sulla TV
- Limite: Google Cast copre Chrome/Android; il mondo Apple usa AirPlay (sistema diverso) → coprirli entrambi è lavoro extra

### Onboarding primo utilizzo (friends & family)
1. Aprire il browser della Smart TV (o Chromecast/Fire Stick su TV vecchie) e digitare l'indirizzo — passaggio debole, da eliminare a regime
2. La TV mostra mappa dei regni + **QR code**
3. Il genitore inquadra il QR: telecomando già collegato
4. Dal telefono sceglie regno e storia

Alternativa al QR: **codice stanza a 4 cifre** stile Kahoot.

### Store (solo a regime)
- Store TV (Samsung, LG, Android TV, Fire TV): regole, revisioni e sviluppo separato per ciascuno → solo con utenti veri e/o partner
- Store telefono (Google Play / App Store): visibilità e fiducia, ma commissioni 15–30% sugli abbonamenti

---

## 5. Funzionalità decise

1. **Icone sulle scelte** — grandi simboli colorati al posto del testo: anche chi non legge sceglie da solo
2. **Finali alternativi da scoprire** — contatore nella schermata di selezione storia (es. "3 finali su 9 scoperti"); moltiplica il riascolto senza scrivere storie nuove
3. **Mappa viva** — ogni storia completata cambia qualcosa nella mappa SVG (lucina nel castello, barca nel porto): salvadanaio visivo dei progressi
4. **Limite storie impostato dal genitore** — il genitore sceglie quante storie massime appaiono, "a monte": il bambino non vive un divieto, vive il mondo com'è. Impostazione in area genitori protetta da gesto semplice (es. pressione lunga 3 secondi)
5. **Regni che si sbloccano gradualmente** — regni non sbloccati coperti da nuvole sulla mappa SVG. Partire con 2–3 regni aperti per non frustrare; definire il criterio di sblocco (N storie completate o medaglia del regno precedente)
6. **Medaglie a due livelli** — argento al completamento delle 3 storie di un regno, oro alla scoperta di tutti i finali del regno

### Idee tenute in riserva (dopo il feedback delle prime famiglie)
- Nome del bambino nella storia (a schermo)
- Voto tra fratelli (due telefoni, scelta a maggioranza) — richiede canale via internet
- Modalità buonanotte (colori scuri, spegnimento dolce a fine storia)
- Diario delle scelte per i genitori (spunto di conversazione, nessun competitor ce l'ha)

---

## 6. Note tecniche per Claude Code

### Fondamenta prioritaria
**Salvataggio persistente dei progressi sul telefono** — medaglie, finali scoperti, regni sbloccati, mappa viva e limite storie dipendono tutti da questo. Da costruire per primo.

### Verifica architetturale critica → ✅ già risolta in `CLAUDE.md`
La questione BroadcastChannel (solo stesso dispositivo) vs. canale via internet è **già stata verificata e decisa**: la soluzione scelta è **Supabase Realtime** con codice stanza, documentata in `CLAUDE.md` §4 e in cima alla roadmap tecnica (Fase 1). Questo documento non duplica i dettagli: per l'architettura fa fede `CLAUDE.md`.

### Altre voci tecniche in lista
- Contatore anonimo di utilizzo (sessioni avviate, storie completate)
- QR code / codice stanza per il pairing
- Riconnessione automatica al secondo utilizzo
- PWA (manifest + suggerimento iOS)
- Casting: Google Cast + eventualmente AirPlay

### Ordine di sviluppo suggerito
1. Salvataggio progressi persistente
2. Icone sulle scelte
3. Contatore finali scoperti
4. Medaglie (argento/oro)
5. Regni con nuvole (sblocco graduale)
6. Mappa viva (ultima: la più "artistica", arricchibile per sempre)
