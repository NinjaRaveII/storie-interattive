# Guida alla scrittura delle Storie e alla creazione delle Immagini

> **Scopo:** guidare Claude Code (e Alberto) a creare **nuove storie statiche** coerenti con il progetto *Storie Interattive*, e i relativi **asset** (immagini ed eventuali audio).
> Va usata **insieme** a `CLAUDE.md`, che contiene l'architettura e lo stato del progetto.
>
> *Versione 1.0 — 30 giugno 2026.*

---

## 0. Come usare questa guida (per Alberto)

Per far scrivere una nuova storia, dai a Claude Code **entrambi** i file (`CLAUDE.md` + questa guida) e una richiesta tipo:

> "Usando `CLAUDE.md` e `GUIDA_STORIE.md`, crea una nuova storia per il regno *Le Terre Dimenticate* (deserto) a tema *un'oasi che sparisce*. Rispetta struttura, tono e vincoli. Poi generami i brief per le 5 immagini."

In fondo (§9) trovi un **prompt pronto** da copiare.

---

## 1. Anatomia di una storia (struttura a 3 fasi)

Ogni storia è un piccolo albero a **3 livelli**:

```
INTRO  ──►  3 scelte (choice1)
                │
        ┌───────┼───────┐
     ramo A   ramo B   ramo C        ← MIDDLE: una variante per ogni choice1
        │        │        │
     3 scelte 3 scelte 3 scelte (choice2)
        │        │        │
      3 fin.   3 fin.   3 fin.        ← END: 9 finali = choice1 × choice2
```

In numeri, per ogni storia:
- **1** testo di intro + 3 opzioni;
- **3** testi di middle (uno per ramo) + 3 opzioni ciascuno;
- **9** finali, ognuno con **testo + morale**.

Le chiavi dei finali si chiamano `<choice1>_<choice2>` (es. `deep_msg`).

---

## 2. Regole narrative (vincoli da rispettare sempre)

- **Lingua:** italiano.
- **Pubblico:** bambini (~4–9 anni) e famiglia. **Sempre family-friendly.**
- **Tono:** *dark fantasy / libro illustrato*, ma **gentile e rassicurante**. Atmosfera magica e un pizzico di mistero sì; paura vera, violenza, crudeltà, morte, tristezza senza riscatto **no**.
- **Nessuna scelta "punitiva":** le 3 opzioni di ogni bivio devono essere tutte sensate e positive. Non esistono scelte "sbagliate" che portano a finali brutti: ogni percorso porta a un finale bello, con una sua morale.
- **Lunghezze indicative** (adatte alla lettura ad alta voce):
  - intro: ~4–6 frasi;
  - middle: ~3–5 frasi;
  - finale: ~3–4 frasi;
  - morale: 1 frase breve.
- **Frasi "leggibili dalla voce":** preferire frasi non troppo lunghe, con punteggiatura chiara (`. ! ?`). Il narratore divide il testo proprio sui punti, quindi una buona punteggiatura = buona lettura.
- **Coerenza interna:** stesso nome del protagonista in tutta la storia; il middle deve seguire logicamente la scelta 1; ogni finale deve "ripagare" **entrambe** le scelte fatte (choice1 + choice2).
- **Morale:** positiva e concreta (gentilezza, coraggio, curiosità, amicizia, famiglia…), **mai predicatoria o moralista**.
- **Varietà di protagonisti** *(nota per le prossime storie, segnalata 1 luglio 2026)*: `oasis` e `bell` hanno entrambe un bambino/a come protagonista. Per le prossime storie, variare includendo anche **protagonisti animali** (es. un orsetto), per dare più varietà al mondo delle storie.

---

## 3. Convenzioni tecniche (id e chiavi)

| Campo | Regola | Esempio |
|---|---|---|
| `id` storia | minuscolo, senza spazi, univoco | `desert_oasi` |
| `icon` | una emoji | `🌵` |
| `tag` | etichetta breve di genere | `Avventura · bambini` |
| chiavi `choice1` | minuscole, corte, "parlanti", uniche nel livello | `deep`, `wait`, `run` |
| chiavi `choice2` | come sopra, uniche **dentro il ramo** | `msg`, `who`, `listen` |
| chiavi `ends` | `<choice1>_<choice2>` | `deep_msg` |
| `keyword` | parola chiave in inglese, guida l'immagine | `autumn forest sunset` |

> `keyword` è un residuo storico (un tempo serviva per Unsplash). Oggi le immagini sono file locali, ma la `keyword` resta utile come spunto per **generare** l'immagine.

