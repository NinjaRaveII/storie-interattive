/* ============================================================
   TRANSPORT.JS — comunicazione TV ↔ controller (vedi CLAUDE.md §4)
   - Supabase Realtime: canale broadcast per stanza (cross-device)
   - BroadcastChannel: ripiego automatico stesso browser/dispositivo
   Il protocollo dei messaggi resta invariato:
   {action:'start',id} | {action:'pick',key,si} | {action:'restart'}
   ============================================================ */

/* CONFIG SUPABASE — da compilare dopo aver creato il progetto su supabase.com
   (Fase 1 punto 1 di CLAUDE.md §10). La *publishable key* è pubblica per
   design e può stare in questo file; mai mettere qui chiavi segrete. */
const SUPABASE_URL = '';   /* es. 'https://abcdefgh.supabase.co' */
const SUPABASE_KEY = '';   /* la publishable (anon) key del progetto */

/* Alfabeto senza caratteri ambigui (niente 0/O, 1/I/L) per i codici stanza */
const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function makeRoomCode(len){
  let c = '';
  for(let i = 0; i < (len || 4); i++){
    c += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)];
  }
  return c;
}

function supabaseReady(){
  return !!(SUPABASE_URL && SUPABASE_KEY && typeof window !== 'undefined' && window.supabase);
}

/* Crea il trasporto per una stanza.
   - roomCode: codice stanza (null = solo BroadcastChannel locale)
   - onMessage(data, via): chiamato per ogni messaggio ricevuto ('online'|'local')
   - onStatus(state): 'online' (canale stanza attivo) | 'local' (solo stesso
     dispositivo) | 'error' (canale stanza non raggiungibile)
   Ritorna { room, send(data) }: send pubblica su entrambi i trasporti. */
function createTransport(roomCode, onMessage, onStatus){
  let bc = null, channel = null;

  try{
    bc = new BroadcastChannel('storie-interattive');
    bc.onmessage = (e)=> onMessage(e.data, 'local');
  }catch(err){}

  if(supabaseReady() && roomCode){
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    channel = client.channel('storie-' + roomCode);
    channel.on('broadcast', { event:'msg' }, (m)=> onMessage(m.payload, 'online'));
    channel.subscribe((status)=>{
      if(status === 'SUBSCRIBED'){ if(onStatus) onStatus('online'); }
      else if(status === 'CHANNEL_ERROR' || status === 'TIMED_OUT'){ if(onStatus) onStatus('error'); }
    });
  } else {
    if(onStatus) onStatus('local');
  }

  return {
    room: roomCode,
    send(data){
      try{ if(bc) bc.postMessage(data); }catch(err){}
      if(channel) channel.send({ type:'broadcast', event:'msg', payload:data });
    }
  };
}
