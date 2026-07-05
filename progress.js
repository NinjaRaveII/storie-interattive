/* ============================================================
   PROGRESS.JS — SALVATAGGIO PERSISTENTE DEI PROGRESSI (localStorage)
   Fondamenta condivisa (CLAUDE.md §10, Fase 2): da qui dipenderanno
   contatore finali scoperti, medaglie argento/oro, regni sbloccabili
   e "mappa viva". Tenuto GENERICO: non conosce STORIES/REALMS, lavora
   solo con id di storia e chiavi di finale (es. 'dune_dig').

   Dati salvati sotto un'unica chiave localStorage:
     {
       lastStory: 'oasis' | null,
       completed: { oasis:true, ... },              // storie completate almeno una volta
       endings:   { oasis:{ dune_dig:true, ... } }  // finali scoperti per storia
     }

   ES5 puro e tutto in try/catch: i browser delle smart TV possono avere
   localStorage assente o in sola lettura (modalità privata) → in quel caso
   si degrada a memoria volatile senza mai lanciare errori (§13.8).
   ============================================================ */
var Progress = (function(){
  var KEY = 'storie-progress-v1';

  function blank(){ return { lastStory:null, completed:{}, endings:{} }; }

  function load(){
    try{
      var raw = localStorage.getItem(KEY);
      if(!raw) return blank();
      var p = JSON.parse(raw);
      /* normalizza: dati vecchi/corrotti non devono rompere i consumatori */
      if(!p || typeof p !== 'object') return blank();
      if(!p.completed || typeof p.completed !== 'object') p.completed = {};
      if(!p.endings || typeof p.endings !== 'object') p.endings = {};
      if(typeof p.lastStory === 'undefined') p.lastStory = null;
      return p;
    }catch(e){ return blank(); }
  }

  var data = load();

  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify(data)); }catch(e){}
  }

  /* Registra il finale raggiunto: segna il finale come scoperto, la storia
     come completata e la imposta come ultima giocata. endKey = 'c1_c2'. */
  function recordEnding(storyId, endKey){
    if(!storyId) return;
    if(!data.endings[storyId]) data.endings[storyId] = {};
    if(endKey) data.endings[storyId][endKey] = true;
    data.completed[storyId] = true;
    data.lastStory = storyId;
    save();
  }

  /* Numero di finali distinti scoperti per una storia. */
  function endingsCount(storyId){
    var e = data.endings[storyId];
    if(!e) return 0;
    var n = 0, k;
    for(k in e){ if(e.hasOwnProperty(k)) n++; }
    return n;
  }

  /* true se una specifica combinazione di finale è già stata scoperta. */
  function hasEnding(storyId, endKey){
    return !!(data.endings[storyId] && data.endings[storyId][endKey]);
  }

  /* Quanti finali scoperti appartengono a un ramo di prima scelta (c1):
     conta le chiavi 'c1_*'. Serve al segno "🌟 n/tot" sulla prima scelta. */
  function branchEndingsCount(storyId, c1){
    var e = data.endings[storyId];
    if(!e || !c1) return 0;
    var prefix = c1 + '_', n = 0, k;
    for(k in e){ if(e.hasOwnProperty(k) && k.indexOf(prefix) === 0) n++; }
    return n;
  }

  function isCompleted(storyId){ return !!data.completed[storyId]; }

  function getLastStory(){ return data.lastStory; }

  function setLastStory(storyId){ data.lastStory = storyId || null; save(); }

  /* Azzera tutto (utile in fase di test). */
  function reset(){ data = blank(); save(); }

  return {
    recordEnding: recordEnding,
    endingsCount: endingsCount,
    hasEnding: hasEnding,
    branchEndingsCount: branchEndingsCount,
    isCompleted: isCompleted,
    getLastStory: getLastStory,
    setLastStory: setLastStory,
    reset: reset
  };
})();