---

## 4. Template da compilare

Schema completo da copiare in `STORIES[]` di `tv.html` (vedi §5 di `CLAUDE.md`):

```js
{
  id: 'NUOVO_ID', tag: 'GENERE', icon: '🙂',
  title: 'TITOLO DELLA STORIA',
  desc: 'Una frase di presentazione per la card.',
  steps: [
    { type:'intro', label:"L'inizio",
      text:'TESTO INTRO (4–6 frasi).',
      keyword:'parole chiave inglesi per immagine',
      choices:[
        { text:'Testo opzione 1', key:'k1a' },
        { text:'Testo opzione 2', key:'k1b' },
        { text:'Testo opzione 3', key:'k1c' }
      ]
    },
    { type:'middle', label:'Il cuore della storia',
      variants:{
        k1a:{ text:'TESTO ramo A.', keyword:'…',
          choices:[ {text:'…',key:'k2a'},{text:'…',key:'k2b'},{text:'…',key:'k2c'} ] },
        k1b:{ text:'TESTO ramo B.', keyword:'…',
          choices:[ {text:'…',key:'k2d'},{text:'…',key:'k2e'},{text:'…',key:'k2f'} ] },
        k1c:{ text:'TESTO ramo C.', keyword:'…',
          choices:[ {text:'…',key:'k2g'},{text:'…',key:'k2h'},{text:'…',key:'k2i'} ] }
      }
    },
    { type:'end', label:'Il finale',
      ends:{
        'k1a_k2a':{ text:'…', moral:'…', keyword:'…' },
        'k1a_k2b':{ text:'…', moral:'…', keyword:'…' },
        'k1a_k2c':{ text:'…', moral:'…', keyword:'…' },
        'k1b_k2d':{ text:'…', moral:'…', keyword:'…' },
        'k1b_k2e':{ text:'…', moral:'…', keyword:'…' },
        'k1b_k2f':{ text:'…', moral:'…', keyword:'…' },
        'k1c_k2g':{ text:'…', moral:'…', keyword:'…' },
        'k1c_k2h':{ text:'…', moral:'…', keyword:'…' },
        'k1c_k2i':{ text:'…', moral:'…', keyword:'…' }
      }
    }
  ]
}
```

### Mini-esempio di tono (un solo ramo, per dare il "la")

> **Intro:** «Nel villaggio di sabbia dorata viveva Sara, che ogni mattina riempiva la brocca all'oasi. Ma quel giorno l'acqua non c'era più: solo un piccolo pesce d'argento che la guardava con occhi tristi. "Aiutami a ritrovare la sorgente," sussurrò il pesce, "e l'oasi tornerà a vivere." Sara non ci pensò due volte e si mise lo zaino in spalla.»
> **Opzione 1 (`dune`):** «Seguire le dune verso il tramonto.»
> **Finale `dune_canto`:** «Cantando la ninnananna che le aveva insegnato la nonna, Sara fece sgorgare di nuovo la sorgente. L'oasi rifiorì e il pesce d'argento divenne il suo amico per sempre.»
> **Morale:** «Le cose più antiche che impariamo a casa sono spesso le più magiche.»

---

## 5. Checklist: aggiungere UNA storia completa

> **Stato attuale (architettura a 2 file).** Finché non è fatta la *Fase 1* di `CLAUDE.md` (file unico `stories.js`), i dati vanno aggiornati in **più punti**. Procedere così:

1. [ ] **`tv.html` → `STORIES[]`**: incolla il blocco completo (template §4) con tutti i testi, i 9 finali e le morali.
2. [ ] **`controller.html` → `STORIES[]`** (versione ridotta): aggiungi `id, icon, title, tag` e le due `phases` con `preview` (anteprima) e `choices`.
   - Fase 1: usa **le stesse chiavi reali** di `tv.html` (`k1a/k1b/k1c`).
   - Fase 2: nel controller le chiavi sono segnaposto e vengono tradotte da `PHASE2_KEYS`.
3. [ ] **`controller.html` → `PHASE2_KEYS`**: aggiungi la mappa della nuova storia:
   ```js
   NUOVO_ID:{ k1a:['k2a','k2b','k2c'], k1b:['k2d','k2e','k2f'], k1c:['k2g','k2h','k2i'] }
   ```
   L'**ordine** dell'array deve corrispondere all'ordine in cui le opzioni di fase 2 compaiono nel controller.
