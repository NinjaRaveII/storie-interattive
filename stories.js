/* ============================================================
   STORIES.JS — FONTE UNICA DEI DATI DELLE STORIE
   Usato da:
   - tv.html         → struttura completa (steps, testi, keyword, finali)
   - controller.html → deriva la vista ridotta: scelte da steps, anteprime da ctrl
   - generate-audio.mjs (Node) → deriva i testi per gli mp3 da steps
   Aggiungere una storia = aggiungere UN blocco qui (vedi GUIDA_STORIE.md §5),
   poi assegnarla a un regno in REALMS (tv.html).
   ============================================================ */

const STORIES = [
  /* ---- 1. L'OASI DELLE SABBIE DORATE ---- */
  {
    id:'oasis', tag:'Avventura · bambini', icon:'🌵',
    title:'L\'Oasi delle Sabbie Dorate',
    desc:'Una bambina scopre che la fonte del suo villaggio è sparita, e parte a cercarla tra le dune.',
    ctrl:{
      intro:'Sara scopre che la fonte del villaggio è sparita, e un pesce d\'argento le chiede aiuto per ritrovarla…',
      middle:{
        dune:'Sara ha incontrato Sabbiosa, la volpe dorata che sorveglia l\'antico arco di pietra…',
        camel:'Il vecchio Yusuf ricorda qualcosa sulla sorgente perduta tanto tempo fa…',
        wind:'Zefira, lo spirito del vento, la invita a salire in volo sopra le dune…'
      }
    },
    steps:[
      {
        type:'intro', label:'L\'inizio',
        text:'Nel villaggio di sabbia dorata viveva Sara, che ogni mattina riempiva la brocca alla fonte dell\'oasi. Ma quel giorno l\'acqua non c\'era più: solo un piccolo pesce d\'argento la guardava con occhi tristi, immobile sulla sabbia secca. "Aiutami a ritrovare la sorgente," sussurrò il pesce, "e l\'oasi tornerà a vivere." Sara non ci pensò due volte: si mise lo zaino in spalla e uscì tra le dune dorate.',
        keyword:'desert oasis child golden sand adventure',
        choices:[
          {text:'Seguire le dune verso il tramonto', key:'dune'},
          {text:'Chiedere consiglio al vecchio cammelliere Yusuf', key:'camel'},
          {text:'Ascoltare il canto del vento tra le rocce', key:'wind'}
        ]
      },
      {
        type:'middle', label:'Il cuore della storia',
        variants:{
          dune:{
            text:'Le dune la portarono fino a un arco di pietra antica, coperto di incisioni scintillanti. Ai suoi piedi, una piccola volpe color sabbia dorata la osservava con occhi d\'ambra. "Sono Sabbiosa," disse la volpe, "la guardiana di questo arco. Il vento ha sepolto l\'ingresso della sorgente, e da sola non riesco a liberarlo."',
            keyword:'golden sand fox stone arch desert magical',
            choices:[
              {text:'Scavare insieme con le mani', key:'dig'},
              {text:'Chiederle di raccontare la leggenda della fonte', key:'legend'},
              {text:'Offrirle l\'acqua rimasta nella borraccia', key:'water'}
            ]
          },
          camel:{
            text:'Il vecchio Yusuf sedeva all\'ombra della sua tenda, accanto al suo cammello Vento. Ascoltò la storia di Sara con gli occhi socchiusi. "Anch\'io ho visto quella fonte prosciugarsi, quando ero bambino come te," disse infine. "Ma so che è tornata a scorrere una volta. Bisogna solo ricordare come."',
            keyword:'old man camel desert tent storyteller warm light',
            choices:[
              {text:'Chiedergli di raccontare cosa ricorda', key:'memory'},
              {text:'Chiedere la vecchia mappa del pozzo', key:'map'},
              {text:'Chiedergli di accompagnarla', key:'together'}
            ]
          },
          wind:{
            text:'Tra le rocce, il vento sembrava intonare una melodia. Da un turbine di sabbia dorata prese forma Zefira, un uccello fatto di luce e polvere scintillante. "Ti ho sentita arrivare da lontano," disse. "Sali sul mio dorso: da qui in alto tutto si vede meglio."',
            keyword:'shimmering light bird desert wind spirit golden dust',
            choices:[
              {text:'Cantare insieme al vento', key:'sing'},
              {text:'Chiederle della sua famiglia', key:'family'},
              {text:'Chiederle di volare più in alto per guardare dal cielo', key:'sky'}
            ]
          }
        }
      },
      {
        type:'end', label:'Il finale',
        ends:{
          dune_dig:{text:'Sara e Sabbiosa scavarono insieme, i granelli dorati che scivolavano come polvere di stelle. Sotto le loro mani apparvero antiche piastrelle blu, e poi l\'acqua, calda e limpida, che risalì gorgogliando. L\'oasi si risvegliò tutta insieme, e Sabbiosa le si strofinò contro la gamba, felice.', moral:'Le mani che lavorano insieme spostano anche le montagne di sabbia.', keyword:'child fox digging spring water desert oasis blooming'},
          dune_legend:{text:'Sabbiosa raccontò la leggenda: la sorgente torna a scorrere solo per chi sa ascoltare fino in fondo, senza fretta. Sara si sedette e ascoltò ogni parola con il cuore aperto. Quando la volpe finì di parlare, un filo d\'acqua sgorgò lentamente dalla roccia, come se la sabbia avesse solo aspettato qualcuno pronto ad ascoltare.', moral:'Chi ascolta con pazienza trova risposte che la fretta nasconde.', keyword:'child fox listening ancient legend desert stone arch'},
          dune_water:{text:'Sara porse a Sabbiosa l\'ultima acqua della sua borraccia, senza pensarci due volte. Commossa, la volpe scavò con le zampe un varco nascosto sotto l\'arco, rivelando la sorgente segreta. "Chi dona anche l\'ultima goccia," disse Sabbiosa, "merita di trovarne un fiume intero."', moral:'La generosità vera trova sempre il modo di essere ripagata.', keyword:'child sharing water fox desert generosity golden light'},
          camel_memory:{text:'Yusuf chiuse gli occhi e lasciò riaffiorare un ricordo lontano: da bambino aveva visto suo padre inginocchiarsi tra due palme gemelle e cantare piano. Sara lo seguì fino a quelle stesse palme, si inginocchiò, e cantò. La sabbia tremò, e la sorgente tornò a scorrere come cent\'anni prima.', moral:'I ricordi degli anziani sono mappe verso ciò che credevamo perduto.', keyword:'old man memory twin palm trees desert spring returning'},
          camel_map:{text:'Yusuf tirò fuori da un baule una mappa ingiallita, disegnata da suo nonno. Seguendola tra le dune, Sara trovò due rocce gemelle proprio come indicato, e sotto di esse un pozzo coperto di sabbia. Con un ultimo colpo di vento, la sabbia si aprì e l\'acqua tornò a brillare.', moral:'Le conoscenze tramandate ci guidano anche quando la strada sembra scomparsa.', keyword:'old map desert twin rocks hidden well discovery'},
          camel_together:{text:'Yusuf e il suo cammello Vento accompagnarono Sara per tutto il viaggio, portando in groppa gli otri vuoti. Quando finalmente trovarono la sorgente, la riempirono tutti insieme, ridendo per la fatica e la gioia. Tornarono al villaggio in tre, con l\'acqua che scintillava sotto il sole.', moral:'Il cammino più lungo si accorcia quando lo si percorre in compagnia.', keyword:'old man camel child desert journey together water'},
          wind_sing:{text:'Sara cantò insieme a Zefira, e le loro voci si intrecciarono nel vento come un unico canto dorato. La melodia scivolò tra le rocce fino a un\'antica crepa sigillata, che si spezzò dolcemente lasciando scorrere l\'acqua. "La musica apre porte che la forza non troverebbe mai," disse Zefira sorridendo di luce.', moral:'Un canto sincero può aprire varchi che nessuna forza saprebbe trovare.', keyword:'child singing light bird desert crack rock water flowing'},
          wind_family:{text:'Zefira raccontò di essere l\'ultima di una lunga stirpe di spiriti del vento, custodi dell\'oasi da generazioni. "Quando la mia famiglia se ne andò, nessuno rimase a cantare alla sorgente," disse con tristezza dolce. Sara le promise che sarebbe tornata spesso a cantare con lei, e la sorgente, sentendosi di nuovo custodita, ricominciò a scorrere.', moral:'Le cose importanti fioriscono quando qualcuno promette di prendersene cura.', keyword:'light bird child desert promise ancestral spring golden'},
          wind_sky:{text:'Zefira volò altissima sopra le dune, e da lassù Sara vide una macchia verde scura nascosta in una valle che da terra nessuno poteva scorgere. Scesero insieme, e lì, protetta dalle rocce, trovarono la sorgente intatta, che aspettava solo di essere ritrovata dall\'alto.', moral:'A volte basta un nuovo punto di vista per ritrovare ciò che sembrava perduto.', keyword:'child flying light bird desert view hidden valley spring'}
        }
      }
    ]
  },

  /* ---- 2. LA CAMPANA D'ORO DEL VILLAGGIO ---- */
  {
    id:'bell', tag:'Fiaba · bambini', icon:'🏰',
    title:'La Campana d\'Oro del Villaggio',
    desc:'Un bambino scopre che la campana dorata del castello ha smesso di suonare, e cerca di farla tornare a cantare.',
    ctrl:{
      intro:'La campana dorata del castello ha smesso di suonare, e Tobia parte a scoprire perché…',
      middle:{
        tower:'Nella torre, Tobia ha trovato un uovo dorato incrinato e Mastro Nando, il vecchio guardiano…',
        florist:'La fioraia gli ha dato un fiore che brilla, dicendo che condurrà all\'allodola dorata…',
        feathers:'Tra le rose del giardino, Tobia ha trovato l\'allodola dorata, spaventata e in silenzio…'
      }
    },
    steps:[
      {
        type:'intro', label:'L\'inizio',
        text:'Nel villaggio ai piedi del castello dorato viveva Tobia, che ogni mattina si svegliava al suono della grande campana sulla torre. Ma quel giorno il silenzio riempiva le strade: i fiori del mercato erano un po\' appassiti, e i vicini si guardavano tristi senza sapere perché. Il vecchio fornaio gli disse: "Dentro la campana vive un uccellino che canta per farla suonare. Forse è volato via." Tobia annodò le scarpe e corse verso il castello.',
        keyword:'golden castle village child morning bell tower cheerful',
        choices:[
          {text:'Salire sulla torre a controllare la campana', key:'tower'},
          {text:'Chiedere alla fioraia cosa sa degli uccelli canori', key:'florist'},
          {text:'Seguire le piume dorate cadute in piazza', key:'feathers'}
        ]
      },
      {
        type:'middle', label:'Il cuore della storia',
        variants:{
          tower:{
            text:'Salendo i gradini a spirale, Tobia trovò la stanza della campana vuota, tranne un piccolo nido con dentro un uovo dorato incrinato. Da un angolo comparve Mastro Nando, il vecchio guardiano della torre. "Quell\'uovo aspetta solo un po\' di calore per schiudersi," disse con un sorriso stanco, "ma le mie mani ormai tremano troppo."',
            keyword:'castle tower golden egg nest old bell keeper cozy',
            choices:[
              {text:'Aiutarlo a scaldare l\'uovo tra le mani', key:'warm'},
              {text:'Chiedergli di raccontare la storia della campana', key:'story'},
              {text:'Cercare indizi nella stanza della torre', key:'clues'}
            ]
          },
          florist:{
            text:'La fioraia del mercato posò il suo annaffiatoio e sospirò. "La campana canta solo quando un\'allodola dorata vive felice nel giardino del castello," disse, "ma non la vedo da giorni." Gli porse un fiore che brillava appena. "Seguine il profumo: ti condurrà da lei."',
            keyword:'flower seller market glowing flower golden village warm',
            choices:[
              {text:'Seguire il profumo del fiore', key:'scent'},
              {text:'Chiedere dove nidificava l\'allodola', key:'nest'},
              {text:'Piantare il fiore in piazza per farla tornare', key:'plant'}
            ]
          },
          feathers:{
            text:'Le piume dorate lo condussero fino al labirinto di rose nel giardino del castello. Lì, nascosta tra i petali, tremava una piccola allodola dal piumaggio d\'oro. Sembrava spaventata, come se avesse dimenticato come si canta.',
            keyword:'golden lark hiding rose garden maze castle shy bird',
            choices:[
              {text:'Avvicinarsi piano canticchiando una ninna nanna', key:'approach'},
              {text:'Offrirle qualche briciola di pane dorato', key:'crumbs'},
              {text:'Restare ferma vicino a lei e aspettare con pazienza', key:'wait'}
            ]
          }
        }
      },
      {
        type:'end', label:'Il finale',
        ends:{
          tower_warm:{text:'Tobia scaldò l\'uovo tra le mani insieme a Mastro Nando, tenendolo vicino al cuore finché non si schiuse. Ne uscì un\'allodola piccolissima, che lanciò il suo primo verso proprio mentre il sole sorgeva. La campana, come svegliata da quel canto, suonò più dolce che mai.', moral:'Un po\' di cura paziente può far nascere qualcosa di meraviglioso.', keyword:'hatching golden bird tower bell ringing sunrise cheerful'},
          tower_story:{text:'Mastro Nando raccontò che la campana suona solo quando il villaggio è pieno di gioia vera. Tobia allora raccolse fiori da ogni vicino e li portò in cima alla torre, riempiendola di colori e profumi. Sentendo tanta allegria intorno, la campana iniziò a suonare da sola.', moral:'Le storie tramandate custodiscono spesso la chiave per risolvere i problemi di oggi.', keyword:'old man storytelling tower flowers child bell village'},
          tower_clues:{text:'Tra i vecchi ingranaggi della torre, Tobia trovò una scia di piume dorate che scendevano fino al giardino sottostante. Seguendola, scoprì l\'allodola nascosta tra le rose, sola e impaurita. Bastò la sua presenza gentile perché l\'uccellino si fidasse e tornasse a cantare.', moral:'La curiosità, seguita con pazienza, porta sempre a una scoperta.', keyword:'feather trail castle tower garden child discovery golden'},
          florist_scent:{text:'Il profumo del fiore condusse Tobia fino a un angolo segreto del giardino, dove l\'allodola si era rifugiata. Si avvicinò piano, senza far rumore, e le si sedette accanto finché non smise di tremare. Poco dopo, l\'uccellino spiccò il volo cantando verso la torre.', moral:'A volte basta seguire ciò che il cuore riconosce per ritrovare la strada giusta.', keyword:'child following glowing flower scent garden golden bird'},
          florist_nest:{text:'Tobia trovò il vecchio nido dell\'allodola, ormai vuoto e spettinato dal vento. Con rametti e petali lo sistemò con cura, rendendolo di nuovo accogliente. Quando l\'allodola lo vide, tornò subito a viverci, e il giorno dopo la campana suonò come non faceva da tempo.', moral:'Creare un posto accogliente è un modo silenzioso di prendersi cura di qualcuno.', keyword:'child rebuilding nest garden golden lark castle warm'},
          florist_plant:{text:'Tobia piantò il fiore luminoso proprio al centro della piazza, annaffiandolo ogni giorno con pazienza. Pian piano il fiore crebbe, attirando farfalle dorate e, infine, l\'allodola stessa, incuriosita da tanta bellezza. Il giorno del suo ritorno, la campana suonò per tutto il villaggio.', moral:'Coltivare qualcosa di bello, con costanza, richiama sempre la gioia.', keyword:'child planting glowing flower village square butterflies golden'},
          feathers_approach:{text:'Tobia si avvicinò piano canticchiando una ninna nanna che sua nonna gli cantava da piccolo. L\'allodola, rassicurata da quella melodia gentile, uscì dai petali e si unì al canto. Insieme, volarono cantando fino alla torre, e la campana suonò in coro con loro.', moral:'La gentilezza, cantata piano, scioglie anche la paura più grande.', keyword:'child singing lullaby golden bird garden flying together'},
          feathers_crumbs:{text:'Tobia posò qualche briciola di pane dorato vicino all\'allodola, senza avvicinarsi troppo. Piano piano, l\'uccellino si fidò e iniziò a beccare dalla sua mano. Da quel giorno lo seguì ovunque, tornando a cantare felice sulla torre del castello.', moral:'Anche i gesti più piccoli possono costruire una grande fiducia.', keyword:'child feeding golden bird crumbs garden trust castle'},
          feathers_wait:{text:'Tobia restò seduto in silenzio accanto alle rose, senza fretta di muoversi. Con il tempo, l\'allodola smise di tremare e si avvicinò da sola, posandosi sulla sua spalla. Insieme tornarono alla torre, e la campana suonò più forte che mai.', moral:'La pazienza, più della fretta, conquista la fiducia di chi ha paura.', keyword:'child patience golden bird garden trust castle sunset'}
        }
      }
    ]
  },

  /* ---- 3. LA NOTTE DELLE LUCCIOLE ---- */
  {
    id:'firefly', tag:'Buonanotte · bambini', icon:'🐻',
    title:'La Notte delle Lucciole',
    desc:'Un orsetto parte nella notte per scoprire perché le lucciole della Grande Foresta hanno smesso di brillare.',
    ctrl:{
      intro:'Le lucciole della Grande Foresta non si accendono più, e l\'orsetto Bruno parte nella notte per scoprire perché…',
      middle:{
        owl:'Selene la civetta sa dove sono le lucciole: il vento ha portato via la loro canzone della sera…',
        stream:'Lungo il ruscello, Bruno ha trovato Scintilla, una lucciola piccolina con la lucina spenta…',
        oak:'Dalla cima della Grande Quercia, Bruno ha visto le lucciole rifugiate in una valle nascosta…'
      }
    },
    steps:[
      {
        type:'intro', label:'L\'inizio',
        text:'Nel cuore della Grande Foresta viveva Bruno, un orsetto color miele con una sciarpa di muschio verde. Ogni sera, prima di dormire, guardava le lucciole accendersi tra i rami come mille piccole stelle. Ma quella notte la foresta rimase buia: nemmeno una lucina tra le foglie. "Senza le lucciole, i piccoli del bosco non trovano la strada di casa," sussurrò la mamma. Bruno prese il suo vasetto di miele del coraggio e si avviò nel bosco addormentato.',
        keyword:'honey bear cub dark forest night fireflies missing moonlight',
        choices:[
          {text:'Chiedere aiuto a Selene, la vecchia civetta del faggio', key:'owl'},
          {text:'Seguire il ruscello che brilla appena sotto la luna', key:'stream'},
          {text:'Arrampicarsi sulla Grande Quercia per guardare dall\'alto', key:'oak'}
        ]
      },
      {
        type:'middle', label:'Il cuore della storia',
        variants:{
          owl:{
            text:'Selene la civetta aprì un occhio dorato e ascoltò Bruno senza fretta. "Le lucciole non si sono spente," disse piano. "Si sono nascoste nella Radura del Muschio, perché il vento ha portato via la loro canzone della sera. Senza quella melodia, non ricordano più come si brilla."',
            keyword:'wise owl beech tree night forest bear cub talking moonlight',
            choices:[
              {text:'Chiederle di insegnargli la canzone della sera', key:'song'},
              {text:'Farsi guidare da Selene attraverso il bosco', key:'guide'},
              {text:'Partire in cerca del vento per riavere la canzone', key:'wind'}
            ]
          },
          stream:{
            text:'Il ruscello scintillava appena, come se ricordasse la luce delle lucciole. Seguendolo, Bruno trovò una lucciola piccolina seduta su un sasso, con la lucina spenta. "Mi chiamo Scintilla," disse con un filo di voce. "Mi sono persa mentre cercavo la Radura del Muschio, e senza le mie sorelle la mia luce non si accende."',
            keyword:'moonlit stream forest tiny firefly on stone bear cub gentle',
            choices:[
              {text:'Prenderla dolcemente sulla zampa e portarla con sé', key:'carry'},
              {text:'Offrirle un po\' di miele per farle coraggio', key:'honey'},
              {text:'Sedersi accanto a lei e ascoltare la sua storia', key:'listen'}
            ]
          },
          oak:{
            text:'Bruno si arrampicò piano piano, zampa dopo zampa, fino al ramo più alto della Grande Quercia. Da lassù la foresta sembrava un mare scuro e morbido, ma lontano, in una valle nascosta, tremolava un piccolo lago di luce dorata. Le lucciole erano tutte lì, strette insieme come per riscaldarsi.',
            keyword:'bear cub climbing giant oak tree night forest distant golden glow valley',
            choices:[
              {text:'Ricordare bene la strada e correre fino alla valle', key:'path'},
              {text:'Chiamarle dolcemente dal ramo più alto', key:'call'},
              {text:'Chiedere aiuto alla prima stella della sera', key:'star'}
            ]
          }
        }
      },
      {
        type:'end', label:'Il finale',
        ends:{
          owl_song:{text:'Selene insegnò a Bruno la canzone della sera, nota per nota, finché non la seppe a memoria. Nella Radura del Muschio, Bruno la cantò con la sua voce morbida da orsetto, e una dopo l\'altra le lucciole ricominciarono a brillare. La foresta si riempì di lucine, come se le stelle fossero scese a dormire tra i rami.', moral:'Le canzoni gentili sanno riaccendere anche le luci più timide.', keyword:'bear cub singing moss clearing fireflies lighting up forest night'},
          owl_guide:{text:'Selene volò piano da un ramo all\'altro, e Bruno la seguì passo dopo passo nel buio, senza mai avere paura. Insieme arrivarono alla Radura del Muschio, dove le lucciole li aspettavano tremolanti. Vedendo che perfino un orsetto aveva attraversato la notte per loro, ripresero coraggio e tornarono a illuminare tutta la foresta.', moral:'Il buio fa meno paura quando qualcuno cammina con te.', keyword:'owl guiding bear cub dark forest path fireflies clearing'},
          owl_wind:{text:'Bruno trovò il vento addormentato tra le fronde e gli chiese, con la voce più gentile che aveva, di restituire la canzone della sera. Il vento, che non voleva essere dispettoso ma solo giocare, sospirò dolcemente e la canzone tornò a scorrere tra gli alberi. Le lucciole la riconobbero subito e si riaccesero tutte insieme, danzando tra i rami.', moral:'Chiedere con gentilezza apre più porte di mille pretese.', keyword:'bear cub talking to wind forest leaves swirling fireflies dancing'},
          stream_carry:{text:'Bruno prese Scintilla sulla zampa, morbida come un cuscino, e camminò seguendo il ruscello fino alla Radura del Muschio. Quando le sue sorelle la videro arrivare sana e salva, si accesero tutte insieme per la gioia. E la lucina di Scintilla, circondata da tanto affetto, tornò a brillare più forte di tutte.', moral:'Riportare a casa chi si è perso accende una gioia che illumina tutti.', keyword:'bear cub carrying tiny firefly on paw stream night reunion glow'},
          stream_honey:{text:'Bruno aprì il suo vasetto e offrì a Scintilla una goccia di miele dorato. "Sa di sole," sorrise la lucciola, e a quel pensiero caldo la sua lucina fece un piccolo lampo. Con la pancia piena e il cuore leggero, Scintilla guidò Bruno fino alla radura, e la sua luce ritrovata risvegliò quella di tutte le sue sorelle.', moral:'Un piccolo gesto dolce può riaccendere una grande luce.', keyword:'bear cub sharing honey drop firefly glowing forest night warm'},
          stream_listen:{text:'Bruno si sedette sul sasso accanto a Scintilla e ascoltò la sua storia fino in fondo, senza interrompere. Parlando, la lucciola si accorse di ricordare benissimo la strada, e la sua lucina si accese piano piano, come un pensiero che torna. Arrivarono insieme alla radura, dove mille lucine si accesero per salutarli.', moral:'A volte, per ritrovare la propria luce, basta qualcuno che ascolti davvero.', keyword:'bear cub listening tiny firefly stone stream gentle night'},
          oak_path:{text:'Bruno guardò bene la strada dall\'alto: oltre il ruscello, dietro i tre sassi grandi, sotto l\'arco di rami. Poi scese e corse nella notte, ripetendo il percorso a memoria, fino alla valle nascosta. Le lucciole, sorprese che qualcuno le avesse trovate, lo seguirono festanti fino al cuore della foresta, riaccendendola tutta.', moral:'Guardare le cose da lontano aiuta a trovare la strada da vicino.', keyword:'bear cub running forest night path hidden valley fireflies following'},
          oak_call:{text:'Dal ramo più alto, Bruno chiamò le lucciole con la sua voce più dolce, come si chiama un amico che dorme. La sua voce rotolò giù per la valle come una carezza, e le lucine si alzarono in volo una dopo l\'altra, seguendola. In pochi istanti la Grande Quercia si riempì di luci, e la foresta tornò a splendere.', moral:'Una voce gentile arriva più lontano di un grido.', keyword:'bear cub calling from oak treetop fireflies rising valley night glow'},
          oak_star:{text:'Bruno chiese aiuto alla prima stella della sera, che brillava proprio sopra la Quercia. La stella mandò un raggio sottile fino alla valle nascosta, come un sentiero d\'argento nel buio. Le lucciole lo seguirono fino a casa, e per ringraziare la stella danzarono per lei tutta la notte, foresta e cielo che brillavano insieme.', moral:'Anche chi brilla lassù, lontano, è felice di aiutare chi brilla quaggiù.', keyword:'evening star silver beam forest valley fireflies dancing night sky'}
        }
      }
    ]
  }
];

