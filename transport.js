/* ============================================================
   TRANSPORT.JS — comunicazione TV ↔ controller (vedi CLAUDE.md §4)
   - Supabase Realtime via WebSocket PURO (protocollo Phoenix):
     niente libreria supabase-js — i browser delle smart TV non riescono
     a eseguirla, mentre WebSocket funziona ovunque. Scritto in ES5.
   - BroadcastChannel: ripiego automatico stesso browser/dispositivo.
   Il protocollo dei messaggi resta invariato:
   {action:'start',id} | {action:'pick',key,si} | {action:'restart'}
   ============================================================ */

/* CONFIG SUPABASE — la *publishable key* è pubblica per design e può stare
   in questo file; mai mettere qui chiavi segrete. */
var SUPABASE_URL = 'https://tfsvggmqdvzefjczflon.supabase.co';
var SUPABASE_KEY = 'sb_publishable_eMLjQPiNdkSQffAwf0xmCA_qtQYKbS6';

/* Alfabeto senza caratteri ambigui (niente 0/O, 1/I/L) per i codici stanza */
var ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function makeRoomCode(len){
  var c = '';
  for(var i = 0; i < (len || 4); i++){
    c += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)];
  }
  return c;
}

function supabaseReady(){
  return !!(SUPABASE_URL && SUPABASE_KEY && typeof window !== 'undefined' && window.WebSocket);
}

/* Crea il trasporto per una stanza.
   - roomCode: codice stanza (null = solo BroadcastChannel locale)
   - onMessage(data, via): chiamato per ogni messaggio ricevuto ('online'|'local')
   - onStatus(state): 'online' (canale stanza attivo) | 'local' (solo stesso
     dispositivo) | 'reconnecting' (connessione caduta dopo essere stata
     attiva, riconnessione automatica in corso) | 'error' (canale stanza non
     raggiungibile, riprova da solo)
   Ritorna { room, send(data) }: send pubblica su entrambi i trasporti. */
function createTransport(roomCode, onMessage, onStatus){
  var bc = null, ws = null;
  var topic = 'realtime:storie-' + roomCode;
  var joined = false, refCounter = 1, hbTimer = null;
  /* everJoined distingue "mai riuscito a collegarmi" (error) da "connessione
     caduta dopo essere stata attiva" (reconnecting); hbWatchdog rileva le
     connessioni MORTE senza evento close (es. TV che perde la rete):
     se dopo un heartbeat non arriva nulla dal server, chiudiamo noi il
     socket per innescare la riconnessione automatica. */
  var everJoined = false, hbWatchdog = null;

  /* Deduplica: lo stesso messaggio può arrivare sia via BroadcastChannel sia
     via canale online (telefono e TV sullo stesso dispositivo E nella stanza).
     Ogni send() marca il messaggio con un id; il secondo arrivo viene ignorato. */
  var seen = [];
  function deliver(data, via){
    if(data && data._mid){
      if(seen.indexOf(data._mid) !== -1) return;
      seen.push(data._mid);
      if(seen.length > 30) seen.shift();
    }
    onMessage(data, via);
  }

  try{
    bc = new BroadcastChannel('storie-interattive');
    bc.onmessage = function(e){ deliver(e.data, 'local'); };
  }catch(err){}

  function wsSend(obj){
    try{
      if(ws && ws.readyState === 1) ws.send(JSON.stringify(obj));
    }catch(err){}
  }

  /* Client minimale del protocollo Phoenix usato da Supabase Realtime:
     join del canale, heartbeat periodico, eventi broadcast, riconnessione. */
  function connect(){
    var url = SUPABASE_URL.replace(/^http/, 'ws')
            + '/realtime/v1/websocket?apikey=' + SUPABASE_KEY + '&vsn=1.0.0';
    try{ ws = new WebSocket(url); }
    catch(err){ if(onStatus) onStatus('error'); return; }

    ws.onopen = function(){
      wsSend({
        topic: topic,
        event: 'phx_join',
        payload: {
          config: { broadcast: { self: false, ack: false }, presence: { key: '' }, postgres_changes: [] },
          access_token: SUPABASE_KEY
        },
        ref: String(refCounter++)
      });
      hbTimer = setInterval(function(){
        wsSend({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(refCounter++) });
        /* watchdog: se entro 10s dall'heartbeat non arriva NULLA dal server,
           la connessione è morta anche se il browser non ha emesso close */
        if(hbWatchdog) clearTimeout(hbWatchdog);
        hbWatchdog = setTimeout(function(){
          try{ ws.close(); }catch(err){}
        }, 10000);
      }, 25000);
    };

    ws.onmessage = function(e){
      /* qualunque messaggio dal server prova che il collegamento è vivo */
      if(hbWatchdog){ clearTimeout(hbWatchdog); hbWatchdog = null; }
      var m;
      try{ m = JSON.parse(e.data); }catch(err){ return; }
      if(m.topic !== topic) return;
      if(m.event === 'phx_reply' && m.payload && m.payload.status === 'ok' && !joined){
        joined = true;
        everJoined = true;
        if(onStatus) onStatus('online');
      }
      if(m.event === 'broadcast' && m.payload && m.payload.event === 'msg'){
        deliver(m.payload.payload, 'online');
      }
    };

    ws.onclose = function(){
      if(hbTimer){ clearInterval(hbTimer); hbTimer = null; }
      if(hbWatchdog){ clearTimeout(hbWatchdog); hbWatchdog = null; }
      joined = false;
      /* se la stanza era già stata attiva, segnala la riconnessione in corso
         (feedback UI); se non lo è mai stata, si continua a riprovare in
         silenzio come prima */
      if(everJoined && onStatus) onStatus('reconnecting');
      /* riconnessione automatica con attesa fissa */
      setTimeout(connect, 3000);
    };
  }

  if(supabaseReady() && roomCode){
    connect();
  } else {
    if(onStatus) onStatus('local');
  }

  return {
    room: roomCode,
    send: function(data){
      var msg = { _mid: Date.now().toString(36) + Math.random().toString(36).slice(2, 8) };
      for(var k in data){ if(Object.prototype.hasOwnProperty.call(data, k)) msg[k] = data[k]; }
      try{ if(bc) bc.postMessage(msg); }catch(err){}
      if(joined) wsSend({
        topic: topic,
        event: 'broadcast',
        payload: { type: 'broadcast', event: 'msg', payload: msg },
        ref: String(refCounter++)
      });
    }
  };
}