4. [ ] **`tv.html` → `REALMS[]`**: se la storia appartiene a un regno, aggiungi il suo `id` in `storyIds` del regno giusto (così appare sulla mappa).
5. [ ] **Immagini**: crea i 5 file in `images/NUOVO_ID/` (vedi §6).
6. [ ] **Audio** (se si usano audio statici, §6 di `CLAUDE.md`): crea i file in `audio/NUOVO_ID/`.
7. [ ] **Verifica** con la checklist qualità (§8).

> ⚠️ **Attenzione (limite noto del controller).** Oggi nel controller i testi delle opzioni di **fase 2** non cambiano per ramo (mostrano etichette generiche). Per rendere il telefono davvero leggibile, **scrivi nel controller i testi reali delle opzioni** invece di "Prima/Seconda/Terza opzione". La soluzione pulita e definitiva è unificare i dati in `stories.js` (Fase 1): dopo, i passi 2 e 3 spariscono e basta modificare **un solo file**.

---

## 6. Brief per le immagini

Servono **5 immagini per storia**:

| File | Scena |
|---|---|
| `images/<id>/intro.jpg` | scena d'apertura |
| `images/<id>/middle_<k1a>.jpg` | ramo A |
| `images/<id>/middle_<k1b>.jpg` | ramo B |
| `images/<id>/middle_<k1c>.jpg` | ramo C |
| `images/<id>/end.jpg` | scena conclusiva **generica/trionfale** |

> L'immagine di fine è **condivisa dai 9 finali**: deve essere una scena conclusiva "neutra e positiva" della storia, non legata a un finale specifico. *(In futuro, fase 3 di `CLAUDE.md`, si potranno fare 9 immagini di finale.)*

### Formato

- **Orientamento:** panoramico largo. La banda immagine è larga e bassa (≈ 3:1). Consigliato **1600×500** (o 1920×600). Evitare verticali: verrebbero tagliate.
- **Soggetto centrato**, con margini di sicurezza ai bordi (il riquadro ritaglia ai lati su schermi stretti).
- **Niente testo** dentro l'immagine.
- Formato **.jpg**, ottimizzato (peso contenuto per caricamento veloce).

### Stile coerente (da anteporre a ogni prompt)

Usa sempre questo "preambolo di stile" (in inglese: i generatori rispondono meglio), così tutte le immagini del progetto restano coerenti col tema dark-fantasy/libro illustrato:

```
STYLE: dreamy dark-fantasy storybook illustration, warm muted palette,
soft golden light, gentle and child-friendly, painterly, cozy and magical,
soft depth of field, no text, wide cinematic 16:5 composition.
```

### ⚠️ Coerenza tra le immagini (FONDAMENTALE — non saltare)

Questo è il problema **numero uno** quando si generano illustrazioni a sequenza: i generatori di immagini tendono a "**allucinare**", cioè a cambiare il protagonista da un'immagine all'altra **senza motivo** — il coniglio della prima scena diventa un orsetto o un cagnolino, oppure cambia colore, vestiti o età. Anche una sola immagine incoerente **distrugge l'esperienza**, perché il bambino non riconosce più il personaggio. Va prevenuto attivamente, con metodo.

**Regole per tenere il personaggio identico in tutte e 5 le immagini:**

1. **Scrivi una "scheda personaggio" una volta sola**, e incollala **identica, parola per parola, all'inizio di ogni prompt**. Dev'essere molto **specifica**: specie, colori esatti, segni distintivi, vestiti.
   - ❌ Vago (pericoloso): *"a cute animal"*, *"a little hero"*.
   - ✅ Preciso (sicuro): *"a small WHITE RABBIT with long floppy ears, big blue eyes, wearing a red scarf and a tiny green backpack"*.
2. **Crea prima un'immagine "ritratto" di riferimento** del solo protagonista (posa neutra, sfondo semplice). Se questa è giusta, diventa la **base** per tutte le altre.
3. **Usa la funzione di "immagine di riferimento"** del generatore (a seconda dello strumento: *reference image*, *character reference*, *image-to-image*, *consistent character*): genera le altre 4 scene **partendo dal ritratto** del punto 2, non da zero. È il metodo più efficace in assoluto.
4. **Genera le 5 immagini nella stessa sessione/di seguito**, non a giorni di distanza: alcuni strumenti mantengono meglio la coerenza così (ed eventualmente fissa lo *seed*, se disponibile).
5. **Metti i tratti chiave all'inizio del prompt** (i modelli "pesano" di più le prime parole) e **ripeti i colori** ("white rabbit … white fur").
6. **Mantieni un solo protagonista per scena** quando puoi: aggiungere altri personaggi aumenta il rischio che il generatore "confonda" i tratti.

