# Batteria di test — Storie Interattive

> Checklist ripetibile per validare l'app dopo ogni modifica importante.
> Legenda esito: ✅ ok · ⚠️ ok con riserva · ❌ problema (annota cosa).
> Ultima revisione automatica (code review + test): **6 luglio 2026**, commit di partenza `5237b5a`.

---

## A. Test automatici (già eseguiti da Claude Code — rieseguibili)

### A1. Validazione dati ↔ asset (`node`)
Script: `scratchpad/validate.mjs` (o rigenerabile). Verifica in un colpo solo:
- struttura step (intro/middle/end) di ogni storia;
- scelte-1 allineate ai `variants`;
- 9 finali per storia, tutti raggiungibili (prodotto cartesiano c1×c2), con `text` e `moral`;
- `ctrl.intro` e `ctrl.middle[k]` presenti;
- immagini (`intro`, `middle_<c1>`, `end`) e audio (1+3+9) presenti per ogni storia;
- asset medaglie (`first_story`, `<storia>`, `realm_<regno>`, `world.png`);
- nessuna chiave scelta duplicata.

**Esito ultimo run:** ✅ 18/18 check, 0 warning, 0 errori.

### A2. Test in-browser (server statico locale, 720p + 1080p)
- [x] `tv.html` carica senza errori JS (nessun overlay rosso, console pulita).
- [x] Mappa: 6 marker, 3 attivi; immagine mappa caricata; **nessuno scroll** a 720p e 1080p.
- [x] Supabase Realtime si collega davvero (badge "Stanza XXXX" verde, non solo ripiego locale).
- [x] Regno → card storia con contatore "🌟 0 / 9 finali scoperti".
- [x] Motore storia: `startStory` → scena; `pick` avanza; END registra il finale in `progress.js`.
- [x] Medaglie — festa: 1° finale sblocca `first:complete` + `story:*:explored` + `realm:*:explored`.
- [x] Medaglie — completamento: 9/9 finali → `story:*:complete` + `realm:*:complete`.
- [x] Medaglie — re-trovare un finale già visto ⇒ **nessuna festa** (0 sblocchi).
- [x] Galleria: 8 medaglie, 3 stati visivamente distinti; **nessuno scroll** a 720p/1080p.
- [x] Schermata fine: messaggio + medaglie affiancate + `canvas-confetti` caricato.
- [x] `controller.html` carica senza errori; 3 regni; `phaseData` OK su tutte le storie e tutti i rami.
- [x] Risincronizzazione controller (`applyState`): storia/finale/medaglie/regno/mappa + `storyId` inesistente gestito senza crash.

---

## B. Test manuali su TV Samsung reale + telefono (DA FARE)

> Questi coprono ciò che il browser desktop non può dimostrare: browser della smart TV, animazioni, confetti, e il vero cross-device telefono↔TV. È l'ultimo grande "aperto" del progetto.

### B0. Preparazione
- [ ] Bump `?v=N` se hai toccato `stories.js`/`transport.js`/`progress.js` (in `tv.html`, `controller.html` e `showQR`). Poi hard-reload sulla TV.
- [ ] Apri `tv.html` sulla TV. **Nessun overlay rosso di errore** in basso? (se compare, annota il testo: è la diagnosi).
- [ ] Premi col telecomando «⛶ Schermo intero»: la barra del browser sparisce.

### B1. Mappa e navigazione (TV da sola)
- [ ] La mappa dipinta si vede intera, **senza scroll** e senza barre.
- [ ] I 6 regni sono al posto giusto sull'illustrazione; i 3 attivi hanno il puntino dorato pulsante, i 3 «Presto…» spenti.
- [ ] Le etichette dei regni sono leggibili (anche sopra nuvole/montagne).
- [ ] Bottone «🏅 Medaglie» in alto a sinistra visibile solo qui.