/* ============================================================
   REGNI DELLA MAPPA — usati da tv.html (mappa SVG: shape/label/colori)
   e da controller.html (navigazione regno → storia: id/icon/name/storyIds).
   Un regno senza storie è "bloccato" (mappa) / nascosto (controller).
   ============================================================ */
const REALMS = [
  {
    id:'forest', icon:'🌲', name:'La Grande Foresta',
    desc:'Boschi antichi, animali parlanti e segreti tra le foglie',
    color:'#2d5a27', colorLight:'#4a8c42', colorDark:'#1a3518',
    storyIds:['firefly'],
    /* coordinate SVG del poligono della regione */
    shape:'M 120,80 L 320,60 L 380,160 L 340,260 L 180,280 L 80,200 Z',
    labelX:230, labelY:175,
    /* posizione del marker sulla mappa dipinta (percentuali) */
    mapX:13, mapY:62,
  },
  {
    id:'mountain', icon:'🏔️', name:'Le Cime Tempestose',
    desc:'Vette innevate, cristalli magici e draghi dorati',
    color:'#4a5568', colorLight:'#718096', colorDark:'#2d3748',
    storyIds:[],
    shape:'M 380,60 L 580,40 L 660,120 L 620,220 L 460,240 L 380,160 Z',
    labelX:520, labelY:145,
    mapX:32, mapY:26,
  },
  {
    id:'sea', icon:'🌊', name:'L\'Oceano Profondo',
    desc:'Navi misteriose, abissi senza fondo e segreti del mare',
    color:'#1a4a7a', colorLight:'#2c6fad', colorDark:'#0d2d4f',
    storyIds:[],
    shape:'M 620,220 L 780,180 L 860,300 L 820,420 L 660,440 L 560,360 L 580,260 Z',
    labelX:710, labelY:320,
    mapX:42, mapY:74,
  },
  {
    id:'desert', icon:'🌵', name:'Le Terre Dimenticate',
    desc:'Dune infinite, rovine antiche e tesori sepolti',
    color:'#7a5c1a', colorLight:'#b8882a', colorDark:'#4a380f',
    storyIds:['oasis'],
    shape:'M 80,200 L 180,280 L 200,420 L 100,460 L 20,360 L 40,260 Z',
    labelX:110, labelY:340,
    mapX:82, mapY:80,
  },
  {
    id:'kingdom', icon:'🏰', name:'Le Terre di Mezzo',
    desc:'Castelli dorati, villaggi allegri e campagne fiorite',
    color:'#6b3a8a', colorLight:'#9b5ec4', colorDark:'#3d2050',
    storyIds:['bell'],
    shape:'M 200,420 L 340,260 L 460,240 L 560,360 L 520,500 L 340,540 L 200,500 Z',
    labelX:375, labelY:410,
    mapX:65, mapY:48,
  },
  {
    id:'sky', icon:'✨', name:'Il Cielo Infinito',
    desc:'Stelle danzanti, nuvole abitate e magie senza confini',
    color:'#1a3a6b', colorLight:'#2a5aab', colorDark:'#0d1f3d',
    storyIds:[],
    shape:'M 580,40 L 780,20 L 860,120 L 780,180 L 660,120 Z',
    labelX:720, labelY:100,
    mapX:80, mapY:16,
  },
];

/* Export per Node (generate-audio.mjs); ignorato dal browser */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { STORIES, REALMS };
}