**Passo di verifica obbligatorio (fai sempre questo prima di chiudere una storia):**

> Apri le **5 immagini affiancate** e confrontale con la scheda personaggio. Chiediti, una per una: *è la stessa identica creatura? Stessa specie, stessi colori, stessi vestiti?* Se anche **una sola** non corrisponde, **rigenerala** (riusando il ritratto di riferimento) finché non combacia. Non accontentarti di "quasi uguale".

> 💡 Se uno strumento continua a non tenere la coerenza, la strategia più robusta è: **un buon ritratto di riferimento + image-to-image per tutte le scene**. Meglio cinque immagini un po' meno spettacolari ma **coerenti**, che cinque bellissime ma con un protagonista che cambia.

### Come costruire il prompt di ogni immagine

`[STYLE]` + `[descrizione personaggio]` + `[scena ricavata dal testo, 1–2 frasi]`.

**Esempio (intro del bosco):**
```
[STYLE] a small girl with a red cloak walking into an ancient autumn forest
at sunset, glowing whispers of light floating between the trees, golden leaves,
sense of gentle wonder.
```

---

## 7. (Opzionale) Brief per gli audio statici

Se si adottano gli audio pre-generati (§6 di `CLAUDE.md`):

- File: `audio/<id>/intro.mp3`, `audio/<id>/middle_<k1>.mp3`, `audio/<id>/end_<k1>_<k2>.mp3` (9 finali).
- **Voce:** italiana, calda, ritmo **lento** e cadenzato, adatto ai bambini.
- **Generazione solo in produzione** (sul computer), **mai** con chiavi dentro il sito pubblico.
- Rigenerare l'audio di un segmento ogni volta che se ne cambia il testo.
- **Voce narrante variabile** *(nota per il futuro, segnalata 1 luglio 2026)*: oggi `oasis` e `bell` usano la stessa voce ElevenLabs ("Serena"). Da valutare per i prossimi lotti di audio: usare voci diverse per regno (es. una voce per il deserto, una per le Terre di Mezzo), se non troppo complesso da gestire nello script `generate-audio.mjs`.

---

## 8. Checklist qualità (prima di considerare "finita" una storia)

- [ ] Tutti i **9 finali** esistono e hanno testo **+ morale**.
- [ ] Ogni finale è coerente con **entrambe** le scelte (choice1 + choice2).
- [ ] Il middle di ogni ramo segue logicamente la scelta 1.
- [ ] Nome del protagonista **coerente** ovunque.
- [ ] Nessun contenuto spaventoso/violento/triste-senza-riscatto.
- [ ] Nessuna scelta "punitiva": ogni percorso porta a un bel finale.
- [ ] Frasi adatte alla lettura ad alta voce (lunghezza, punteggiatura).
- [ ] Chiavi `choice` corrette e uniche; `ends` nominati `<choice1>_<choice2>`.
- [ ] `tv.html`, `controller.html` e `PHASE2_KEYS` **allineati** (finché non c'è `stories.js`).
- [ ] 5 immagini presenti, larghe ~3:1, stesso stile.
- [ ] **Coerenza personaggio verificata**: aperte le 5 immagini affiancate, il protagonista è la **stessa identica** creatura (specie, colori, vestiti) in tutte. Nessuna rigenerata? → ricontrolla.

---

## 9. Prompt pronto da dare a Claude Code

> "Hai a disposizione `CLAUDE.md` e `GUIDA_STORIE.md`. Crea una **nuova storia** per il regno **[NOME REGNO]** a tema **[TEMA]**, protagonista **[NOME/ETÀ]**.
> Rispetta: struttura a 3 fasi (3×3 → 9 finali), tono dark-fantasy gentile per bambini, nessuna scelta punitiva, ogni finale con morale positiva.
> Produci: (1) il blocco completo per `STORIES[]` di `tv.html`; (2) la versione ridotta per `controller.html` **con i testi reali** delle opzioni di fase 2; (3) la riga di `PHASE2_KEYS`; (4) l'eventuale aggiunta in `REALMS[].storyIds`; (5) i **brief delle 5 immagini** (con preambolo di stile e descrizione del personaggio coerente).
> Alla fine, esegui la checklist qualità del §8 e segnala cosa manca."

---

*Documento generato il 30 giugno 2026 — versione 1.1 (aggiunta sezione sulla coerenza del personaggio tra le immagini).*