### B2. Pairing telefono ↔ TV
- [ ] Inquadra il QR col telefono → si apre il controller nella stanza giusta (status "Stanza XXXX collegata ✓").
- [ ] Il **pannello QR sparisce da solo** sulla TV appena il telefono si collega.
- [ ] Prova col telefono su **rete dati (4G/5G)**, non solo WiFi di casa: deve funzionare uguale.

### B3. Giocare una storia dal telefono
- [ ] Dal telefono: scegli un regno → la TV apre lo stesso regno.
- [ ] Scegli una storia → la TV parte con l'immagine di scena e la **voce narrante** (audio pre-generato).
- [ ] I sottotitoli scorrono in sincrono con la voce.
- [ ] Fai la 1ª scelta dal telefono → la TV avanza; poi la 2ª scelta → finale con **morale**.
- [ ] La **terza scelta** è sempre interamente visibile sull'immagine (non tagliata in basso).
- [ ] Anti-doppio-tap: tap rapidi ripetuti non fanno saltare scene.

### B4. Medaglie (il pezzo NUOVO — mai testato su TV reale)
- [ ] Alla **prima** conquista di un finale: la schermata di fine mostra le medaglie appena sbloccate **affiancate** + **coriandoli** (`canvas-confetti`).
- [ ] Se lo sblocco include una medaglia "accesa/completa": partono anche i **fuochi d'artificio**.
- [ ] Se il CDN dei coriandoli è lento/irraggiungibile: le medaglie compaiono **comunque** (solo senza coriandoli) — l'app **non** si blocca.
- [ ] Dal telefono «🏅 Le mie medaglie» → la **galleria appare sulla TV** (il telefono resta telecomando e mostra "Medaglie sulla TV 📺").
- [ ] La galleria sta **tutta a schermo senza scroll**; i tre stati (accesa / esplorata / da conquistare 🔒) sono distinguibili.
- [ ] Le animazioni (bob, glow, scintille) sono fluide o almeno non impuntano l'app. *Se scattano/rallentano molto: candidato a ripiego statico su TV.*
- [ ] **Spaziatura medaglie**: le medaglie hanno spazio tra loro e non si sovrappongono. *(Il flex `gap` è stato sostituito da `margin` universali il 6 lug 2026, così vale su qualsiasi TV — questo è solo un controllo di conferma sul dispositivo reale.)*

### B5. Robustezza / riconnessione
- [ ] Metti in pausa il WiFi del telefono qualche secondo e riattiva: status "Riconnessione…" poi torna "collegata ✓" e il controller si **risincronizza** sulla schermata giusta.
- [ ] Collega un secondo telefono a storia già iniziata: deve saltare subito alla schermata corrente (non ripartire dalla mappa).
- [ ] «← Esci dalla storia» sul telefono → TV torna alla mappa e la voce si ferma.
- [ ] Ricarica la pagina TV a metà storia: il codice stanza resta lo stesso (il QR è ancora valido).

### B6. Progressi persistenti
- [ ] Dopo aver scoperto qualche finale, torna al regno: le card mostrano "🌟 X / 9 finali scoperti" aggiornato.
- [ ] Le scelte già esplorate mostrano il segno 🌟 (restano cliccabili).
- [ ] Riapri la TV il giorno dopo (stesso browser): i progressi ci sono ancora.
- [ ] Nota limite noto: i progressi sono legati **al browser di quella TV**, non alla persona.

---

## C. Come rieseguire i test automatici
1. Server statico: dalla cartella del progetto, un qualsiasi server statico (es. `npx serve -l 5173 .` — già in `.claude/launch.json`).
2. Validazione dati: `node scratchpad/validate.mjs .` (rigenerabile; controlla dati↔asset).
3. Browser: apri `http://localhost:5173/tv.html`, DevTools console, e usa la mappa/regni/medaglie.
   Per pilotare senza telefono: da console `Progress.reset()`, poi `startStory('firefly')`, `pick('owl',0)`, ecc.
   Reset progressi: `Progress.reset()`.
