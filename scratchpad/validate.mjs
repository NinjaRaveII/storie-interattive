/* Validazione dati↔asset — rigenerabile, non parte del sito pubblicato.
   Uso: node scratchpad/validate.mjs
   Verifica: struttura step, 9 finali per storia (c1×c2), ctrl.intro/middle,
   presenza immagini/audio attesi per storia, asset medaglie, nessuna chiave
   scelta duplicata. Le storie con end_<c1>.jpg (pattern a 3 immagini) sono
   accettate in alternativa alla end.jpg singola condivisa. */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(process.cwd());
const { STORIES, REALMS } = require(path.join(ROOT, 'stories.js'));

let ok = 0, warn = 0, err = 0;
function pass(msg){ ok++; console.log('  ok   ' + msg); }
function warnMsg(msg){ warn++; console.log('  WARN ' + msg); }
function fail(msg){ err++; console.log('  FAIL ' + msg); }
function exists(p){ return fs.existsSync(path.join(ROOT, p)); }

STORIES.forEach(s => {
  console.log(`\n== ${s.id} ==`);
  const [introStep, middleStep, endStep] = s.steps;

  if (introStep && introStep.type === 'intro' && Array.isArray(introStep.choices) && introStep.choices.length === 3) {
    pass('intro con 3 scelte');
  } else fail('intro mancante o senza 3 scelte');

  const c1keys = (introStep.choices || []).map(c => c.key);
  const dupC1 = c1keys.filter((k, i) => c1keys.indexOf(k) !== i);
  if (dupC1.length) fail('chiavi choice1 duplicate: ' + dupC1.join(',')); else pass('chiavi choice1 uniche');

  if (!s.ctrl || !s.ctrl.intro) fail('ctrl.intro mancante'); else pass('ctrl.intro presente');

  const allEndKeys = [];
  c1keys.forEach(c1 => {
    const variant = middleStep.variants && middleStep.variants[c1];
    if (!variant) { fail(`middle.variants['${c1}'] mancante`); return; }
    if (!s.ctrl || !s.ctrl.middle || !s.ctrl.middle[c1]) warnMsg(`ctrl.middle['${c1}'] mancante`);
    const c2keys = (variant.choices || []).map(c => c.key);
    if (c2keys.length !== 3) fail(`middle['${c1}'] non ha 3 scelte`); else pass(`middle['${c1}'] con 3 scelte`);
    const dupC2 = c2keys.filter((k, i) => c2keys.indexOf(k) !== i);
    if (dupC2.length) fail(`chiavi choice2 duplicate nel ramo '${c1}': ${dupC2.join(',')}`);
    c2keys.forEach(c2 => allEndKeys.push(`${c1}_${c2}`));
  });

  const definedEnds = Object.keys(endStep.ends || {});
  const missingEnds = allEndKeys.filter(k => !definedEnds.includes(k));
  const extraEnds = definedEnds.filter(k => !allEndKeys.includes(k));
  if (missingEnds.length) fail('finali mancanti: ' + missingEnds.join(',')); else pass(`tutti i ${allEndKeys.length} finali raggiungibili sono definiti`);
  if (extraEnds.length) warnMsg('finali definiti ma irraggiungibili: ' + extraEnds.join(','));
  definedEnds.forEach(k => {
    const e = endStep.ends[k];
    if (!e.text || !e.moral) fail(`end['${k}'] senza text o moral`);
  });

  /* asset immagini: intro + 3 middle sempre; end come end.jpg unica OPPURE
     end_<c1>.jpg per ogni ramo (nuovo pattern, con fallback in tv.html) */
  if (exists(`images/${s.id}/intro.jpg`)) pass('images/intro.jpg'); else warnMsg(`manca images/${s.id}/intro.jpg`);
  c1keys.forEach(c1 => {
    if (exists(`images/${s.id}/middle_${c1}.jpg`)) pass(`images/middle_${c1}.jpg`);
    else warnMsg(`manca images/${s.id}/middle_${c1}.jpg`);
  });
  const hasSingleEnd = exists(`images/${s.id}/end.jpg`);
  const endBranchFiles = c1keys.map(c1 => exists(`images/${s.id}/end_${c1}.jpg`));
  const hasAllBranchEnds = endBranchFiles.every(Boolean);
  const hasSomeBranchEnds = endBranchFiles.some(Boolean);
  if (hasAllBranchEnds) pass(`images/end_<c1>.jpg per tutti i ${c1keys.length} rami`);
  else if (hasSingleEnd) pass('images/end.jpg (pattern condiviso)');
  else if (hasSomeBranchEnds) warnMsg('alcune (non tutte) le images/end_<c1>.jpg presenti, e manca end.jpg di fallback');
  else warnMsg(`manca sia images/${s.id}/end.jpg sia le varianti end_<c1>.jpg`);

  /* audio: intro + 3 middle + 9 end (sempre per combinazione completa) */
  if (exists(`audio/${s.id}/intro.mp3`)) pass('audio/intro.mp3'); else warnMsg(`manca audio/${s.id}/intro.mp3`);
  c1keys.forEach(c1 => {
    if (exists(`audio/${s.id}/middle_${c1}.mp3`)) pass(`audio/middle_${c1}.mp3`);
    else warnMsg(`manca audio/${s.id}/middle_${c1}.mp3`);
  });
  definedEnds.forEach(k => {
    if (exists(`audio/${s.id}/end_${k}.mp3`)) pass(`audio/end_${k}.mp3`);
    else warnMsg(`manca audio/${s.id}/end_${k}.mp3`);
  });

  /* asset medaglia protagonista */
  if (exists(`images/medals/${s.id}.png`)) pass(`images/medals/${s.id}.png`);
  else warnMsg(`manca images/medals/${s.id}.png (medaglia protagonista)`);
});

console.log('\n== REALMS ==');
REALMS.forEach(r => {
  if (r.storyIds.length) {
    if (exists(`images/medals/realm_${r.id}.png`)) pass(`images/medals/realm_${r.id}.png`);
    else warnMsg(`manca images/medals/realm_${r.id}.png (regno attivo senza medaglia landmark)`);
  }
  r.storyIds.forEach(sid => {
    if (!STORIES.find(s => s.id === sid)) fail(`REALMS['${r.id}'].storyIds contiene id inesistente: '${sid}'`);
  });
});
if (exists('images/medals/first_story.png')) pass('images/medals/first_story.png'); else warnMsg('manca images/medals/first_story.png');
if (exists('images/map/world.png')) pass('images/map/world.png'); else warnMsg('manca images/map/world.png');

console.log(`\n${ok} ok, ${warn} warning, ${err} errori.`);
process.exit(err > 0 ? 1 : 0);
