const fs=require('fs');const html=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
let js=html.split('<script>')[1].split('</script>')[0].replace(/document\.fonts\.load[\s\S]*$/,'');
const stub=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':stub,apply:()=>stub,set:()=>true});
global.document=stub;global.addEventListener=()=>{};global.requestAnimationFrame=()=>{};
const api=new Function(js+'\n;return {LEVELS,S,keys,pressed,startLevel,update,draw,get G(){return G},T};');const A=api();
const {LEVELS,S,keys,pressed,startLevel,update,T}=A;
const frames=(n,k={})=>{for(let i=0;i<n;i++){Object.assign(keys,k);update();for(const p in pressed)pressed[p]=false}};
const assert=(c,m)=>{if(!c){console.error('FAIL',m);process.exitCode=1}else console.log('ok  ',m)};
// nível 1: andar, pular, pegar envelope, pagar deputado, morrer no Jefferson
startLevel(0);let G=A.G;frames(5);assert(G.p.g&&G.p.y===162,'L1 começa no chão');
const x0=G.p.x;frames(30,{ArrowRight:1});keys.ArrowRight=0;assert(G.p.x>x0+30,'L1 anda pra direita');
G.p.x=5*T+2;G.p.y=162;frames(2);pressed.KeyZ=1;frames(1);frames(60);assert(G.p.y<162-40||G.p.g,'L1 pulo alcança plataforma (altura ~3 tiles)');
G.p.x=9*T;G.p.y=7*T+2;G.p.vy=0;frames(5);assert(G.coins===1&&G.C.env===1,'L1 pega envelope');
const d=G.ents.find(e=>e.c==='D');G.p.x=d.x;G.p.y=d.y;frames(2);assert(G.C.paid===1&&G.C.env===0,'L1 paga deputado');
assert(!G.lv.exitOpen(G),'L1 saída fechada antes de pagar todos');
const j=G.ents.find(e=>e.c==='J');G.p.x=j.x;G.p.y=j.y;frames(2);assert(G.dead&&G.why==='default','L1 Jefferson mata');
frames(70);assert(S.screen==='dead'&&S.lives===4,'L1 tela de game over, perde vida');
// nível 2: sentenças caem e matam
startLevel(1);G=A.G;frames(45);assert(G.projs.length>0,'L2 sentenças caem');
G.projs.push({x:G.p.x,y:G.p.y,vx:0,vy:0,w:8,h:10,k:'sent'});frames(1);assert(G.dead,'L2 sentença mata');
// nível 3: pisar no delator mata ele; água mata
startLevel(2);G=A.G;const e3=G.ents.find(e=>e.c==='E');G.p.x=e3.x;G.p.y=e3.y-14;G.p.vy=2;frames(1);assert(e3.dead&&!G.dead,'L3 stomp homologa delator');
G.p.x=16*T;G.p.y=11*T+2;frames(1);assert(G.dead&&G.why==='hazard','L3 lago mata');
// nível 4: dias contam, porta abre, votos
startLevel(3);G=A.G;for(let i=0;i<1800;i++){G.projs.length=0;update()}assert(G.C.days===580&&G.C.open,'L4 580 dias abre a porta em ~30s');
assert(!G.grid.some(r=>r.includes('G')),'L4 grade G removida');
// nível 5: alerta gruda, 3 = morte; pulo mais pesado
startLevel(4);G=A.G;const jv0=G.lv.jumpV(G);G.projs.push({x:G.p.x,y:G.p.y,vx:0,vy:0,w:8,h:10,k:'alert'});frames(1);assert(G.C.alerts===1&&!G.dead&&G.lv.jumpV(G)>jv0,'L5 alerta gruda e pesa o pulo');
G.C.alerts=2;G.projs.push({x:G.p.x,y:G.p.y,vx:0,vy:0,w:8,h:10,k:'alert'});frames(1);assert(G.dead,'L5 terceiro alerta = PF');
// nível 6: invisível atravessa jornalista; Mantega -> Vorcaro abre saída
startLevel(5);G=A.G;const jj=G.ents.find(e=>e.c==='J');G.p.x=jj.x;G.p.y=jj.y;keys.KeyX=1;frames(1);assert(!G.dead&&G.C.inv<100,'L6 invisível atravessa jornalista');
keys.KeyX=0;const v=G.ents.find(e=>e.c==='V');G.p.x=v.x;G.p.y=v.y;frames(2);assert(!G.C.done,'L6 Vorcaro antes do Mantega não conta');
const m=G.ents.find(e=>e.c==="M");G.touchCd=0;G.p.x=m.x;G.p.y=m.y;frames(2);G.touchCd=0;G.p.x=v.x;G.p.y=v.y;frames(2);assert(G.C.met&&G.C.done&&G.lv.exitOpen(G),'L6 Mantega depois Vorcaro abre saída');
// alcance de pulo e pits
const g=.35,v0=6.3;console.log('alcance pulo px:',(v0*v0/(2*g)).toFixed(1),'(precisa >=48)');
